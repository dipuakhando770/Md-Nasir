import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  ShoppingBag,
  MessageCircle,
  Star,
  CheckCircle2,
  ShieldCheck,
  Zap,
  Plus,
  Minus,
  Check,
  Flame,
  Eye,
  ExternalLink,
  Download,
  Gift,
} from 'lucide-react';
import { Product } from '../../types';
import {
  formatPrice,
  calculateDiscount,
  generateDirectWhatsAppProductUrl,
  triggerFreeProductDownload,
  normalizeImageUrl,
} from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onViewFullPage?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onViewFullPage,
}) => {
  const { addToCart, setIsCheckoutOpen } = useCart();
  const { getCategoryName, settings } = useStore();
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>('');
  const [isAdded, setIsAdded] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [liveViewers, setLiveViewers] = useState(29);
  const [cartCount, setCartCount] = useState(7);

  useEffect(() => {
    if (product) {
      setActiveImage(product.imageUrl);
      setLiveViewers(Math.floor(Math.random() * 15) + 20);
      setCartCount(Math.floor(Math.random() * 5) + 5);
      setQuantity(1);
      setIsDownloaded(false);
    }
  }, [product]);

  if (!product) return null;

  const isFreeProduct = Boolean(product.isFree);
  const currentImage = activeImage || product.imageUrl;
  const discountPercent = calculateDiscount(product.price, product.oldPrice);
  const categoryName = getCategoryName(product.categoryId);
  const hasLivePreview = Boolean(
    product.livePreviewEnabled && product.livePreviewUrl && product.livePreviewUrl.trim()
  );

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    onClose();
    setIsCheckoutOpen(true);
  };

  const handleFreeDownload = () => {
    triggerFreeProductDownload(product);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const handleDirectWhatsApp = () => {
    const url = generateDirectWhatsAppProductUrl(
      settings.whatsappNumber || '01962780922',
      product,
      quantity
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleGoToFullPage = () => {
    onClose();
    window.location.hash = `product/${product.id || product.slug}`;
    if (onViewFullPage) {
      onViewFullPage(product);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.35 }}
          className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl z-10 text-slate-100 flex flex-col"
        >
          {/* Header Action Buttons */}
          <div className="absolute top-4 right-4 z-20 flex items-center gap-2">
            <button
              onClick={handleGoToFullPage}
              className="p-2 sm:px-3 sm:py-1.5 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-xs font-semibold text-slate-300 hover:text-emerald-400 transition-colors flex items-center gap-1.5"
              title="সম্পূর্ণ পেজে দেখুন"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">পূর্ণাঙ্গ পেজ</span>
            </button>
            <button
              onClick={onClose}
              className="p-2.5 rounded-full bg-slate-950/80 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 p-5 sm:p-8">
            {/* Left: Product Images & Badges */}
            <div className="flex flex-col gap-4">
              <div className="relative aspect-square w-full bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-xl flex items-center justify-center p-3">
                {currentImage ? (
                  <img
                    src={normalizeImageUrl(currentImage)}
                    alt={product.title}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600">
                    <Zap className="w-16 h-16 text-emerald-400 opacity-50" />
                  </div>
                )}

                {/* Floating Badges */}
                <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                  {isFreeProduct ? (
                    <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-lg flex items-center gap-1">
                      <Gift className="w-3.5 h-3.5" />
                      ১০০% ফ্রি
                    </span>
                  ) : (
                    discountPercent > 0 && (
                      <span className="px-3 py-1 rounded-full bg-emerald-600 text-white font-extrabold text-xs shadow-lg">
                        -{discountPercent}%
                      </span>
                    )
                  )}
                  {product.type === 'digital' && (
                    <span className="px-3 py-1 rounded-full bg-indigo-600 text-white font-medium text-xs shadow-lg flex items-center gap-1">
                      <Zap className="w-3 h-3" />
                      ডিজিটাল
                    </span>
                  )}
                </div>
              </div>

              {/* Gallery Thumbnails */}
              {product.gallery && product.gallery.length > 0 && (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  <button
                    onClick={() => setActiveImage(product.imageUrl)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                      currentImage === product.imageUrl ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
                    }`}
                  >
                    <img src={product.imageUrl} alt="main" className="w-full h-full object-cover" />
                  </button>
                  {product.gallery.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setActiveImage(img)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 ${
                        currentImage === img ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-800'
                      }`}
                    >
                      <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Payment Methods / Free Access Pill */}
              <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">
                  {isFreeProduct ? 'ডাউনলোড সুবিধা:' : 'পেমেন্ট মেথড:'}
                </span>
                <span className="text-emerald-400 font-bold">
                  {isFreeProduct ? '১০০% ফ্রি ডাউনলোড (No Payment)' : 'bKash • Nagad • Rocket'}
                </span>
              </div>
            </div>

            {/* Right: Details, Counters & Buy Actions */}
            <div className="flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                {/* Category & Rating */}
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md">
                    {categoryName}
                  </span>
                  {product.rating && (
                    <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{product.rating.toFixed(1)}</span>
                    </div>
                  )}
                </div>

                {/* Product Title */}
                <h2 className="text-xl sm:text-2xl font-black text-white leading-tight">
                  {product.title}
                </h2>

                {/* Pricing Display */}
                <div className="flex items-baseline gap-3">
                  {isFreeProduct ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                        ফ্রি (FREE)
                      </span>
                      {product.oldPrice && product.oldPrice > 0 ? (
                        <span className="text-sm text-slate-500 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      ) : null}
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[11px] font-bold">
                        পেমেন্ট ছাড়াই ডাউনলোড
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                        {formatPrice(product.price)}
                      </span>
                      {product.oldPrice && product.oldPrice > product.price && (
                        <span className="text-sm text-slate-500 line-through">
                          {formatPrice(product.oldPrice)}
                        </span>
                      )}
                    </>
                  )}
                </div>

                {/* Live Views Badge */}
                <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-950/80 px-3 py-2 rounded-xl border border-slate-800">
                  <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong className="text-white font-bold">{liveViewers} people</strong> are viewing this right now
                  </span>
                </div>

                {/* Urgency Alert */}
                <div className="flex items-center gap-2 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 px-3 py-2 rounded-xl">
                  <Flame className="w-4 h-4 text-rose-400 shrink-0 fill-rose-500" />
                  <span>
                    {isFreeProduct ? (
                      <>
                        সম্পূর্ণ ফ্রি প্রোডাক্ট! কোনো পেমেন্ট ছাড়াই <strong className="text-rose-200 font-bold">সরাসরি ডাউনলোড</strong> করুন
                      </>
                    ) : (
                      <>
                        Selling fast! Over <strong className="text-rose-200 font-bold">{cartCount} people</strong> have this in their carts
                      </>
                    )}
                  </span>
                </div>

                {/* Key Bullet Points */}
                <div className="space-y-1.5 text-xs text-slate-200 pt-1">
                  <p className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✅</span>
                    <span>
                      <strong>{product.title}</strong> –{' '}
                      {isFreeProduct ? (
                        <strong className="text-emerald-400">১০০% ফ্রি ডাউনলোড!</strong>
                      ) : (
                        <>
                          মাত্র <strong>{formatPrice(product.price)}</strong>
                        </>
                      )}
                    </span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span className="text-emerald-400">✅</span>
                    <span>
                      {isFreeProduct
                        ? 'কোনো প্রকার পেমেন্ট ছাড়াই এক ক্লিকে ফ্রি ডাউনলোড করার সুবিধা।'
                        : 'নিজে ব্যবহার করার পাশাপাশি Canva Access বিক্রি করে আয় করার সুযোগ।'}
                    </span>
                  </p>
                </div>

                {/* Short Description */}
                {product.shortDescription && (
                  <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                    {product.shortDescription}
                  </p>
                )}

                {/* Live Preview Showcase inside Quick View Modal */}
                {hasLivePreview && (
                  <div className="p-3 rounded-xl bg-indigo-950/50 border border-indigo-500/30 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                        Web Script / Template Demo
                      </span>
                      <a
                        href={product.livePreviewUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-400 hover:underline font-mono truncate max-w-[180px]"
                      >
                        {product.livePreviewUrl}
                      </a>
                    </div>
                    <a
                      href={product.livePreviewUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-extrabold bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4 shrink-0" />
                      <span>Live Preview দেখুন</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  </div>
                )}
              </div>

              {/* Quantity & CTA Buttons */}
              <div className="space-y-3 pt-3 border-t border-slate-800">
                {isFreeProduct ? (
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={handleFreeDownload}
                      className="w-full py-3.5 px-4 rounded-xl text-sm font-extrabold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
                    >
                      {isDownloaded ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>ডাউনলোড শুরু হয়েছে! আবার ডাউনলোড করুন</span>
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4" />
                          <span>ফ্রি ডাউনলোড করুন (কোনো পেমেন্ট লাগবে না)</span>
                        </>
                      )}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-semibold text-slate-400">পরিমাণ:</span>
                      <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1">
                        <button
                          onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-8 text-center font-bold text-xs text-white">{quantity}</span>
                        <button
                          onClick={() => setQuantity((prev) => prev + 1)}
                          className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                      <button
                        onClick={handleAddToCart}
                        disabled={!product.available}
                        className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
                          isAdded
                            ? 'bg-emerald-600/20 text-emerald-400 border-emerald-500/40'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border-slate-700'
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="w-4 h-4 text-emerald-400" />
                            <span>যুক্ত হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="w-4 h-4" />
                            <span>ব্যাগে যোগ</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={handleBuyNow}
                        disabled={!product.available}
                        className="py-3 px-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                      >
                        <Zap className="w-4 h-4 fill-white" />
                        <span>এখনই অর্ডার</span>
                      </button>
                    </div>

                    <button
                      onClick={handleDirectWhatsApp}
                      className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-[#25D366] hover:bg-[#20ba59] text-white flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 fill-white" />
                      <span>WhatsApp এ অর্ডার করুন</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
