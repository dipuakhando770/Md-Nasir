import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, Sparkles, Zap, Star, Gift, Tag } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from './BrandLogo';
import { formatPrice } from '../../utils/formatters';

interface PageLoaderProps {
  isVisible: boolean;
}

const FLOATING_SLOTS = [
  { top: '10%', left: '7%', delay: 0, duration: 2.1, rotate: -6 },
  { top: '14%', right: '8%', delay: 0.25, duration: 2.4, rotate: 6 },
  { bottom: '16%', left: '9%', delay: 0.4, duration: 2.2, rotate: 5 },
  { bottom: '12%', right: '7%', delay: 0.15, duration: 2.5, rotate: -5 },
  { top: '46%', left: '4%', delay: 0.3, duration: 2.3, rotate: -8 },
  { top: '44%', right: '4%', delay: 0.5, duration: 2.0, rotate: 7 },
];

const FALLBACK_BADGES = [
  { label: 'Canva Pro', icon: Sparkles, color: 'from-emerald-500/25 to-teal-500/20' },
  { label: 'Premium Tools', icon: Zap, color: 'from-indigo-500/25 to-blue-500/20' },
  { label: 'Hot Discount', icon: Tag, color: 'from-rose-500/25 to-orange-500/20' },
  { label: 'Instant Access', icon: Gift, color: 'from-violet-500/25 to-purple-500/20' },
  { label: '5★ Rated', icon: Star, color: 'from-amber-500/25 to-yellow-500/20' },
  { label: 'Digital Hub', icon: ShoppingBag, color: 'from-cyan-500/25 to-emerald-500/20' },
];

export const PageLoader: React.FC<PageLoaderProps> = ({ isVisible }) => {
  const { settings, products } = useStore();
  const brandName = settings.websiteName || 'Nasir Digital Hub';
  const loaderLogoUrl = settings.loadingLogoUrl || settings.logoUrl || '';

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          key="global-page-loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03, transition: { duration: 0.4, ease: 'easeInOut' } }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#040711] text-white select-none overflow-hidden"
        >
          {/* Hidden SEO Title & Description in Loader */}
          <span className="sr-only">
            {settings.metaTitle || brandName} — {settings.metaDescription || settings.description}
          </span>

          {/* Dynamic Radial Glows & Grid Backdrop */}
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.38, 0.2],
              }}
              transition={{ duration: 2.8, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-emerald-500/30 via-teal-500/20 to-indigo-600/30 blur-[90px]"
            />
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
                backgroundSize: '36px 36px',
              }}
            />
          </div>

          {/* Background Bouncing Products Animation ("ব্যাকগ্রাউন্ডে প্রোডাক্টগুলো লাফালাফি করবে") */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {FLOATING_SLOTS.map((slot, index) => {
              const product = products[index % Math.max(1, products.length)];
              const fallback = FALLBACK_BADGES[index % FALLBACK_BADGES.length];
              const FallbackIcon = fallback.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30, scale: 0.8 }}
                  animate={{
                    opacity: [0.45, 0.85, 0.45],
                    y: [0, -22, 0],
                    scale: [0.95, 1.06, 0.95],
                    rotate: [slot.rotate, -slot.rotate, slot.rotate],
                  }}
                  transition={{
                    duration: slot.duration,
                    delay: slot.delay,
                    repeat: Infinity,
                    ease: 'easeInOut',
                  }}
                  style={{
                    top: slot.top,
                    bottom: slot.bottom,
                    left: slot.left,
                    right: slot.right,
                  }}
                  className="absolute z-0"
                >
                  {product ? (
                    <div className="w-24 sm:w-32 p-2 rounded-2xl bg-slate-900/75 border border-emerald-500/25 backdrop-blur-md shadow-xl shadow-emerald-500/10 flex flex-col items-center text-center gap-1.5">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-slate-800 overflow-hidden border border-white/10 relative">
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt=""
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-emerald-500/20 text-emerald-400">
                            <ShoppingBag className="w-5 h-5" />
                          </div>
                        )}
                      </div>
                      <span className="text-[10px] font-bold text-slate-200 line-clamp-1 w-full">
                        {product.title}
                      </span>
                      <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                        {formatPrice(product.price)}
                      </span>
                    </div>
                  ) : (
                    <div
                      className={`px-3.5 py-2.5 rounded-2xl bg-gradient-to-br ${fallback.color} border border-white/15 backdrop-blur-md shadow-lg flex items-center gap-2`}
                    >
                      <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-emerald-300">
                        <FallbackIcon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-white/90 whitespace-nowrap">
                        {fallback.label}
                      </span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>

          <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-md w-full">
            {/* Website Logo Showcase with Multi-Layer Orbital Animation */}
            <div className="relative w-44 h-44 sm:w-52 sm:h-52 flex items-center justify-center mb-6">
              {/* Outer Glowing Pulse Ring */}
              <motion.div
                animate={{ scale: [0.92, 1.12, 0.92], opacity: [0.25, 0.6, 0.25] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                className="absolute inset-0 rounded-full bg-gradient-to-tr from-emerald-500/20 to-indigo-500/20 blur-md"
              />

              {/* Outer High-Speed Conic Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-[3px] border-slate-800/80 border-t-emerald-400 border-r-teal-400 shadow-[0_0_25px_rgba(16,185,129,0.3)]"
              />

              {/* Middle Counter-Rotating Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-2.5 rounded-full border-2 border-dashed border-indigo-500/40 border-b-indigo-400"
              />

              {/* Orbiting Dot */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2.2, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-1"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_#34d399] block mx-auto -mt-1" />
              </motion.div>

              {/* Center Website Logo Container */}
              <motion.div
                initial={{ scale: 0.85, opacity: 0 }}
                animate={{ scale: [0.97, 1.04, 0.97], y: [0, -5, 0], opacity: 1 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
                className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-slate-900/90 border border-white/15 shadow-2xl shadow-emerald-500/20 flex items-center justify-center overflow-hidden p-3 backdrop-blur-xl"
              >
                {loaderLogoUrl ? (
                  <img
                    src={loaderLogoUrl}
                    alt={brandName}
                    className="w-full h-full object-contain drop-shadow-[0_2px_12px_rgba(16,185,129,0.4)]"
                  />
                ) : (
                  <BrandLogo variant="loader" />
                )}
              </motion.div>
            </div>

            {/* Animated Laser Progress Bar */}
            <div className="w-52 sm:w-60 h-1.5 bg-slate-800/90 rounded-full overflow-hidden mt-2 p-[1px] border border-slate-700/50 shadow-inner">
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{
                  duration: 1.15,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className="w-full h-full rounded-full bg-gradient-to-r from-transparent via-emerald-400 to-indigo-500 shadow-[0_0_12px_#10b981]"
              />
            </div>

            {/* Loading Status Dots */}
            <div className="flex items-center gap-1.5 mt-3 text-[11px] text-slate-400 font-semibold tracking-wide">
              <span>প্রোডাক্ট লোড হচ্ছে</span>
              <motion.span
                animate={{ opacity: [0.2, 1, 0.2] }}
                transition={{ duration: 1.2, repeat: Infinity }}
                className="text-emerald-400 font-black"
              >
                • • •
              </motion.span>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
