import React, { useState, useEffect } from 'react';
import {
  ShoppingBag,
  Zap,
  MessageCircle,
  Star,
  Eye,
  Flame,
  Plus,
  Minus,
  Check,
  ExternalLink,
  Globe,
  Copy,
  Download,
  Gift,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { useCart } from '../context/CartContext';
import {
  formatPrice,
  calculateDiscount,
  generateDirectWhatsAppProductUrl,
  triggerFreeProductDownload,
  normalizeImageUrl,
} from '../utils/formatters';
import { getProductFullUrl, getProductPath } from '../utils/slugify';

interface ProductPageProps {
  product: Product;
  onNavigateToShop: (categoryId?: string) => void;
  onNavigateToHome: () => void;
  onSelectProduct: (product: Product) => void;
}

export const ProductPage: React.FC<ProductPageProps> = ({
  product,
  onNavigateToShop,
  onNavigateToHome,
  onSelectProduct,
}) => {
  const { products, getCategoryName, settings } = useStore();
  const { addToCart, setIsCheckoutOpen } = useCart();

  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState<string>(product.imageUrl);
  const [isAdded, setIsAdded] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);
  const [copiedPreviewUrl, setCopiedPreviewUrl] = useState(false);
  const [copiedDownloadUrl, setCopiedDownloadUrl] = useState(false);
  const [copiedProductUrl, setCopiedProductUrl] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'guide'>('description');

  // Simulated live viewers & cart urgency (Matching Screenshot 832)
  const [liveViewers, setLiveViewers] = useState(29);
  const [cartCount, setCartCount] = useState(7);

  useEffect(() => {
    setActiveImage(product.imageUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setLiveViewers(Math.floor(Math.random() * 15) + 20);
    setCartCount(Math.floor(Math.random() * 5) + 5);
  }, [product]);

  const isFreeProduct = Boolean(product.isFree);
  const discountPercent = calculateDiscount(product.price, product.oldPrice);
  const categoryName = getCategoryName(product.categoryId);
  const hasLivePreview = Boolean(
    product.livePreviewEnabled && product.livePreviewUrl && product.livePreviewUrl.trim()
  );

  const handleCopyProductUrl = () => {
    const fullUrl = getProductFullUrl(product);
    navigator.clipboard?.writeText(fullUrl);
    setCopiedProductUrl(true);
    setTimeout(() => setCopiedProductUrl(false), 2500);
  };

  const handleCopyPreviewUrl = () => {
    if (!product.livePreviewUrl) return;
    navigator.clipboard?.writeText(product.livePreviewUrl);
    setCopiedPreviewUrl(true);
    setTimeout(() => setCopiedPreviewUrl(false), 2000);
  };

  const handleCopyDownloadUrl = () => {
    if (!product.downloadUrl) return;
    navigator.clipboard?.writeText(product.downloadUrl);
    setCopiedDownloadUrl(true);
    setTimeout(() => setCopiedDownloadUrl(false), 2000);
  };

  const handleFreeDownload = () => {
    triggerFreeProductDownload(product);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  // Other products for the right sidebar (Matching Screenshot 832)
  const relatedProducts = products
    .filter((p) => p.id !== product.id)
    .slice(0, 5);

  const handleAddToCart = () => {
    addToCart(product, quantity);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 2000);
  };

  const handleBuyNow = () => {
    addToCart(product, quantity);
    setIsCheckoutOpen(true);
  };

  const handleWhatsAppOrder = () => {
    const url = generateDirectWhatsAppProductUrl(
      settings.whatsappNumber || '01962780922',
      product,
      quantity
    );
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen pb-20">
      {/* 1. Breadcrumb Bar (Matching Screenshot 832) */}
      <div className="bg-white border-b border-slate-200 py-3 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center flex-wrap gap-2 text-xs sm:text-sm text-slate-500">
          <button
            onClick={onNavigateToHome}
            className="hover:text-emerald-600 transition-colors font-medium"
          >
            Home
          </button>
          <span className="text-slate-400">/</span>
          <button
            onClick={() => onNavigateToShop()}
            className="hover:text-emerald-600 transition-colors font-medium"
          >
            Shop
          </button>
          <span className="text-slate-400">/</span>
          <button
            onClick={() => onNavigateToShop(product.categoryId)}
            className="hover:text-emerald-600 transition-colors font-medium text-slate-600"
          >
            {categoryName}
          </button>
          <span className="text-slate-400">/</span>
          <span className="text-slate-900 font-semibold truncate max-w-[200px] sm:max-w-md">
            {product.title}
          </span>
        </div>
      </div>

      {/* 2. Main 3-Column / Rich Product Grid (Exact RaduanBD Layout in Screenshot 832) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* ================= COLUMN 1: Product Image Poster (5 Cols) ================= */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square w-full rounded-2xl bg-slate-50 border border-slate-200 overflow-hidden shadow-sm group flex items-center justify-center p-3">
              {activeImage ? (
                <img
                  src={normalizeImageUrl(activeImage)}
                  alt={product.title}
                  className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 bg-slate-100">
                  <Zap className="w-16 h-16 text-emerald-500 animate-pulse" />
                  <span className="text-sm mt-2 text-slate-600">{product.title}</span>
                </div>
              )}

              {/* Best Offer Crown Badge */}
              <div className="absolute top-3 right-3 z-10">
                <span className="px-3 py-1 rounded-md bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                  <Star className="w-3 h-3 fill-slate-950" />
                  BEST OFFER
                </span>
              </div>
            </div>

            {/* Gallery Thumbnails */}
            {product.gallery && product.gallery.length > 0 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-2">
                <button
                  type="button"
                  onClick={() => setActiveImage(product.imageUrl)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-slate-50 flex items-center justify-center p-1 ${
                    activeImage === product.imageUrl
                      ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-400'
                  }`}
                >
                  <img src={normalizeImageUrl(product.imageUrl)} alt="thumb-main" className="w-full h-full object-contain" />
                </button>
                {product.gallery.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all bg-slate-50 flex items-center justify-center p-1 ${
                      activeImage === img
                        ? 'border-emerald-600 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-400'
                    }`}
                  >
                    <img src={normalizeImageUrl(img)} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}

            {/* Payment Trust Badges (bKash / Nagad / Rocket) */}
            <div className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-sm space-y-2">
              <div className="text-xs font-bold text-slate-600 flex items-center justify-between">
                <span>নিরাপদ পেমেন্ট মেথড:</span>
                <span className="text-emerald-600 text-[11px] font-bold">১০০% ভেরিফাইড</span>
              </div>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="px-2.5 py-1 rounded bg-[#E2136E]/10 text-[#d81467] border border-[#E2136E]/20 text-xs font-black">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded bg-[#F7941D]/10 text-[#d87b0a] border border-[#F7941D]/20 text-xs font-black">
                  Nagad
                </span>
                <span className="px-2.5 py-1 rounded bg-[#8C3494]/10 text-[#8C3494] border border-[#8C3494]/20 text-xs font-black">
                  Rocket
                </span>
                <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                  Upay
                </span>
              </div>
            </div>
          </div>

          {/* ================= COLUMN 2: Details & Actions (4 Cols) ================= */}
          <div className="lg:col-span-4 space-y-4">
            <div>
              {/* Top Pill: Free Product OR Discount */}
              {isFreeProduct ? (
                <div className="inline-block mb-1.5">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-600 text-white font-black text-xs inline-flex items-center gap-1 shadow-xs">
                    <Gift className="w-3.5 h-3.5" />
                    <span>১০০% ফ্রি ডাউনলোড (FREE PRODUCT)</span>
                  </span>
                </div>
              ) : (
                discountPercent > 0 && (
                  <div className="inline-block mb-1.5">
                    <span className="px-2.5 py-0.5 rounded bg-emerald-600 text-white font-black text-xs">
                      -{discountPercent}%
                    </span>
                  </div>
                )
              )}

              {/* Product Title */}
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-snug">
                {product.title}
              </h1>

              {/* Pricing Display */}
              <div className="flex items-baseline gap-2.5 mt-2">
                {isFreeProduct ? (
                  <>
                    {product.oldPrice && product.oldPrice > 0 ? (
                      <span className="text-base text-slate-400 line-through font-semibold">
                        {formatPrice(product.oldPrice)}
                      </span>
                    ) : null}
                    <span className="text-2xl sm:text-3xl font-black text-emerald-600">
                      ফ্রি (FREE)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold">
                      কোনো পেমেন্ট লাগবে না
                    </span>
                  </>
                ) : (
                  <>
                    {product.oldPrice && product.oldPrice > product.price && (
                      <span className="text-base text-slate-400 line-through font-semibold">
                        {formatPrice(product.oldPrice)}
                      </span>
                    )}
                    <span className="text-2xl sm:text-3xl font-black text-slate-900">
                      {formatPrice(product.price)}
                    </span>
                  </>
                )}
              </div>

              {/* SEO Top-Level Sharable Link Bar */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleCopyProductUrl}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 hover:border-emerald-300 text-xs font-semibold transition-all cursor-pointer shadow-xs active:scale-95"
                  title="প্রোডাক্টের সরাসরি এসইও লিঙ্ক কপি করুন"
                >
                  {copiedProductUrl ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-emerald-700 font-bold">SEO লিঙ্ক কপি হয়েছে!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span>প্রোডাক্ট লিঙ্ক শেয়ার / কপি করুন</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Live Social Proof Counter (Screenshot 832: "29 people are viewing this right now") */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-700 py-1">
              <Eye className="w-4 h-4 text-slate-500 shrink-0" />
              <span>
                <strong className="text-slate-900 font-bold">{liveViewers} people</strong> are viewing this right now
              </span>
            </div>

            {/* Urgency Box */}
            <div className="flex items-center gap-2 text-xs sm:text-sm text-rose-600 bg-rose-50 border border-rose-200 px-3 py-2 rounded-lg font-medium">
              <Flame className="w-4 h-4 text-rose-600 shrink-0 fill-rose-600" />
              <span>
                {isFreeProduct ? (
                  <>
                    জনপ্রিয় ফ্রি রিসোর্স! কোনো পেমেন্ট ছাড়াই <strong className="text-rose-700 font-bold">ইনস্ট্যান্ট ডাউনলোড</strong> করুন
                  </>
                ) : (
                  <>
                    Selling fast! Over <strong className="text-rose-700 font-bold">{cartCount} people</strong> have this in their carts
                  </>
                )}
              </span>
            </div>

            {/* Green Checked Value Highlights */}
            <div className="space-y-1.5 text-xs sm:text-sm text-slate-700 pt-1">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✅</span>
                <span>
                  <strong>{product.title}</strong> –{' '}
                  {isFreeProduct ? (
                    <strong className="text-emerald-600">সম্পূর্ণ ফ্রি (কোনো পেমেন্ট ছাড়াই ডাউনলোড)!</strong>
                  ) : (
                    <>
                      মাত্র <strong>{formatPrice(product.price)}</strong>!
                    </>
                  )}
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✅</span>
                <span>
                  {isFreeProduct
                    ? 'সরাসরি এক ক্লিকে ফ্রি ডাউনলোড ও তাৎক্ষণিক অ্যাক্সেস সুবিধা।'
                    : 'নিজে ব্যবহার করার পাশাপাশি Canva Access বিক্রি করে আয় করার সুযোগ।'}
                </span>
              </div>
            </div>

            {/* Professional Live Preview Card (Web Script / Template Demo Showcase) */}
            {hasLivePreview && (
              <div className="rounded-xl border-2 border-indigo-500/30 bg-gradient-to-br from-indigo-50/90 via-white to-violet-50/70 p-3.5 shadow-sm space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                    </span>
                    <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wide">
                      Web Script / Template — Live Preview
                    </span>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 border border-emerald-200">
                    ডেমো সাইট সক্রিয়
                  </span>
                </div>

                {/* Primary Live Preview CTA Button */}
                <a
                  href={product.livePreviewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-600 hover:from-indigo-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all active:scale-98"
                >
                  <Eye className="w-4 h-4 shrink-0" />
                  <span>Live Preview দেখুন (Demo Website)</span>
                  <ExternalLink className="w-4 h-4 shrink-0" />
                </a>

                {/* Clickable Preview URL Bar + Copy Button */}
                <div className="flex items-center justify-between gap-2 bg-white border border-indigo-200/80 rounded-lg px-2.5 py-1.5 text-xs">
                  <a
                    href={product.livePreviewUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-mono text-[11px] truncate flex-1 hover:underline"
                    title={product.livePreviewUrl}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0 text-indigo-500" />
                    <span className="truncate">{product.livePreviewUrl}</span>
                  </a>
                  <button
                    type="button"
                    onClick={handleCopyPreviewUrl}
                    className="px-2 py-1 rounded bg-slate-100 hover:bg-indigo-100 text-slate-700 hover:text-indigo-700 font-semibold text-[10px] inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    title="প্রিভিউ লিঙ্ক কপি করুন"
                  >
                    {copiedPreviewUrl ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-700">কপি হয়েছে</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>কপি</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Action Section: Free Instant Download OR Paid Order Actions */}
            <div className="space-y-2.5 pt-3 border-t border-slate-200">
              {isFreeProduct ? (
                <div className="rounded-xl border-2 border-emerald-500/40 bg-gradient-to-br from-emerald-50/90 via-white to-teal-50/60 p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold text-emerald-950 flex items-center gap-1.5">
                      <Gift className="w-4 h-4 text-emerald-600" />
                      <span>ফ্রি প্রোডাক্ট — কোনো পেমেন্ট প্রয়োজন নেই</span>
                    </span>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                      100% FREE
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleFreeDownload}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                  >
                    {isDownloaded ? (
                      <>
                        <Check className="w-5 h-5" />
                        <span>ডাউনলোড শুরু হয়েছে! আবার ডাউনলোড করুন</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5" />
                        <span>ফ্রি ডাউনলোড করুন (Free Download)</span>
                      </>
                    )}
                  </button>

                  {product.downloadUrl && product.downloadUrl.trim() && (
                    <div className="flex items-center justify-between gap-2 bg-white border border-emerald-200 rounded-lg px-2.5 py-1.5 text-xs">
                      <a
                        href={
                          /^https?:\/\//i.test(product.downloadUrl.trim())
                            ? product.downloadUrl.trim()
                            : `https://${product.downloadUrl.trim()}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 text-emerald-700 hover:text-emerald-900 font-mono text-[11px] truncate flex-1 hover:underline"
                        title={product.downloadUrl}
                      >
                        <Download className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                        <span className="truncate">{product.downloadUrl}</span>
                      </a>
                      <button
                        type="button"
                        onClick={handleCopyDownloadUrl}
                        className="px-2 py-1 rounded bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 font-semibold text-[10px] inline-flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                      >
                        {copiedDownloadUrl ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span className="text-emerald-700">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>লিঙ্ক কপি</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-600 text-center">
                    কোনো প্রকার পেমেন্ট বা অর্ডার ছাড়াই সরাসরি ফাইলটি ডাউনলোড করতে উপরের বাটনে ক্লিক করুন।
                  </p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-600">পরিমাণ:</span>
                    <div className="flex items-center bg-white border border-slate-300 rounded-lg p-0.5">
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center font-bold text-xs text-slate-900">{quantity}</span>
                      <button
                        type="button"
                        onClick={() => setQuantity((prev) => prev + 1)}
                        className="p-1 rounded hover:bg-slate-100 text-slate-600"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Dual CTA Buttons */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={handleAddToCart}
                      disabled={!product.available}
                      className={`py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 border transition-all ${
                        isAdded
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                          : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-300'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-4 h-4 text-emerald-600" />
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
                      type="button"
                      onClick={handleBuyNow}
                      disabled={!product.available}
                      className="py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-md flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Zap className="w-4 h-4 fill-white" />
                      <span>এখনই অর্ডার করুন</span>
                    </button>
                  </div>

                  {/* WhatsApp Direct Order Button */}
                  <button
                    type="button"
                    onClick={handleWhatsAppOrder}
                    className="w-full py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 fill-white" />
                    <span>WhatsApp এ অর্ডার করুন</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* ================= COLUMN 3: Products Sidebar Widget (3 Cols - Matching Screenshot 832) ================= */}
          <div className="lg:col-span-3 space-y-3">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <h3 className="text-base font-black text-slate-900 pb-2.5 border-b border-slate-200 mb-3">
                Products
              </h3>

              {/* Related/Popular Products List */}
              <div className="space-y-3.5">
                {relatedProducts.map((relProduct) => (
                  <div
                    key={relProduct.id}
                    onClick={() => {
                      window.history.pushState(null, '', getProductPath(relProduct));
                      onSelectProduct(relProduct);
                    }}
                    className="flex items-start gap-2.5 group cursor-pointer"
                  >
                    {/* Thumbnail */}
                    <div className="w-14 h-14 rounded-lg bg-slate-100 border border-slate-200 overflow-hidden shrink-0">
                      <img
                        src={relProduct.imageUrl}
                        alt={relProduct.title}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <h4
                        className="text-xs font-semibold text-slate-800 group-hover:text-emerald-600 transition-colors line-clamp-2 leading-snug"
                        title={relProduct.title}
                      >
                        {relProduct.title}
                      </h4>

                      {/* Stars */}
                      <div className="flex items-center gap-0.5 my-0.5 text-amber-400">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-2.5 h-2.5 fill-amber-400 stroke-amber-400"
                          />
                        ))}
                      </div>

                      {/* Price */}
                      <div className="flex items-baseline gap-1 text-xs">
                        {relProduct.isFree ? (
                          <span className="font-extrabold text-emerald-600 text-xs">
                            ফ্রি (FREE)
                          </span>
                        ) : (
                          <>
                            {relProduct.oldPrice && relProduct.oldPrice > relProduct.price && (
                              <span className="text-slate-400 line-through text-[10px]">
                                {formatPrice(relProduct.oldPrice)}
                              </span>
                            )}
                            <span className="font-extrabold text-slate-900 text-xs">
                              {formatPrice(relProduct.price)}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Tabs Section */}
        <div className="mt-10 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-4 border-b border-slate-200 pb-3">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                activeTab === 'description'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              বিবরণ (Description)
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                activeTab === 'features'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              সুবিধাসমূহ
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className={`text-sm font-bold pb-2 border-b-2 transition-colors ${
                activeTab === 'guide'
                  ? 'border-emerald-600 text-emerald-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              ব্যবহার নির্দেশিকা
            </button>
          </div>

          <div className="pt-4 text-sm text-slate-700 leading-relaxed space-y-3">
            {activeTab === 'description' && (
              <div className="whitespace-pre-line">
                {product.description || 'এই প্রোডাক্টের বিবরণ শীঘ্রই আপডেট করা হবে।'}
              </div>
            )}
            {activeTab === 'features' && (
              <ul className="list-disc list-inside space-y-2">
                <li>১০০% জেনুইন এবং ভেরিফাইড মেথড</li>
                <li>লাইফটাইম / ফুল টার্ম আনলিমিটেড অ্যাক্সেস</li>
                <li>ইন্সট্যান্ট অনলাইন ডেলিভারি এবং সাপোর্ট</li>
                <li>২৪/৭ সরাসরি হোয়াটসঅ্যাপ সহায়তা</li>
              </ul>
            )}
            {activeTab === 'guide' && (
              <div className="space-y-2">
                <p>১. "এখনই অর্ডার করুন" বাটন চাপুন।</p>
                <p>২. বিকাশ/নগদ/রকেটের মাধ্যমে মূল্য পরিশোধ করে ট্রানজেকশন আইডি প্রদান করুন।</p>
                <p>৩. সাথে সাথেই আপনার ইনবক্স বা হোয়াটসঅ্যাপে ডেলিভারি ও অ্যাক্টিভেশন পেয়ে যাবেন।</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
