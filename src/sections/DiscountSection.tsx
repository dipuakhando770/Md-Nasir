import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { Flame, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { Product } from '../types';

interface DiscountSectionProps {
  onViewAll?: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const DiscountSection: React.FC<DiscountSectionProps> = ({
  onViewAll,
  onSelectProduct,
}) => {
  const { products, loading } = useStore();
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  // Live countdown timer
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 13,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 8, minutes: 42, seconds: 13 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter discountable products first, fallback to all products if none have oldPrice
  const discountedProducts = products
    .filter((p) => p.oldPrice && p.oldPrice > p.price)
    .sort((a, b) => {
      const discA = ((a.oldPrice! - a.price) / a.oldPrice!) * 100;
      const discB = ((b.oldPrice! - b.price) / b.oldPrice!) * 100;
      return discB - discA;
    });

  const displayList = discountedProducts.length > 0 ? discountedProducts : products;

  // Repeat items enough times so the left-scrolling auto-browse loop is seamless
  const marqueeItems = React.useMemo(() => {
    if (displayList.length === 0) return [];
    const minItems = 12;
    const repeated: Product[] = [];
    while (repeated.length < minItems) {
      repeated.push(...displayList);
    }
    // Duplicate for seamless infinite reset
    return [...repeated, ...repeated];
  }, [displayList]);

  // Continuous smooth auto-scroll towards the left ("অটোমেটিকলি ব্রাউজ হতে থাকবে বামে এনিমেশন করবে")
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || marqueeItems.length === 0) return;

    let animationFrameId: number;
    let accumulatedScroll = container.scrollLeft;
    const speed = 0.85; // Smooth continuous pixels per frame towards left

    const step = () => {
      if (!isPaused && container) {
        accumulatedScroll += speed;
        const halfWidth = container.scrollWidth / 2;
        if (halfWidth > 0 && accumulatedScroll >= halfWidth) {
          accumulatedScroll -= halfWidth;
        }
        container.scrollLeft = accumulatedScroll;
      } else if (container) {
        accumulatedScroll = container.scrollLeft;
      }
      animationFrameId = requestAnimationFrame(step);
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isPaused, marqueeItems.length]);

  const handleManualScroll = (direction: 'left' | 'right') => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const scrollAmount = 260;
    container.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  if (!loading && displayList.length === 0) {
    return null;
  }

  const format2Digits = (num: number) => String(num).padStart(2, '0');

  return (
    <section
      id="discount"
      className="py-6 sm:py-8 relative overflow-hidden bg-gradient-to-b from-emerald-50/50 via-white to-white border-y border-emerald-100/80"
    >
      {/* Subtle Background Bouncing Decor Elements */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-40">
        <motion.div
          animate={{ y: [0, -18, 0], x: [0, 8, 0] }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-6 left-10 w-24 h-24 rounded-full bg-emerald-200/40 blur-2xl"
        />
        <motion.div
          animate={{ y: [0, 18, 0], x: [0, -8, 0] }}
          transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -bottom-6 right-10 w-28 h-28 rounded-full bg-rose-200/40 blur-2xl"
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Header Row: Title + Countdown + Manual Controls */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 text-center sm:text-left">
            <div className="inline-flex items-center gap-2">
              <motion.span
                animate={{ y: [0, -5, 0], scale: [1, 1.1, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/25"
              >
                <Flame className="w-5 h-5 fill-white" />
              </motion.span>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                  <span>ডিসকাউন্ট অফার প্রোডাক্টস!</span>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">
                    <Sparkles className="w-3 h-3" /> অটো-ব্রাউজ লাইভ
                  </span>
                </h2>
              </div>
            </div>

            {/* Countdown Timer */}
            <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
              <span className="text-rose-600 font-bold">অফার শেষ হতে বাকি:</span>
              <div className="flex items-center gap-1 font-mono text-rose-600 text-xs">
                <div className="px-2 py-0.5 rounded-lg border border-rose-300 bg-rose-50/80 font-black text-center min-w-[34px]">
                  {format2Digits(timeLeft.hours)}
                  <span className="block text-[8px] font-sans text-slate-500 font-normal">HRS</span>
                </div>
                <span className="font-bold text-rose-400">:</span>
                <div className="px-2 py-0.5 rounded-lg border border-rose-300 bg-rose-50/80 font-black text-center min-w-[34px]">
                  {format2Digits(timeLeft.minutes)}
                  <span className="block text-[8px] font-sans text-slate-500 font-normal">MIN</span>
                </div>
                <span className="font-bold text-rose-400">:</span>
                <div className="px-2 py-0.5 rounded-lg border border-rose-300 bg-rose-50/80 font-black text-center min-w-[34px]">
                  {format2Digits(timeLeft.seconds)}
                  <span className="block text-[8px] font-sans text-slate-500 font-normal">SEC</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Controls: Left/Right Buttons + View All */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleManualScroll('left')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
              title="বামে দেখুন"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleManualScroll('right')}
              className="w-8 h-8 rounded-full bg-white border border-slate-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-600 flex items-center justify-center shadow-sm transition-colors cursor-pointer"
              title="ডানে দেখুন"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            {onViewAll && (
              <button
                type="button"
                onClick={onViewAll}
                className="ml-1 inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer"
              >
                <span>সব দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Auto-Scrolling Left Marquee Track ("অটোমেটিকলি ব্রাউজ হতে থাকবে বামে এনিমেশন করবে") */}
        <div
          ref={scrollContainerRef}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={() => setIsPaused(true)}
          onTouchEnd={() => {
            setTimeout(() => setIsPaused(false), 1800);
          }}
          className="flex items-stretch gap-3.5 sm:gap-4 overflow-x-auto scrollbar-none py-3 px-1 select-none"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {marqueeItems.map((product, idx) => (
            <motion.div
              key={`${product.id}-${idx}`}
              animate={{
                y: idx % 2 === 0 ? [0, -6, 0] : [0, 6, 0],
              }}
              transition={{
                duration: 2.4 + (idx % 3) * 0.3,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              className="w-[165px] sm:w-[200px] md:w-[215px] shrink-0"
            >
              <ProductCard product={product} onOpenModal={onSelectProduct} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
