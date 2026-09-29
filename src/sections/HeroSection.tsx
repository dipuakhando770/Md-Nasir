import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  ChevronRight,
  Zap,
  ShieldCheck,
  Flame,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { HeroSlide } from '../types';
import { DEFAULT_HD_HERO_SLIDES } from '../constants/defaultBanners';
import { normalizeImageUrl } from '../utils/formatters';

interface HeroSectionProps {
  onShopClick: (categoryId?: string) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ onShopClick }) => {
  const { settings, categories } = useStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);

  // Active slides (filter active !== false, with fallback to Ultra-HD Default slides)
  const slides: HeroSlide[] = React.useMemo(() => {
    if (settings.heroSlides && settings.heroSlides.length > 0) {
      const activeList = settings.heroSlides.filter((s) => s.active !== false);
      if (activeList.length > 0) {
        return activeList.sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
      }
    }

    // If single custom hero image exists
    if (settings.heroMediaUrl) {
      return [
        {
          id: 'custom-single',
          imageUrl: settings.heroMediaUrl,
          active: true,
          sortOrder: 1,
        },
      ];
    }

    // Fallback to high definition default banners
    return DEFAULT_HD_HERO_SLIDES;
  }, [settings]);

  const slideIntervalSec = Math.max(2, settings.heroSlideInterval || 4);
  const autoSlideEnabled = settings.heroAutoSlide !== false && slides.length > 1;

  // Preload all active slides for instant, zero-latency HD transitions
  useEffect(() => {
    if (slides.length > 0) {
      slides.forEach((slide) => {
        const cleanUrl = normalizeImageUrl(slide.imageUrl);
        if (cleanUrl) {
          const preImg = new Image();
          preImg.src = cleanUrl;
        }
      });
    }
  }, [slides]);

  // Auto-play interval timer
  useEffect(() => {
    if (!autoSlideEnabled || isPaused) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, slideIntervalSec * 1000);

    return () => clearInterval(timer);
  }, [autoSlideEnabled, isPaused, slides.length, slideIntervalSec]);

  // Handle slide index bounds safety
  useEffect(() => {
    if (currentIndex >= slides.length) {
      setCurrentIndex(0);
    }
  }, [slides.length, currentIndex]);

  const handlePrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0) {
        handleNext();
      } else {
        handlePrev();
      }
    }
    touchStartX.current = null;
  };

  const handleSlideAction = (slide: HeroSlide) => {
    if (slide.linkUrl) {
      // Check if it matches category id/slug
      const matchedCat = categories.find(
        (c) => c.id === slide.linkUrl || c.slug === slide.linkUrl
      );
      if (matchedCat) {
        onShopClick(matchedCat.id);
        return;
      }

      if (slide.linkUrl.startsWith('http')) {
        window.open(slide.linkUrl, '_blank', 'noopener,noreferrer');
        return;
      }

      if (slide.linkUrl.startsWith('#')) {
        const el = document.querySelector(slide.linkUrl);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth' });
          return;
        }
      }
    }
    onShopClick();
  };

  const currentSlide = slides[currentIndex] || slides[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-3 pb-2">
      {/* Pure, Crystal Clear HD Banner Slider (Full Image Auto — Zero Crop) */}
      {currentSlide && (
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={() => handleSlideAction(currentSlide)}
          className="relative w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-950 group select-none cursor-pointer ring-1 ring-slate-900/5 transition-all"
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id || currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: 'easeInOut' }}
              className="w-full flex items-center justify-center bg-slate-950"
            >
              {/* Ultra HD Banner Full Image (100% Full Uncropped View) */}
              <img
                src={normalizeImageUrl(currentSlide.imageUrl)}
                alt="HD Hero Banner"
                loading="eager"
                fetchPriority="high"
                decoding="async"
                style={{
                  imageRendering: 'auto',
                  WebkitBackfaceVisibility: 'hidden',
                  backfaceVisibility: 'hidden',
                  transform: 'translateZ(0)',
                }}
                className="w-full h-auto block object-contain select-none transition-transform duration-500 ease-out"
              />

              {/* Ultra-subtle high-end glass edge highlight */}
              <div className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl ring-1 ring-inset ring-white/10" />
            </motion.div>
          </AnimatePresence>

          {/* Navigation Arrows (Visible on hover when multiple slides exist) */}
          {slides.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Previous Slide"
                className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                type="button"
                onClick={handleNext}
                aria-label="Next Slide"
                className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white backdrop-blur-md shadow-xl border border-white/20 flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 hover:scale-110 z-20 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              {/* Pagination Indicator Dots */}
              <div className="absolute bottom-2.5 sm:bottom-4 inset-x-0 flex items-center justify-center gap-1.5 sm:gap-2 z-20">
                <div className="px-3 py-1.5 rounded-full bg-slate-950/60 backdrop-blur-md border border-white/15 flex items-center gap-1.5 sm:gap-2 shadow-lg">
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id || idx}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCurrentIndex(idx);
                      }}
                      aria-label={`Go to slide ${idx + 1}`}
                      className={`h-2 sm:h-2.5 rounded-full transition-all duration-300 cursor-pointer ${
                        currentIndex === idx
                          ? 'w-7 sm:w-9 bg-emerald-400 shadow-md shadow-emerald-500/50 ring-1 ring-white/60'
                          : 'w-2 sm:w-2.5 bg-white/50 hover:bg-white/90'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Trust Micro-Features Bar underneath (RaduanBD Signature Fast Highlights) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mt-3">
        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-emerald-200 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">তাৎক্ষণিক ডেলিভারি</h4>
            <p className="text-[10px] text-slate-500 truncate">অর্ডার শেষেই অটো এক্সেস</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-blue-200 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">১০০% জেনুইন লাইসেন্স</h4>
            <p className="text-[10px] text-slate-500 truncate">আজীবন মেয়াদের নিশ্চয়তা</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-amber-200 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">সেরা সাশ্রয়ী অফার</h4>
            <p className="text-[10px] text-slate-500 truncate">সর্বোচ্চ ৭০% পর্যন্ত ছাড়</p>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs hover:border-purple-200 transition-colors">
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-slate-900 truncate">২৪/৭ সরাসরি সাপোর্ট</h4>
            <p className="text-[10px] text-slate-500 truncate">হোয়াটসঅ্যাপ লাইভ হেল্পলাইন</p>
          </div>
        </div>
      </div>
    </div>
  );
};

