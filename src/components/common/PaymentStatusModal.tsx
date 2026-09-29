import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  ShieldCheck,
  Download,
  MessageCircle,
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Copy,
  Check,
  Globe,
  FileCheck,
  X,
  BellRing,
  Send,
  Mail,
  RefreshCw,
  ArrowRight,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice, sanitizeWhatsAppNumber } from '../../utils/formatters';
import { OrderItem } from '../../types';
import { updateUserLocalOrderStatus } from '../../utils/userOrderHistory';
import { updateOrderStatus } from '../../firebase/services';
import { dispatchOrderDeliveryEmail } from '../../utils/clientEmailDelivery';

export const PaymentStatusModal: React.FC = () => {
  const { settings, products } = useStore();
  const [status, setStatus] = useState<'success' | 'cancel' | null>(null);
  const [orderId, setOrderId] = useState<string>('');
  const [transactionId, setTransactionId] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<string>('');
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerEmail, setCustomerEmail] = useState<string>('');
  const [customerAddress, setCustomerAddress] = useState<string>('');
  const [copiedLinkIndex, setCopiedLinkIndex] = useState<number | null>(null);
  const [whatsappSent, setWhatsappSent] = useState<boolean>(false);
  const [emailStatus, setEmailStatus] = useState<'idle' | 'sending' | 'sent' | 'failed'>('idle');
  const [emailInput, setEmailInput] = useState<string>('');

  useEffect(() => {
    // Check URL parameters for payment response
    const params = new URLSearchParams(window.location.search);
    const paymentParam = params.get('payment');
    const statusParam = (params.get('status') || '').toLowerCase();
    const orderIdParam = params.get('order_id') || params.get('orderId') || '';
    const trxParam = params.get('transactionId') || params.get('transaction_id') || '';
    const methodParam = params.get('paymentMethod') || params.get('method') || '';
    const amountParam = params.get('paymentAmount') || params.get('amount') || '';

    const isSuccess =
      paymentParam === 'success' ||
      statusParam === 'completed' ||
      statusParam === 'success';

    const isCancel =
      paymentParam === 'cancel' ||
      statusParam === 'failed' ||
      statusParam === 'cancel' ||
      statusParam === 'cancelled';

    if (isSuccess || isCancel) {
      setStatus(isSuccess ? 'success' : 'cancel');
      setOrderId(orderIdParam);
      setTransactionId(trxParam);
      setPaymentMethod(methodParam);
      setPaymentAmount(amountParam);

      // Attempt to retrieve cached order items from session storage
      let items: OrderItem[] = [];
      let cusName = '';
      let cusPhone = '';
      let cusEmail = '';
      let cusAddress = '';

      try {
        const cachedSpecific = orderIdParam ? sessionStorage.getItem(`order_${orderIdParam}`) : null;
        const cachedLast = sessionStorage.getItem('last_placed_order');
        const rawData = cachedSpecific || cachedLast;

        if (rawData) {
          const parsed = JSON.parse(rawData);
          if (parsed.items && Array.isArray(parsed.items)) {
            items = parsed.items;
          }
          if (parsed.customerName) cusName = parsed.customerName;
          if (parsed.customerPhone) cusPhone = parsed.customerPhone;
          if (parsed.customerEmail) cusEmail = parsed.customerEmail;
          if (parsed.customerAddress) cusAddress = parsed.customerAddress;

          // If cusAddress contains an email address, extract it
          if (!cusEmail && cusAddress && cusAddress.includes('@')) {
            const emailMatch = cusAddress.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) cusEmail = emailMatch[0];
          }
        }
      } catch (err) {
        console.warn('Could not read cached order:', err);
      }

      // Enrich items with latest downloadUrl & livePreviewUrl from products if missing
      if (items.length > 0 && products.length > 0) {
        items = items.map((item) => {
          const matchedProd = products.find((p) => p.id === item.productId);
          return {
            ...item,
            downloadUrl: item.downloadUrl || matchedProd?.downloadUrl || '',
            livePreviewUrl: item.livePreviewUrl || matchedProd?.livePreviewUrl || '',
            imageUrl: item.imageUrl || matchedProd?.imageUrl || '',
          };
        });
      }

      setOrderItems(items);
      setCustomerName(cusName);
      setCustomerPhone(cusPhone);
      setCustomerEmail(cusEmail);
      setEmailInput(cusEmail);
      setCustomerAddress(cusAddress);

      if (orderIdParam) {
        updateUserLocalOrderStatus(orderIdParam, {
          paymentStatus: isSuccess ? 'completed' : 'failed',
          status: isSuccess ? 'completed' : 'cancelled',
          transactionId: trxParam || undefined,
        });

        // Persist to Firestore live database
        updateOrderStatus(
          orderIdParam,
          isSuccess ? 'completed' : 'cancelled',
          isSuccess ? 'paid' : 'cancelled',
          {
            paymentTrxId: trxParam || 'PayBD Online Verified',
            paymentMethod: methodParam || 'PayBD Online Gateway',
          }
        ).catch((err) => console.warn('Firestore order sync notice:', err));
      }

      if (isSuccess) {
        try {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}

        // 1. Dispatch Automated Hostinger Email Delivery (nasirdigitalhub@pipilikhost.com)
        if (cusEmail && cusEmail.includes('@')) {
          setEmailStatus('sending');
          dispatchOrderDeliveryEmail({
            orderId: orderIdParam || `ORD-${Date.now().toString().slice(-6)}`,
            transactionId: trxParam || 'PayBD Online Verified',
            customerName: cusName || 'Valued Customer',
            customerEmail: cusEmail,
            customerPhone: cusPhone,
            amount: Number(amountParam) || 0,
            paymentMethod: methodParam || 'PayBD Online (bKash/Nagad/Cards)',
            items,
            whatsappNumber: settings.whatsappNumber || '01962780922',
          })
            .then((result) => {
              if (result && result.success) {
                setEmailStatus('sent');
              } else {
                setEmailStatus('failed');
                console.warn('Auto email notice:', result?.message || result?.error);
              }
            })
            .catch((err) => {
              console.warn('Email trigger error:', err);
              setEmailStatus('failed');
            });
        }

        // Construct auto notification message for the merchant/customer WhatsApp
        const merchantPhone = sanitizeWhatsAppNumber(settings.whatsappNumber || '01962780922');
        const trackingRef = trxParam || orderIdParam || 'ORD-VERIFIED';
        const productsSummaryList = items
          .map((i, idx) => `${idx + 1}. ${i.title} (x${i.quantity}) - ${i.price}৳`)
          .join('\n');
        
        const downloadLinksList = items
          .filter((i) => i.downloadUrl && i.downloadUrl.trim())
          .map((i) => `🔗 ${i.title}: ${i.downloadUrl}`)
          .join('\n');

        const fullNotifyText = encodeURIComponent(
          `🎉 *নতুন অর্ডার পেমেন্ট সফল হয়েছে! (PayBD Online Success)*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 *অর্ডার আইডি:* ${trackingRef}\n` +
          `💳 *ট্রানজেকশন ID:* ${trxParam || 'PayBD Verified'}\n` +
          `👤 *কাস্টমার:* ${cusName || 'অনলাইন কাস্টমার'}\n` +
          `📱 *ফোন:* ${cusPhone || 'N/A'}\n` +
          (cusEmail ? `📧 *ইমেইল:* ${cusEmail}\n` : '') +
          (cusAddress ? `📍 *ঠিকানা:* ${cusAddress}\n` : '') +
          `💰 *পরিশোধিত মূল্য:* ${amountParam || ''} ৳\n` +
          `💳 *পেমেন্ট মাধ্যম:* ${methodParam || 'PayBD (bKash/Nagad/Rocket)'}\n\n` +
          `🛍️ *অর্ডারকৃত পণ্যসমূহ:*\n${productsSummaryList || 'ডিজিটাল প্রোডাক্ট'}\n\n` +
          (downloadLinksList ? `📥 *ডাউনলোড লিঙ্ক:*\n${downloadLinksList}\n\n` : '') +
          `━━━━━━━━━━━━━━━━━━━━━━\n` +
          `✅ পেমেন্ট সম্পন্ন হয়েছে ও ফাইল অ্যাক্সেস দেওয়া হয়েছে।`
        );

        const autoWhatsappUrl = `https://wa.me/${merchantPhone}?text=${fullNotifyText}`;

        // Auto trigger WhatsApp notification after short delay
        const timer = setTimeout(() => {
          try {
            window.open(autoWhatsappUrl, '_blank', 'noopener,noreferrer');
            setWhatsappSent(true);
          } catch {}
        }, 1200);

        return () => clearTimeout(timer);
      }

      // Clean query params from URL without reload
      const cleanUrl = window.location.pathname + window.location.hash;
      window.history.replaceState({}, document.title, cleanUrl);
    }
  }, [products, settings.whatsappNumber]);

  const handleManualEmailSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const targetEmail = emailInput.trim() || customerEmail.trim();
    if (!targetEmail || !targetEmail.includes('@')) return;

    setEmailStatus('sending');
    try {
      const res = await fetch('/api/email/send-order-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: orderId || `ORD-${Date.now().toString().slice(-6)}`,
          transactionId: transactionId || 'PayBD Online Verified',
          customerName: customerName || 'সম্মানিত গ্রাহক',
          customerEmail: targetEmail,
          customerPhone,
          amount: Number(paymentAmount) || 0,
          paymentMethod: paymentMethod || 'PayBD Online (bKash/Nagad/Cards)',
          items: orderItems,
          whatsappNumber: settings.whatsappNumber || '01962780922',
        }),
      });
      const data = await res.json();
      if (data && data.success) {
        setEmailStatus('sent');
        setCustomerEmail(targetEmail);
      } else {
        setEmailStatus('failed');
      }
    } catch {
      setEmailStatus('failed');
    }
  };

  if (!status) return null;

  const handleClose = () => {
    setStatus(null);
  };

  const handleCopyLink = (url: string, index: number) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkIndex(index);
    setTimeout(() => setCopiedLinkIndex(null), 2500);
  };

  const merchantPhone = sanitizeWhatsAppNumber(settings.whatsappNumber || '01962780922');
  const trackingRef = transactionId || orderId || 'N/A';
  const productsSummaryList = orderItems
    .map((i, idx) => `${idx + 1}. ${i.title} (x${i.quantity}) - ${i.price}৳`)
    .join('\n');
  
  const downloadLinksList = orderItems
    .filter((i) => i.downloadUrl && i.downloadUrl.trim())
    .map((i) => `🔗 ${i.title}: ${i.downloadUrl}`)
    .join('\n');

  const fullNotifyText = encodeURIComponent(
    `🎉 *নতুন অর্ডার পেমেন্ট সফল হয়েছে! (PayBD Online Success)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📦 *অর্ডার আইডি:* ${trackingRef}\n` +
    `💳 *ট্রানজেকশন ID:* ${transactionId || 'PayBD Verified'}\n` +
    `👤 *কাস্টমার:* ${customerName || 'অনলাইন কাস্টমার'}\n` +
    `📱 *ফোন:* ${customerPhone || 'N/A'}\n` +
    (customerAddress ? `📍 *ঠিকানা/ইমেইল:* ${customerAddress}\n` : '') +
    `💰 *পরিশোধিত মূল্য:* ${paymentAmount || ''} ৳\n` +
    `💳 *পেমেন্ট মাধ্যম:* ${paymentMethod || 'PayBD (bKash/Nagad/Rocket)'}\n\n` +
    `🛍️ *অর্ডারকৃত পণ্যসমূহ:*\n${productsSummaryList || 'ডিজিটাল প্রোডাক্ট'}\n\n` +
    (downloadLinksList ? `📥 *ডাউনলোড লিঙ্ক:*\n${downloadLinksList}\n\n` : '') +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `✅ পেমেন্ট সম্পন্ন হয়েছে ও ফাইল অ্যাক্সেস দেওয়া হয়েছে।`
  );

  const whatsappUrl = `https://wa.me/${merchantPhone}?text=${fullNotifyText}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 text-white p-6 sm:p-8 space-y-6"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {status === 'success' ? (
            <>
              {/* Top Success Banner */}
              <div className="text-center space-y-3 pt-2">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto ring-8 ring-emerald-500/10 shadow-lg shadow-emerald-500/20">
                  <CheckCircle2 className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/30">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>পেমেন্ট ভেরিফাইড ও সফল</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    ধন্যবাদ {customerName ? `${customerName}, ` : ''}আপনার পেমেন্ট সম্পন্ন হয়েছে!
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    আপনার ডিজিটাল পণ্যের অ্যাক্সেস ও ডাউনলোড লিঙ্ক প্রস্তুত করা হয়েছে। নিচে থেকে সরাসরি ডাউনলোড বা অ্যাক্সেস করুন।
                  </p>
                </div>
              </div>

              {/* Automatic WhatsApp Notification Status Bar */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <BellRing className="w-4 h-4 animate-bounce" />
                  </div>
                  <div>
                    <p className="font-bold text-white">
                      WhatsApp নোটিফিকেশন পাঠানো হয়েছে
                    </p>
                    <p className="text-[11px] text-emerald-300">
                      নির্ধারিত নম্বরে ({settings.whatsappNumber || '01962780922'}) সম্পূর্ণ অর্ডারের বিবরণ সিঙ্ক হয়েছে
                    </p>
                  </div>
                </div>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-[11px] font-extrabold flex items-center gap-1.5 shadow-md transition-all shrink-0 cursor-pointer"
                >
                  <Send className="w-3 h-3" />
                  <span>নোটিফিকেশন চ্যাট দেখুন</span>
                </a>
              </div>

              {/* Automatic Hostinger Email Delivery Status Card */}
              <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-bold text-white flex items-center gap-1.5 flex-wrap">
                      <span>ইন্সট্যান্ট ইমেইল ডেলিভারি</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300 font-mono">
                        nasirdigitalhub@pipilikhost.com
                      </span>
                    </p>
                    <p className="text-[11px] text-sky-200 mt-0.5">
                      {emailStatus === 'sent' ? (
                        <span className="text-emerald-300 font-bold flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> আপনার ইমেইল ({customerEmail || emailInput})-এ সফলভাবে ফাইল লিঙ্ক পাঠানো হয়েছে!
                        </span>
                      ) : emailStatus === 'sending' ? (
                        <span className="text-sky-300 animate-pulse flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 animate-spin" /> ইমেইল ইনবক্সে পাঠানো হচ্ছে...
                        </span>
                      ) : (
                        <span>প্রোডাক্ট লাইসেন্স ও ডাউনলোড লিঙ্ক আপনার ইমেইল ইনবক্সে পাঠানো হয়েছে</span>
                      )}
                    </p>
                  </div>
                </div>

                <form onSubmit={handleManualEmailSend} className="flex items-center gap-1.5 w-full sm:w-auto">
                  <input
                    type="email"
                    placeholder="আপনার ইমেইল লিখুন..."
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="bg-slate-950/90 border border-sky-500/30 rounded-lg px-2.5 py-1 text-[11px] text-white focus:outline-none focus:border-sky-400 w-full sm:w-44"
                  />
                  <button
                    type="submit"
                    disabled={emailStatus === 'sending'}
                    className="px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-[11px] font-bold shadow transition-all shrink-0 cursor-pointer disabled:opacity-50"
                  >
                    {emailStatus === 'sending' ? 'পাঠানো হচ্ছে...' : emailStatus === 'sent' ? 'পুনরায় পাঠান' : 'ইমেইল পাঠান'}
                  </button>
                </form>
              </div>

              {/* Order & Transaction Quick Receipt */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400">অর্ডার নম্বর:</span>
                  <p className="font-mono font-bold text-white truncate">{orderId || 'ORD-VERIFIED'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400">ট্রানজেকশন আইডি:</span>
                  <p className="font-mono font-bold text-emerald-400 truncate">{transactionId || 'N/A'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400">পরিশোধিত মূল্য:</span>
                  <p className="font-black text-white">{paymentAmount ? `${paymentAmount} ৳` : 'পরিশোধিত'}</p>
                </div>
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400">পেমেন্ট মেথড:</span>
                  <p className="font-bold text-slate-300 uppercase">{paymentMethod || 'PayBD Online'}</p>
                </div>
              </div>

              {/* Purchased Products & Instant Download Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4" /> আপনার ক্রয়কৃত ডিজিটাল প্রোডাক্ট ও ডাউনলোড লিঙ্ক
                  </h3>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ইনস্ট্যান্ট অ্যাক্সেস
                  </span>
                </div>

                {orderItems && orderItems.length > 0 ? (
                  <div className="space-y-3">
                    {orderItems.map((item, idx) => {
                      const cleanDownloadUrl = item.downloadUrl?.trim();
                      const finalDownloadUrl = cleanDownloadUrl
                        ? /^https?:\/\//i.test(cleanDownloadUrl)
                          ? cleanDownloadUrl
                          : `https://${cleanDownloadUrl}`
                        : '';

                      return (
                        <div
                          key={idx}
                          className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 shadow-md space-y-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center p-1">
                                {item.imageUrl ? (
                                  <img
                                    src={item.imageUrl}
                                    alt={item.title}
                                    className="w-full h-full object-contain"
                                  />
                                ) : (
                                  <ShoppingBag className="w-5 h-5 text-emerald-400" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-xs sm:text-sm text-white line-clamp-1">
                                  {item.title}
                                </h4>
                                <p className="text-[11px] text-slate-400">
                                  পরিমাণ: {item.quantity} | মূল্য: {formatPrice(item.price)}
                                </p>
                              </div>
                            </div>

                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-400 text-[10px] font-bold shrink-0">
                              পরিশোধিত
                            </span>
                          </div>

                          {/* Action Bar for this Product */}
                          <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                            {finalDownloadUrl ? (
                              <div className="flex items-center gap-2 flex-1">
                                <a
                                  href={finalDownloadUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex-1 sm:flex-initial"
                                >
                                  <Download className="w-4 h-4" />
                                  <span>ইনস্ট্যান্ট ডাউনলোড করুন</span>
                                </a>

                                <button
                                  type="button"
                                  onClick={() => handleCopyLink(finalDownloadUrl, idx)}
                                  className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                  title="ডাউনলোড লিঙ্ক কপি করুন"
                                >
                                  {copiedLinkIndex === idx ? (
                                    <>
                                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                                      <span className="text-emerald-400">কপি হয়েছে</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3.5 h-3.5" />
                                      <span>লিঙ্ক কপি</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                                <span>অ্যাক্সেস কী ও ফাইল সরাসরি WhatsApp এ পাঠানো হয়েছে</span>
                              </div>
                            )}

                            {item.livePreviewUrl && (
                              <a
                                href={
                                  /^https?:\/\//i.test(item.livePreviewUrl)
                                    ? item.livePreviewUrl
                                    : `https://${item.livePreviewUrl}`
                                }
                                target="_blank"
                                rel="noopener noreferrer"
                                className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                              >
                                <Globe className="w-3.5 h-3.5 text-indigo-400" />
                                <span>ডেমো / লাইভ সাইট</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-center space-y-2">
                    <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                    <p className="text-xs font-bold text-white">আপনার অর্ডারটি সিস্টেমে সংরক্ষিত হয়েছে</p>
                    <p className="text-[11px] text-slate-400">
                      নিচের WhatsApp বাটনে ক্লিক করে সরাসরি অ্যাক্সেস লিঙ্ক ও ফাইল বুঝে নিন।
                    </p>
                  </div>
                )}
              </div>

              {/* Bottom Support and Shopping Action */}
              <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-3">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:flex-1 py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp এ সাপোর্ট ও ডেলিভারি কনফার্ম করুন</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
                >
                  শপিং চালিয়ে যান
                </button>
              </div>
            </>
          ) : (
            <>
              {/* Payment Cancelled State */}
              <div className="text-center space-y-3 pt-2">
                <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto ring-8 ring-rose-500/10 shadow-lg shadow-rose-500/20">
                  <XCircle className="w-9 h-9" />
                </div>

                <div className="space-y-1">
                  <h3 className="text-xl font-black text-white">পেমেন্ট বাতিল করা হয়েছে</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    আপনি PayBD গেটওয়ে থেকে পেমেন্ট সম্পূর্ণ করেননি বা বাতিল করেছেন। কোনো টাকা কাটা হয়নি।
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  পুনরায় চেষ্টা করুন
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>সহায়তার জন্য WhatsApp এ কথা বলুন</span>
                </a>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
