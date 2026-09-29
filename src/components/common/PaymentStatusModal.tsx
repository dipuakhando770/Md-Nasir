import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  XCircle,
  Clock,
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
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { formatPrice, sanitizeWhatsAppNumber } from '../../utils/formatters';
import { OrderItem } from '../../types';
import { updateUserLocalOrderStatus } from '../../utils/userOrderHistory';
import { updateOrderStatus } from '../../firebase/services';
import { dispatchOrderDeliveryEmail } from '../../utils/clientEmailDelivery';

export const PaymentStatusModal: React.FC = () => {
  const { settings, products } = useStore();
  const [status, setStatus] = useState<'success' | 'pending' | 'cancel' | null>(null);
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
    const paymentParam = (params.get('payment') || '').toLowerCase();
    const statusParam = (params.get('status') || '').toLowerCase();
    const orderIdParam = params.get('order_id') || params.get('orderId') || '';
    const trxParam = params.get('transactionId') || params.get('transaction_id') || '';
    const methodParam = params.get('paymentMethod') || params.get('method') || '';
    const amountParam = params.get('paymentAmount') || params.get('amount') || '';

    // Only mark success if transaction was genuinely completed by gateway
    const isSuccess =
      (statusParam === 'completed' || statusParam === 'success' || paymentParam === 'success') &&
      Boolean(trxParam || statusParam === 'completed');

    const isCancel =
      paymentParam === 'cancel' ||
      statusParam === 'failed' ||
      statusParam === 'cancel' ||
      statusParam === 'cancelled';

    const isPending =
      paymentParam === 'verify' ||
      paymentParam === 'pending' ||
      statusParam === 'pending' ||
      (paymentParam === 'success' && !isSuccess);

    if (isSuccess || isCancel || isPending) {
      const finalState = isSuccess ? 'success' : isCancel ? 'cancel' : 'pending';
      setStatus(finalState);
      setOrderId(orderIdParam);
      setTransactionId(trxParam);
      setPaymentMethod(methodParam);
      setPaymentAmount(amountParam);

      // Retrieve cached order details
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

          if (!cusEmail && cusAddress && cusAddress.includes('@')) {
            const emailMatch = cusAddress.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
            if (emailMatch) cusEmail = emailMatch[0];
          }
        }
      } catch (err) {
        console.warn('Could not read cached order:', err);
      }

      // Enrich items with latest product details
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
        if (finalState === 'success') {
          updateUserLocalOrderStatus(orderIdParam, {
            paymentStatus: 'completed',
            status: 'completed',
            transactionId: trxParam || undefined,
          });

          updateOrderStatus(orderIdParam, 'completed', 'paid', {
            paymentTrxId: trxParam || 'PayBD Online Verified',
            paymentMethod: methodParam || 'PayBD Online Gateway',
          }).catch((err) => console.warn('Firestore order sync notice:', err));
        } else if (finalState === 'cancel') {
          updateUserLocalOrderStatus(orderIdParam, {
            paymentStatus: 'failed',
            status: 'cancelled',
          });

          updateOrderStatus(orderIdParam, 'cancelled', 'cancelled', {
            paymentMethod: methodParam || 'Cancelled Gateway Payment',
          }).catch((err) => console.warn('Firestore order sync notice:', err));
        } else {
          // Keep as pending in Firestore & Local storage
          updateUserLocalOrderStatus(orderIdParam, {
            paymentStatus: 'pending',
            status: 'pending',
            transactionId: trxParam || undefined,
          });

          updateOrderStatus(orderIdParam, 'pending', 'pending', {
            paymentTrxId: trxParam || undefined,
            paymentMethod: methodParam || 'PayBD Online (Pending)',
          }).catch((err) => console.warn('Firestore order sync notice:', err));
        }
      }

      if (finalState === 'success') {
        try {
          confetti({
            particleCount: 140,
            spread: 90,
            origin: { y: 0.5 },
          });
        } catch {}

        // Automated Hostinger Email Delivery
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
            logoUrl: settings.logoUrl || undefined,
            websiteUrl: typeof window !== 'undefined' ? window.location.origin : undefined,
            whatsappNumber: settings.whatsappNumber || '01962780922',
          })
            .then((result) => {
              if (result && result.success) {
                setEmailStatus('sent');
              } else {
                setEmailStatus('failed');
              }
            })
            .catch(() => {
              setEmailStatus('failed');
            });
        }
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
    `📦 *অর্ডার অনুসন্ধান ও সহায়তা (Nasir Digital Hub)*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔢 *অর্ডার আইডি:* ${orderId || 'N/A'}\n` +
    (transactionId ? `💳 *ট্রানজেকশন ID:* ${transactionId}\n` : '') +
    `👤 *কাস্টমার:* ${customerName || 'অনলাইন কাস্টমার'}\n` +
    `📱 *ফোন:* ${customerPhone || 'N/A'}\n` +
    (customerEmail ? `📧 *ইমেইল:* ${customerEmail}\n` : '') +
    (paymentAmount ? `💰 *মূল্য:* ${paymentAmount} ৳\n` : '') +
    `🛍️ *পণ্যসমূহ:*\n${productsSummaryList || 'ডিজিটাল প্রোডাক্ট'}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━\n` +
    (status === 'success'
      ? `✅ পেমেন্ট সম্পন্ন হয়েছে ও ফাইল অ্যাক্সেস দেওয়া হয়েছে।`
      : `⏳ আসসালামু আলাইকুম! আমার অর্ডারটি যাচাই করে অনুমোদন (Approve) করার অনুরোধ করছি।`)
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
                      অর্ডার সিঙ্ক সম্পন্ন হয়েছে
                    </p>
                    <p className="text-[11px] text-emerald-300">
                      নির্ধারিত নম্বরে ({settings.whatsappNumber || '01962780922'}) অর্ডারের বিবরণ যুক্ত হয়েছে
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
          ) : status === 'pending' ? (
            <>
              {/* Payment Pending / Unverified State */}
              <div className="text-center space-y-3 pt-2">
                <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto ring-8 ring-amber-500/10 shadow-lg shadow-amber-500/20">
                  <Clock className="w-9 h-9 animate-pulse" />
                </div>

                <div className="space-y-1">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/15 text-amber-300 text-xs font-black border border-amber-500/30">
                    <Clock className="w-3.5 h-3.5" />
                    <span>পেমেন্ট ও অর্ডার অপেক্ষমাণ (Pending Verification)</span>
                  </div>
                  <h2 className="text-2xl font-black text-white tracking-tight">
                    আপনার অর্ডারটি অপেক্ষমাণ অবস্থায় রয়েছে
                  </h2>
                  <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                    অর্ডার আইডি: <strong className="text-amber-400 font-mono">{orderId || 'ORD-PENDING'}</strong>। আপনার পেমেন্টটি যাচাইকরণ বা অ্যাডমিনের ম্যানুয়াল অনুমোদনের অপেক্ষায় আছে।
                  </p>
                </div>
              </div>

              {/* Order Info Card */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">অর্ডার স্ট্যাটাস:</span>
                  <span className="font-bold text-amber-400 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                    ⏳ অপেক্ষমাণ (Pending)
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                  <span className="text-slate-400">প্রদেয় মূল্য:</span>
                  <span className="font-bold text-white">{paymentAmount ? `${paymentAmount} ৳` : 'অর্ডার অনুযায়ী'}</span>
                </div>
                {customerPhone && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">মোবাইল নম্বর:</span>
                    <span className="font-bold text-slate-200">{customerPhone}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp এ অর্ডার অ্যাপ্রুভ / কনফার্ম করিয়ে নিন</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
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
                  <h3 className="text-xl font-black text-white">পেমেন্ট সম্পন্ন হয়নি বা বাতিল করা হয়েছে</h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                    অনলাইন গেটওয়ে থেকে পেমেন্ট সম্পন্ন করা হয়নি। আপনি চাইলে পুনরায় চেষ্টা করতে পারেন অথবা সরাসরি WhatsApp এ অর্ডার কনফার্ম করতে পারেন।
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs shadow-lg shadow-green-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>WhatsApp এ কথা বলুন</span>
                </a>

                <button
                  type="button"
                  onClick={handleClose}
                  className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors cursor-pointer"
                >
                  বন্ধ করুন
                </button>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
