import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import {
  X,
  MessageCircle,
  ShieldCheck,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
  CreditCard,
  CheckCircle2,
  Lock,
  AlertCircle,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ArrowRight,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';
import { formatPrice, generateWhatsAppOrderUrl, sanitizeWhatsAppNumber } from '../../utils/formatters';
import { createOrder } from '../../firebase/services';
import { analytics } from '../../utils/analytics';
import { saveUserLocalOrder } from '../../utils/userOrderHistory';

export const CheckoutModal: React.FC = () => {
  const { cart, subtotal, deliveryCharge, total, isCheckoutOpen, setIsCheckoutOpen, clearCart } =
    useCart();
  const { settings } = useStore();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'paybd' | 'whatsapp' | 'bKash' | 'Nagad'>(
    settings.paybd?.enabled !== false ? 'paybd' : 'whatsapp'
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [paybdRedirectingUrl, setPaybdRedirectingUrl] = useState<string | null>(null);
  const [activeOrderId, setActiveOrderId] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Track InitiateCheckout when customer opens checkout modal
  React.useEffect(() => {
    if (isCheckoutOpen && cart.length > 0) {
      analytics.trackCheckoutStart(
        cart.map((item) => ({
          productId: item.product.id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
        })),
        total
      );
    }
  }, [isCheckoutOpen]);

  if (!isCheckoutOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanName = customerName.trim();
    const cleanPhone = customerPhone.trim().replace(/[^0-9+]/g, '');
    const cleanEmail = customerEmail.trim();

    if (!cleanName) {
      setErrorMsg('অনুগ্রহ করে আপনার নাম লিখুন।');
      return;
    }

    if (!cleanPhone || cleanPhone.replace(/[^0-9]/g, '').length < 8) {
      setErrorMsg('অনুগ্রহ করে একটি সঠিক মোবাইল বা হোয়াটসঅ্যাপ নম্বর দিন।');
      return;
    }

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setErrorMsg('অনুগ্রহ করে সঠিক ইমেইল এড্রেস প্রদান করুন (পেমেন্টের পর স্বয়ংক্রিয়ভাবে ডাউনলোড লিঙ্ক পাঠানোর জন্য)।');
      return;
    }

    if (cart.length === 0) {
      setErrorMsg('আপনার শপিং ব্যাগ খালি। আগে পণ্য যুক্ত করুন।');
      return;
    }

    setIsSubmitting(true);

    try {
      const orderId = `ORD-${Date.now().toString().slice(-6)}`;
      setActiveOrderId(orderId);

      const orderPayload = {
        customerName: cleanName.slice(0, 150),
        customerPhone: cleanPhone.slice(0, 30),
        customerEmail: cleanEmail.slice(0, 150),
        customerAddress: (customerAddress.trim() || 'ডিজিটাল ডেলিভারি (Online)').slice(0, 500),
        note: (note.trim() || 'অনলাইন অর্ডার').slice(0, 1000),
        items: cart.slice(0, 50).map((item) => ({
          productId: item.product.id,
          title: item.product.title.slice(0, 200),
          price: Math.max(0, Number(item.product.price) || 0),
          quantity: Math.max(1, Math.min(999, Number(item.quantity) || 1)),
          imageUrl: (item.product.imageUrl || '').slice(0, 1000),
          downloadUrl: (item.product.downloadUrl || '').slice(0, 1000),
          livePreviewUrl: (item.product.livePreviewUrl || '').slice(0, 1000),
        })),
        subtotal: Math.max(0, Number(subtotal) || 0),
        deliveryCharge: Math.max(0, Number(deliveryCharge) || 0),
        total: Math.max(0, Number(total) || 0),
        status: 'pending' as const,
        paymentMethod: paymentMethod === 'paybd' ? 'PayBD Online (bKash/Nagad/Cards)' : paymentMethod,
        paymentStatus: 'pending' as const,
        createdAt: Date.now(),
      };

      // Cache order locally for instant retrieval when payment returns
      try {
        sessionStorage.setItem(
          `order_${orderId}`,
          JSON.stringify({ ...orderPayload, orderId })
        );
        sessionStorage.setItem(
          'last_placed_order',
          JSON.stringify({ ...orderPayload, orderId })
        );

        // Permanently record to user's browsing history so it's never lost
        saveUserLocalOrder({
          orderId,
          customerName: cleanName,
          customerPhone: cleanPhone,
          customerEmail: cleanEmail,
          customerAddress: customerAddress.trim() || 'ডিজিটাল ডেলিভারি',
          note: note.trim() || undefined,
          items: orderPayload.items,
          subtotal: orderPayload.subtotal,
          deliveryCharge: orderPayload.deliveryCharge,
          total: orderPayload.total,
          paymentMethod: orderPayload.paymentMethod,
          paymentStatus: 'pending',
          status: 'pending',
          createdAt: Date.now(),
        });
      } catch (err) {
        console.warn('Local order history storage notice:', err);
      }

      // 1. Log order to Firestore
      try {
        await createOrder({ ...orderPayload, id: orderId } as any);
      } catch (firestoreErr) {
        console.warn('Order log notice:', firestoreErr);
      }

      // Track order in real-time analytics
      analytics.trackOrderPlaced(orderId, cleanName, cleanPhone, total);

      // 2. If PayBD Online Payment is selected
      if (paymentMethod === 'paybd') {
        const origin = window.location.origin;
        const response = await fetch('/api/payment/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount: total,
            customerPhone: cleanPhone,
            customerName: cleanName,
            customerEmail: cleanEmail,
            orderId,
            successUrl: `${origin}/?payment=verify&order_id=${orderId}`,
            cancelUrl: `${origin}/?payment=cancel&order_id=${orderId}`,
            apiKey: settings.paybd?.apiKey,
            secretKey: settings.paybd?.secretKey,
            brandKey: settings.paybd?.brandKey,
            gatewayUrl: settings.paybd?.gatewayUrl,
          }),
        });

        const data = await response.json().catch(() => null);

        if (response.ok && data && data.success && data.paymentUrl) {
          clearCart();
          setPaybdRedirectingUrl(data.paymentUrl);

          // Open in a new tab
          const newWindow = window.open(data.paymentUrl, '_blank', 'noopener,noreferrer');
          if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
            console.warn('Popup blocked, customer can click the direct open button');
          }

          return;
        } else {
          const message =
            (data && data.message) ||
            'PayBD অনলাইন গেটওয়েতে সংযোগ করতে সমস্যা হয়েছে। দয়া করে হোয়াটসঅ্যাপে যোগাযোগ করুন।';
          setErrorMsg(message);
          setIsSubmitting(false);
          return;
        }
      }

      // 3. Generate WhatsApp Direct Checkout Link
      const whatsappUrl = generateWhatsAppOrderUrl(
        settings.whatsappNumber || '01864368912',
        {
          name: cleanName,
          phone: cleanPhone,
          address: customerAddress,
          note,
          paymentMethod,
        },
        cart,
        subtotal,
        deliveryCharge,
        total
      );

      setOrderSuccess(true);
      clearCart();

      // 4. Open WhatsApp in new tab
      setTimeout(() => {
        window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
      }, 600);
    } catch (err: any) {
      console.error('Order checkout error:', err);
      setErrorMsg(err?.message || 'অর্ডার সম্পন্ন করা যায়নি। অনুগ্রহ করে পুনরায় চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setIsCheckoutOpen(false);
    setOrderSuccess(false);
    setPaybdRedirectingUrl(null);
    setErrorMsg(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="fixed inset-0 bg-slate-950/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 text-slate-100 p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {paybdRedirectingUrl ? (
            <div className="text-center py-6 space-y-5">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CreditCard className="w-8 h-8" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  নতুন ট্যাবে পেমেন্ট উইন্ডো ওপেন হয়েছে
                </span>
                <h3 className="text-xl font-black text-white">নিরাপদ অনলাইন পেমেন্ট</h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto mt-1 leading-relaxed">
                  অর্ডার আইডি: <strong className="text-emerald-400 font-mono">{activeOrderId}</strong> | প্রদেয় টাকা: <strong className="text-white font-bold">{formatPrice(total)}</strong>
                </p>
              </div>

              {/* Supported payment icons */}
              <div className="flex items-center justify-center gap-2 flex-wrap py-1">
                <span className="px-2.5 py-1 rounded-lg bg-[#E2136E]/15 text-[#d81467] border border-[#E2136E]/30 text-xs font-black">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#F7941D]/15 text-[#d87b0a] border border-[#F7941D]/30 text-xs font-black">
                  Nagad
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-[#8C3494]/15 text-[#8C3494] border border-[#8C3494]/30 text-xs font-black">
                  Rocket
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-sky-500/15 text-sky-400 border border-sky-500/30 text-xs font-bold">
                  Cards
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-3">
                <p className="text-xs text-slate-400">
                  ব্রাউজারে পপআপ ব্লক থাকলে বা নতুন উইন্ডো না খুললে নিচের বাটনে চাপ দিন:
                </p>
                <a
                  href={paybdRedirectingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  <span>পেমেন্ট গেটওয়েতে যান (Open in New Tab)</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
                >
                  উইন্ডো বন্ধ করুন
                </button>
              </div>
            </div>
          ) : orderSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-white">অর্ডার সফলভাবে সাবমিট হয়েছে!</h3>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 text-xs font-bold">
                <span>⏳ পেমেন্ট ও অর্ডার অপেক্ষমাণ (Pending Approval)</span>
              </div>
              <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                আপনার অর্ডারের বিবরণ নিয়ে হোয়াটসঅ্যাপ ওপেন হয়েছে। সেখানে পেমেন্ট সম্পন্ন করে বা কনফার্মেশন দিয়ে অ্যাডমিনের কাছ থেকে দ্রুত অ্যাক্সেস ও ডেলিভারি বুঝে নিন।
              </p>
              <div className="pt-4">
                <button
                  onClick={handleClose}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
                >
                  ঠিক আছে, বন্ধ করুন
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">নিরাপদ চেকআউট (Order & Payment)</h3>
                  <p className="text-xs text-slate-400">তথ্য প্রদান করে সরাসরি পেমেন্ট বা WhatsApp এ কনফার্ম করুন</p>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-indigo-400" /> আপনার পুরো নাম *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={150}
                      placeholder="যেমন: মোঃ সাব্বির আহমেদ"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-emerald-400" /> মোবাইল / WhatsApp নম্বর *
                    </label>
                    <input
                      type="tel"
                      required
                      maxLength={30}
                      placeholder="যেমন: 017xxxxxxxx"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-sky-400" /> আপনার ইমেইল এড্রেস *
                    </span>
                    <span className="text-[10px] text-emerald-400 font-normal">📥 এখানে সরাসরি প্রোডাক্টের ফাইল যাবে</span>
                  </label>
                  <input
                    type="email"
                    required
                    maxLength={150}
                    placeholder="যেমন: yourname@gmail.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> ঠিকানা / জেলা (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    maxLength={500}
                    placeholder="আপনার জেলা বা থানা (ঐচ্ছিক)"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-amber-400" /> পেমেন্ট মাধ্যম নির্বাচন করুন *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {/* PayBD Instant Online Gateway */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paybd')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-2 text-left cursor-pointer ${
                        paymentMethod === 'paybd'
                          ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white font-bold">PayBD অনলাইন পেমেন্ট</p>
                          <p className="text-[10px] text-emerald-400">bKash, Nagad, Rocket, Cards</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold shrink-0">
                        Instant
                      </span>
                    </button>

                    {/* WhatsApp Direct Order */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('whatsapp')}
                      className={`p-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-between gap-2 text-left cursor-pointer ${
                        paymentMethod === 'whatsapp'
                          ? 'bg-gradient-to-r from-emerald-600/20 to-green-600/20 border-emerald-500 text-white ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-white font-bold">WhatsApp চ্যাট অর্ডার</p>
                          <p className="text-[10px] text-slate-400">অ্যাডমিনের সাথে সরাসরি কথা বলে</p>
                        </div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-extrabold shrink-0">
                        Chat
                      </span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-indigo-400" /> বিশেষ নির্দেশনা বা নোট (ঐচ্ছিক)
                  </label>
                  <input
                    type="text"
                    maxLength={1000}
                    placeholder="কোনো বিশেষ নির্দেশনা থাকলে লিখুন..."
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                {/* Order Summary Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>আইটেম সংখ্যা:</span>
                    <span className="font-semibold text-white">{cart.length} টি</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>সাবটোটাল:</span>
                    <span className="font-semibold text-white">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>ডেলিভারি চার্জ:</span>
                    <span className="font-semibold text-emerald-400">
                      {deliveryCharge > 0 ? formatPrice(deliveryCharge) : 'ফ্রি (০৳)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-800 text-white">
                    <span>সর্বমোট প্রদেয়:</span>
                    <span className="text-emerald-400 text-base font-black">{formatPrice(total)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting || cart.length === 0}
                  className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-emerald-900/40 flex items-center justify-center gap-2 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{paymentMethod === 'paybd' ? 'PayBD গেটওয়ে ওপেন হচ্ছে...' : 'প্রসেসিং হচ্ছে...'}</span>
                    </>
                  ) : paymentMethod === 'paybd' ? (
                    <>
                      <CreditCard className="w-4 h-4" />
                      <span>PayBD দিয়ে অনলাইন পেমেন্ট করুন ({formatPrice(total)})</span>
                    </>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp এ অর্ডার কনফার্ম করুন</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
