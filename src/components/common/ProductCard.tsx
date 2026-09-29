import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Star, Zap, Check, Eye, ExternalLink, Download, Gift } from 'lucide-react';
import { Product } from '../../types';
import { formatPrice, calculateDiscount, triggerFreeProductDownload, normalizeImageUrl } from '../../utils/formatters';
import { useCart } from '../../context/CartContext';
import { getProductPath } from '../../utils/slugify';

interface ProductCardProps {
  product: Product;
  onOpenModal?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onOpenModal }) => {
  const { addToCart, setIsCheckoutOpen } = useCart();
  const [imgError, setImgError] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState(false);

  const isFreeProduct = Boolean(product.isFree);
  const discountPercent = calculateDiscount(product.price, product.oldPrice);
  const hasLivePreview = Boolean(
    product.livePreviewEnabled && product.livePreviewUrl && product.livePreviewUrl.trim()
  );

  const handleCardClick = () => {
    window.history.pushState(null, '', getProductPath(product));
    window.dispatchEvent(new PopStateEvent('popstate'));
    if (onOpenModal) {
      onOpenModal(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsCheckoutOpen(true);
  };

  const handleFreeDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerFreeProductDownload(product);
    setIsDownloaded(true);
    setTimeout(() => setIsDownloaded(false), 2200);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 26, scale: 0.93 }}
      animate={{ opacity: 1, y: [26, -8, 0], scale: [0.93, 1.03, 1] }}
      transition={{ duration: 0.55, ease: 'easeOut' }}
      whileHover={{ y: -7, scale: 1.015 }}
      onClick={handleCardClick}
      className="group bg-white rounded-xl border border-slate-200 hover:border-emerald-500 shadow-sm hover:shadow-xl transition-shadow duration-300 flex flex-col justify-between overflow-hidden cursor-pointer relative h-full"
    >
      {/* Top Image Poster (Fixed frame with 100% full original graphic visibility — zero crop) */}
      <div className="relative aspect-square w-full bg-slate-50/80 flex items-center justify-center overflow-hidden p-2">
        {product.imageUrl && !imgError ? (
          <img
            src={normalizeImageUrl(product.imageUrl)}
            alt={product.title}
            loading="lazy"
            onError={() => setImgError(true)}
            className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500 ease-out"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 p-4">
            <Zap className="w-10 h-10 text-emerald-500/60 mb-1 animate-pulse" />
            <span className="text-xs font-semibold text-slate-600 text-center line-clamp-2">
              {product.title}
            </span>
          </div>
        )}

        {/* Top Left Badge: Free Product OR Discount */}
        {isFreeProduct ? (
          <motion.div
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute top-2 left-2 z-10"
          >
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] shadow-md inline-flex items-center gap-1">
              <Gift className="w-3 h-3" />
              <span>১০০% ফ্রি</span>
            </span>
          </motion.div>
        ) : (
          discountPercent > 0 && (
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-2 left-2 z-10"
            >
              <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-extrabold text-[11px] shadow-sm inline-block">
                -{discountPercent}% ছাড়
              </span>
            </motion.div>
          )
        )}

        {/* Top-Right Live Preview Badge (when enabled by Admin) */}
        {hasLivePreview && (
          <a
            href={product.livePreviewUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-900/90 hover:bg-indigo-600 text-white font-bold text-[10px] shadow-md backdrop-blur-xs transition-colors"
            title="Live Preview দেখুন"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Live Demo</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        )}

        {/* Quick Action Hover Overlay */}
        <div className="absolute inset-x-2 bottom-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1.5">
          {isFreeProduct ? (
            <button
              type="button"
              onClick={handleFreeDownload}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloaded ? 'ডাউনলোড শুরু হয়েছে!' : 'ফ্রি ডাউনলোড করুন'}</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={handleBuyNow}
              className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>অর্ডার করুন</span>
            </button>
          )}
        </div>
      </div>

      {/* Card Content */}
      <div className="p-3 sm:p-3.5 flex-1 flex flex-col justify-between space-y-2">
        <div>
          {/* Title */}
          <h3
            className="font-bold text-slate-800 text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-emerald-600 transition-colors"
            title={product.title}
          >
            {product.title}
          </h3>

          {/* 5-Star Ratings */}
          <div className="flex items-center gap-0.5 my-1 text-amber-400">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className="w-3 h-3 fill-amber-400 stroke-amber-400"
              />
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {/* Professional Live Preview Button (Shown ONLY when Admin enables Live Preview + URL) */}
          {hasLivePreview && (
            <a
              href={product.livePreviewUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-1.5 px-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-[11px] sm:text-xs font-extrabold shadow-xs hover:shadow-md flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
            >
              <Eye className="w-3.5 h-3.5 shrink-0" />
              <span>Live Preview</span>
              <ExternalLink className="w-3 h-3 shrink-0 opacity-90" />
            </a>
          )}

          {/* Price & Action Row */}
          <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between gap-2">
            {isFreeProduct ? (
              <>
                <div className="flex items-baseline gap-1.5">
                  {product.oldPrice && product.oldPrice > 0 ? (
                    <span className="text-[11px] text-slate-400 line-through tabular-nums">
                      {formatPrice(product.oldPrice)}
                    </span>
                  ) : null}
                  <span className="text-xs sm:text-sm font-black text-emerald-600 uppercase tracking-tight">
                    ফ্রি (FREE)
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleFreeDownload}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-extrabold flex items-center gap-1 shadow-xs transition-colors cursor-pointer whitespace-nowrap"
                  title="কোনো পেমেন্ট ছাড়াই ফ্রি ডাউনলোড করুন"
                >
                  {isDownloaded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>ডাউনলোড</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>ফ্রি ডাউনলোড</span>
                    </>
                  )}
                </button>
              </>
            ) : (
              <>
                <div className="flex items-baseline gap-1.5">
                  {product.oldPrice && product.oldPrice > product.price && (
                    <span className="text-[11px] text-slate-400 line-through tabular-nums">
                      {formatPrice(product.oldPrice)}
                    </span>
                  )}
                  <span className="text-sm sm:text-base font-black text-slate-900 tabular-nums">
                    {formatPrice(product.price)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleAddToCart}
                  className={`p-1.5 rounded-lg border text-xs transition-colors cursor-pointer ${
                    isAdded
                      ? 'bg-emerald-50 text-emerald-600 border-emerald-300'
                      : 'bg-slate-50 hover:bg-emerald-600 hover:text-white text-slate-600 border-slate-200'
                  }`}
                  title="ব্যাগে যোগ করুন"
                >
                  {isAdded ? <Check className="w-3.5 h-3.5" /> : <ShoppingBag className="w-3.5 h-3.5" />}
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};
