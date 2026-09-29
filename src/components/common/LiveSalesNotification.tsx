import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, CheckCircle2, Zap, X } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types';

export const LiveSalesNotification: React.FC = () => {
  const { products } = useStore();
  const { setSelectedProductForModal } = useCart();
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [locationName, setLocationName] = useState('ঢাকা');
  const [timeAgo, setTimeAgo] = useState('২ মিনিট আগে');
  const [isVisible, setIsVisible] = useState(false);

  const locations = ['ঢাকা', 'চট্টগ্রাম', 'সিলেট', 'রাজশাহী', 'খুলনা', 'বরিশাল', 'রংপুর', 'কুমিল্লা', 'গাজীপুর', 'বগুড়া'];
  const times = ['এইমাত্র', '১ মিনিট আগে', '২ মিনিট আগে', '৪ মিনিট আগে', '৫ মিনিট আগে', '৭ মিনিট আগে'];

  useEffect(() => {
    if (products.length === 0) return;

    const interval = setInterval(() => {
      // Pick random product
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      const randomLoc = locations[Math.floor(Math.random() * locations.length)];
      const randomTime = times[Math.floor(Math.random() * times.length)];

      setCurrentProduct(randomProduct);
      setLocationName(randomLoc);
      setTimeAgo(randomTime);
      setIsVisible(true);

      // Hide after 5 seconds
      setTimeout(() => {
        setIsVisible(false);
      }, 5500);
    }, 14000);

    return () => clearInterval(interval);
  }, [products]);

  if (!currentProduct || !isVisible) return null;

  return (
    <div className="fixed bottom-24 sm:bottom-6 left-4 sm:left-6 z-40 max-w-xs sm:max-w-sm pointer-events-auto">
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={() => setSelectedProductForModal(currentProduct)}
            className="cursor-pointer bg-slate-900/90 hover:bg-slate-900 backdrop-blur-xl border border-indigo-500/30 hover:border-indigo-500/60 rounded-2xl p-3 shadow-2xl flex items-center gap-3 text-slate-100 group transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
              {currentProduct.imageUrl ? (
                <img
                  src={currentProduct.imageUrl}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-indigo-400">
                  <Zap className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                <CheckCircle2 className="w-3 h-3" />
                <span>{locationName} থেকে অর্ডার সম্পন্ন</span>
                <span className="text-slate-500">• {timeAgo}</span>
              </div>
              <h5 className="text-xs font-bold text-white truncate group-hover:text-indigo-300 transition-colors mt-0.5">
                {currentProduct.title}
              </h5>
              <div className="text-[11px] font-extrabold text-indigo-400">
                ৳{currentProduct.price.toLocaleString('en-US')}
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsVisible(false);
              }}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-300 shrink-0"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
