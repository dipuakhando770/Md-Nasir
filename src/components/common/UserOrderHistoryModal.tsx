import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  Package,
  Calendar,
  Clock,
  ExternalLink,
  Download,
  MessageCircle,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Trash2,
  ShieldCheck,
  CreditCard,
  Phone,
  User,
  Sparkles,
  RefreshCw,
  Search,
  ArrowRight,
  History,
  Check,
  Zap,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import {
  getUserLocalOrders,
  clearUserLocalOrders,
  LocalUserOrder,
  syncUserOrdersWithFirestore,
  getUserCartHistory,
  clearUserCartHistory,
  LocalCartActivity,
  trackRemoteOrder,
} from '../../utils/userOrderHistory';
import { formatPrice, sanitizeWhatsAppNumber, normalizeImageUrl } from '../../utils/formatters';

interface UserOrderHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToShop: () => void;
}

export const UserOrderHistoryModal: React.FC<UserOrderHistoryModalProps> = ({
  isOpen,
  onClose,
  onNavigateToShop,
}) => {
  const { settings, products } = useStore();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<'orders' | 'cart_history' | 'tracking'>('orders');

  const [orders, setOrders] = useState<LocalUserOrder[]>([]);
  const [cartHistory, setCartHistory] = useState<LocalCartActivity[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  // Live Tracking Search
  const [trackingQuery, setTrackingQuery] = useState('');
  const [trackingResult, setTrackingResult] = useState<LocalUserOrder | null>(null);
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackSearched, setTrackSearched] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const loadLocalData = () => {
      setOrders(getUserLocalOrders());
      setCartHistory(getUserCartHistory());
    };
    loadLocalData();

    // Auto-sync with Firestore in the background to fetch updated approval statuses
    setIsSyncing(true);
    syncUserOrdersWithFirestore()
      .then((updated) => {
        if (updated && updated.length > 0) {
          setOrders(updated);
        }
      })
      .finally(() => setIsSyncing(false));

    window.addEventListener('ndh_user_orders_updated', loadLocalData);
    window.addEventListener('ndh_user_cart_history_updated', loadLocalData);

    return () => {
      window.removeEventListener('ndh_user_orders_updated', loadLocalData);
      window.removeEventListener('ndh_user_cart_history_updated', loadLocalData);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const updated = await syncUserOrdersWithFirestore();
      if (updated) setOrders(updated);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('আপনি কি আপনার ডিভাইসের সকল অর্ডার হিস্ট্রি মুছে ফেলতে চান?')) {
      clearUserLocalOrders();
      setOrders([]);
    }
  };

  const handleClearCartHistory = () => {
    if (window.confirm('আপনি কি কার্ট হিস্ট্রি মুছে ফেলতে চান?')) {
      clearUserCartHistory();
      setCartHistory([]);
    }
  };

  const handleSearchTracking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingQuery.trim()) return;

    setIsSearchingTrack(true);
    setTrackSearched(true);
    try {
      const result = await trackRemoteOrder(trackingQuery);
      setTrackingResult(result);
      if (result) {
        setOrders(getUserLocalOrders());
      }
    } finally {
      setIsSearchingTrack(false);
    }
  };

  const getWhatsAppVerifyUrl = (order: LocalUserOrder) => {
    const merchantPhone = sanitizeWhatsAppNumber(settings.whatsappNumber || '01962780922');
    const itemsText = (order.items || []).map((i) => `• ${i.title} (${i.quantity}x)`).join('\n');
    const text = encodeURIComponent(
      `👋 আসসালামু আলাইকুম! আমি আমার অর্ডারের স্ট্যাটাস যাচাই/কনফার্ম করতে চাচ্ছি।\n\n` +
      `📦 *অর্ডার আইডি:* #${order.orderId}\n` +
      `👤 *নাম:* ${order.customerName}\n` +
      `📱 *ফোন:* ${order.customerPhone}\n` +
      `💰 *মোট মূল্য:* ${order.total} ৳\n` +
      `💳 *পেমেন্ট মেথড:* ${order.paymentMethod}\n` +
      (order.transactionId ? `🔢 *ট্রানজেকশন ID:* ${order.transactionId}\n` : '') +
      `🛍️ *পণ্যসমূহ:*\n${itemsText}\n\n` +
      `অনুগ্রহ করে আমার অর্ডারটি চেক করে কনফার্মেশন প্রদান করুন। ধন্যবাদ!`
    );
    return `https://wa.me/${merchantPhone}?text=${text}`;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-3xl w-full overflow-hidden z-10 flex flex-col max-h-[92vh]"
        >
          {/* Top Executive Header */}
          <div className="p-5 sm:p-6 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0 shadow-lg shadow-emerald-500/10">
                <ShoppingBag className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-base sm:text-lg text-white">আমার অর্ডার ও কার্ট হিস্ট্রি</h3>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-black flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    লাইভ সিঙ্ক সক্রিয়
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  আপনার সকল সাম্প্রতিক অর্ডার, পেন্ডিং স্ট্যাটাস ও ডিজিটাল ফাইল ডাউনলোড
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-auto">
              <button
                type="button"
                onClick={handleManualSync}
                disabled={isSyncing}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                title="সার্ভারের সাথে স্ট্যাটাস রিফ্রেশ করুন"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'সিঙ্ক হচ্ছে...' : 'রিফ্রেশ'}</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Navigation Tab Bar */}
          <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 pb-2 bg-slate-50 border-b border-slate-200 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'orders'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              <span>অর্ডার হিস্ট্রি ({orders.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cart_history')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'cart_history'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <History className="w-3.5 h-3.5" />
              <span>কার্ট হিস্ট্রি ({cartHistory.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('tracking')}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                activeTab === 'tracking'
                  ? 'bg-slate-900 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>অর্ডার ট্র্যাকিং</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 overflow-y-auto flex-1">
            {/* TAB 1: ORDERS LIST */}
            {activeTab === 'orders' && (
              <div className="space-y-4">
                {orders.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <Package className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-slate-800 text-base mb-1">
                      ব্রাউজারে এখনো কোনো অর্ডার হিস্ট্রি পাওয়া যায়নি
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-5">
                      আপনি পণ্য অর্ডার করলে তা স্বয়ংক্রিয়ভাবে এখানে তালিকাভুক্ত থাকবে এবং অ্যাডমিন অ্যাপ্রুভ করলে সাথে সাথে ফাইল ডাউনলোড লিঙ্ক পাবেন।
                    </p>
                    <div className="flex items-center justify-center gap-3 flex-wrap">
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onNavigateToShop();
                        }}
                        className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>পণ্যসমূহ ব্রাউজ করুন</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setActiveTab('tracking')}
                        className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                      >
                        অর্ডার ট্র্যাকিং করুন
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => {
                      const isCompleted =
                        order.status === 'completed' ||
                        (order.paymentStatus as any) === 'paid' ||
                        (order.paymentStatus as any) === 'completed';

                      const isFailed =
                        order.status === 'cancelled' ||
                        (order.paymentStatus as any) === 'failed' ||
                        (order.paymentStatus as any) === 'cancelled';

                      const isConfirmed = order.status === 'confirmed' || order.status === 'processing';
                      const isPending = !isCompleted && !isFailed && !isConfirmed;

                      const orderDate = new Date(order.createdAt).toLocaleDateString('bn-BD', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={order.orderId}
                          className="bg-slate-50 border-2 border-slate-200/90 rounded-3xl p-4 sm:p-5 transition-all hover:border-emerald-400 shadow-sm space-y-4"
                        >
                          {/* Top Card Header */}
                          <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-200 flex-wrap">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono font-black text-sm text-slate-900 bg-white px-2 py-0.5 rounded-lg border border-slate-300">
                                  #{order.orderId}
                                </span>
                                {order.transactionId && (
                                  <span className="font-mono text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                                    Trx: {order.transactionId}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                <Clock className="w-3 h-3 text-slate-400" />
                                {orderDate}
                              </span>
                            </div>

                            {/* Status Badge */}
                            <div>
                              {isCompleted && (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1.5 shadow-xs">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>অনুমোদিত ও সম্পন্ন (Approved)</span>
                                </span>
                              )}
                              {isConfirmed && (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-sky-100 text-sky-800 border border-sky-300 inline-flex items-center gap-1.5">
                                  <Sparkles className="w-3.5 h-3.5 text-sky-600" />
                                  <span>কনফার্মড / প্রসেসিং</span>
                                </span>
                              )}
                              {isPending && (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1.5 animate-pulse">
                                  <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                                  <span>অপেক্ষমাণ (পেন্ডিং)</span>
                                </span>
                              )}
                              {isFailed && (
                                <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 inline-flex items-center gap-1.5">
                                  <XCircle className="w-3.5 h-3.5 text-rose-600" />
                                  <span>বাতিল / অনিষ্পন্ন</span>
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Status Description Banner */}
                          {isPending && (
                            <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-900 text-xs flex items-center gap-2">
                              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                              <p className="leading-tight">
                                আপনার অর্ডারটি অ্যাডমিন পর্যালোচনায় রয়েছে। অনুমোদন পাওয়ার সাথে সাথে এখানে ডাউনলোড লিঙ্ক দৃশ্যমান হবে।
                              </p>
                            </div>
                          )}

                          {isCompleted && (
                            <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 text-emerald-900 text-xs flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                <p className="font-bold">
                                  আপনার অর্ডারটি অনুমোদিত হয়েছে! নিচের ডাউনলোড বাটনে ক্লিক করে ফাইল ও লাইসেন্স সংগ্রহ করুন।
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Items List */}
                          <div className="space-y-2.5">
                            {(order.items || []).map((item, idx) => {
                              const matchedProd = products.find((p) => p.id === item.productId);
                              const downloadLink = item.downloadUrl || matchedProd?.downloadUrl || '';
                              const livePreview = item.livePreviewUrl || matchedProd?.livePreviewUrl || '';

                              return (
                                <div
                                  key={idx}
                                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200"
                                >
                                  <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                                      {item.imageUrl ? (
                                        <img
                                          src={normalizeImageUrl(item.imageUrl)}
                                          alt={item.title}
                                          className="w-full h-full object-contain"
                                        />
                                      ) : (
                                        <Package className="w-5 h-5 text-slate-400" />
                                      )}
                                    </div>
                                    <div className="min-w-0">
                                      <h5 className="text-xs font-black text-slate-900 truncate">
                                        {item.title}
                                      </h5>
                                      <div className="text-[11px] text-slate-500 font-medium">
                                        পরিমাণ: {item.quantity} × {formatPrice(item.price)}
                                      </div>
                                    </div>
                                  </div>

                                  {/* Download Link if Approved */}
                                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                                    {isCompleted && downloadLink ? (
                                      <a
                                        href={downloadLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black flex items-center gap-1.5 shrink-0 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                                      >
                                        <Download className="w-3.5 h-3.5" />
                                        <span>ইনস্ট্যান্ট ডাউনলোড</span>
                                      </a>
                                    ) : isCompleted ? (
                                      <span className="text-[11px] text-emerald-700 font-bold bg-emerald-50 px-2.5 py-1 rounded-lg">
                                        ফাইল লিঙ্ক ইমেইলে পাঠানো হয়েছে
                                      </span>
                                    ) : null}

                                    {livePreview && (
                                      <a
                                        href={livePreview}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition-colors"
                                      >
                                        <ExternalLink className="w-3 h-3" />
                                        <span>ডেমো</span>
                                      </a>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer Info & Verification Actions */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-slate-200">
                            <div className="text-xs text-slate-600">
                              <span className="font-bold text-slate-900">মোট মূল্য: </span>
                              <span className="text-emerald-700 font-black text-sm">
                                {formatPrice(order.total)}
                              </span>
                              <span className="text-[11px] text-slate-500 ml-1 font-medium">
                                ({order.paymentMethod})
                              </span>
                            </div>

                            <a
                              href={getWhatsAppVerifyUrl(order)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#128C7E] border border-[#25D366]/30 text-xs font-black flex items-center justify-center gap-1.5 transition-colors"
                            >
                              <MessageCircle className="w-4 h-4 fill-[#25D366]" />
                              <span>WhatsApp এ স্ট্যাটাস ভেরিফাই করুন</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CART ACTIVITY HISTORY */}
            {activeTab === 'cart_history' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <p className="text-xs text-slate-500 font-medium">
                    আপনি সম্প্রতি যে সকল প্রোডাক্ট কার্টে বা ব্যাগে যুক্ত করেছিলেন:
                  </p>
                  {cartHistory.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearCartHistory}
                      className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>ক্লিয়ার করুন</span>
                    </button>
                  )}
                </div>

                {cartHistory.length === 0 ? (
                  <div className="text-center py-12 px-4">
                    <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h4 className="font-black text-slate-800 text-base mb-1">
                      কোনো সাম্প্রতিক কার্ট হিস্ট্রি নেই
                    </h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
                      পণ্য ব্রাউজ করে "কার্টে যোগ করুন" চাপলে তা স্বয়ংক্রিয়ভাবে এখানে সেভ থাকবে।
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onNavigateToShop();
                      }}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-lg transition-all cursor-pointer"
                    >
                      শপ ব্রাউজ করুন
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {cartHistory.map((item) => {
                      const matchedProd = products.find((p) => p.id === item.productId);
                      const targetProd = matchedProd || {
                        id: item.productId,
                        title: item.title,
                        price: item.price,
                        imageUrl: item.imageUrl,
                        downloadUrl: item.downloadUrl,
                        livePreviewUrl: item.livePreviewUrl,
                        slug: item.productId,
                        category: 'general',
                        originalPrice: item.price * 1.5,
                        salesCount: 1,
                        rating: 5,
                        reviewCount: 1,
                        featured: false,
                        description: '',
                        details: [],
                      };

                      return (
                        <div
                          key={item.id}
                          className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-3 hover:border-indigo-400 transition-all"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                              {item.imageUrl ? (
                                <img
                                  src={normalizeImageUrl(item.imageUrl)}
                                  alt={item.title}
                                  className="w-full h-full object-contain"
                                />
                              ) : (
                                <Package className="w-5 h-5 text-indigo-400" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <h5 className="text-xs font-black text-slate-900 truncate">
                                {item.title}
                              </h5>
                              <p className="text-xs font-black text-emerald-600">
                                {formatPrice(item.price)}
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              addToCart(targetProd as any, 1, true);
                              onClose();
                            }}
                            className="px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1 shrink-0 transition-colors shadow cursor-pointer"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-300" />
                            <span>অর্ডার করুন</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: LIVE REMOTE ORDER TRACKING */}
            {activeTab === 'tracking' && (
              <div className="space-y-5">
                <form onSubmit={handleSearchTracking} className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700">
                    অর্ডার আইডি (#ORD-...) অথবা মোবাইল নম্বর লিখে ট্র্যাক করুন:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={trackingQuery}
                      onChange={(e) => setTrackingQuery(e.target.value)}
                      placeholder="যেমন: ORD-123456 বা 017xxxxxxxx"
                      className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-emerald-600"
                    />
                    <button
                      type="submit"
                      disabled={isSearchingTrack || !trackingQuery.trim()}
                      className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {isSearchingTrack ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Search className="w-3.5 h-3.5" />
                      )}
                      <span>ট্র্যাক করুন</span>
                    </button>
                  </div>
                </form>

                {/* Tracking Result View */}
                {trackingResult && (
                  <div className="p-5 rounded-3xl bg-slate-50 border-2 border-emerald-400 space-y-4 shadow-md animate-fadeIn">
                    <div className="flex items-center justify-between gap-2 border-b border-slate-200 pb-3">
                      <div>
                        <h4 className="font-black text-sm text-slate-900">
                          অর্ডার #{trackingResult.orderId}
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium">
                          গ্রাহক: {trackingResult.customerName} ({trackingResult.customerPhone})
                        </p>
                      </div>

                      <div>
                        {trackingResult.status === 'completed' || (trackingResult.paymentStatus as any) === 'paid' ? (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>অনুমোদিত ও সম্পন্ন</span>
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-600" />
                            <span>অপেক্ষমাণ (পেন্ডিং)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Products in Result */}
                    <div className="space-y-2">
                      {trackingResult.items.map((it, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-slate-200"
                        >
                          <span className="text-xs font-bold text-slate-800">• {it.title}</span>
                          {it.downloadUrl && (trackingResult.status === 'completed' || (trackingResult.paymentStatus as any) === 'paid') && (
                            <a
                              href={it.downloadUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1"
                            >
                              <Download className="w-3 h-3" />
                              <span>ডাউনলোড</span>
                            </a>
                          )}
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between text-xs font-bold pt-2 border-t border-slate-200">
                      <span>মোট মূল্য: {formatPrice(trackingResult.total)}</span>
                      <a
                        href={getWhatsAppVerifyUrl(trackingResult)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:underline flex items-center gap-1"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>WhatsApp এ যোগাযোগ করুন</span>
                      </a>
                    </div>
                  </div>
                )}

                {trackSearched && !trackingResult && !isSearchingTrack && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center font-bold">
                    ⚠️ কোনো অর্ডার রেকর্ড পাওয়া যায়নি। অনুগ্রহ করে সঠিক অর্ডার আইডি বা মোবাইল নম্বর দিন।
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom Clear & Close Action Bar */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            {activeTab === 'orders' && orders.length > 0 ? (
              <button
                type="button"
                onClick={handleClearHistory}
                className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>অর্ডার হিস্ট্রি ক্লিয়ার</span>
              </button>
            ) : (
              <span className="text-[11px] text-slate-400 font-medium">Nasir Digital Hub Client Tracker</span>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-black rounded-xl transition-colors cursor-pointer"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
