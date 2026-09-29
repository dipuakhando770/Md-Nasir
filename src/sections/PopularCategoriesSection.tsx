import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  Sparkles,
  Palette,
  Film,
  Package,
  Smartphone,
  Laptop,
  CreditCard,
  GraduationCap,
  Globe,
  Database,
  FolderKanban,
  Flame,
  CheckCircle2,
  LayoutGrid,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { CategoryCardSkeleton, ProductCardSkeleton } from '../components/common/SkeletonLoader';
import { ProductCard } from '../components/common/ProductCard';
import { Category } from '../types';
import { normalizeImageUrl } from '../utils/formatters';

interface PopularCategoriesSectionProps {
  onSelectCategory: (category: Category) => void;
}

// Rich category icon and gradient badge mapping
export const getCategoryIconDetails = (catSlugOrName: string) => {
  const s = (catSlugOrName || '').toLowerCase();

  if (s.includes('graphic') || s.includes('canva') || s.includes('design')) {
    return {
      icon: <Palette className="w-7 h-7 sm:w-8 sm:h-8 text-rose-500" />,
      bg: 'bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100/80 border-rose-200/80 text-rose-600',
      activeBg: 'from-rose-500 to-pink-600 text-white',
      ring: 'ring-rose-500/30 border-rose-500',
      badgeBg: 'bg-rose-50 text-rose-600 border-rose-200',
      tag: 'গ্রাফিক্স ও ডিজাইন',
    };
  }
  if (s.includes('video') || s.includes('capcut') || s.includes('premiere')) {
    return {
      icon: <Film className="w-7 h-7 sm:w-8 sm:h-8 text-indigo-500" />,
      bg: 'bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100/80 border-indigo-200/80 text-indigo-600',
      activeBg: 'from-indigo-500 to-violet-600 text-white',
      ring: 'ring-indigo-500/30 border-indigo-500',
      badgeBg: 'bg-indigo-50 text-indigo-600 border-indigo-200',
      tag: 'ভিডিও ও মোশন',
    };
  }
  if (s.includes('bundle') || s.includes('pack') || s.includes('mega')) {
    return {
      icon: <Package className="w-7 h-7 sm:w-8 sm:h-8 text-amber-500" />,
      bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-amber-100/80 border-amber-200/80 text-amber-600',
      activeBg: 'from-amber-500 to-orange-500 text-white',
      ring: 'ring-amber-500/30 border-amber-500',
      badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
      tag: 'মেগা বান্ডেল',
    };
  }
  if (s.includes('mobile') || s.includes('app') || s.includes('android')) {
    return {
      icon: <Smartphone className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />,
      bg: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-emerald-100/80 border-emerald-200/80 text-emerald-600',
      activeBg: 'from-emerald-500 to-teal-600 text-white',
      ring: 'ring-emerald-500/30 border-emerald-500',
      badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      tag: 'প্রো অ্যাপস',
    };
  }
  if (s.includes('pc') || s.includes('soft') || s.includes('windows') || s.includes('office')) {
    return {
      icon: <Laptop className="w-7 h-7 sm:w-8 sm:h-8 text-blue-500" />,
      bg: 'bg-gradient-to-br from-blue-50 via-cyan-50 to-blue-100/80 border-blue-200/80 text-blue-600',
      activeBg: 'from-blue-500 to-cyan-600 text-white',
      ring: 'ring-blue-500/30 border-blue-500',
      badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
      tag: 'সফটওয়্যার',
    };
  }
  if (s.includes('subscript') || s.includes('netflix') || s.includes('chatgpt')) {
    return {
      icon: <CreditCard className="w-7 h-7 sm:w-8 sm:h-8 text-purple-500" />,
      bg: 'bg-gradient-to-br from-purple-50 via-fuchsia-50 to-purple-100/80 border-purple-200/80 text-purple-600',
      activeBg: 'from-purple-500 to-fuchsia-600 text-white',
      ring: 'ring-purple-500/30 border-purple-500',
      badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
      tag: 'সাবস্ক্রিপশন',
    };
  }
  if (s.includes('tutorial') || s.includes('course') || s.includes('marketing') || s.includes('ads')) {
    return {
      icon: <GraduationCap className="w-7 h-7 sm:w-8 sm:h-8 text-orange-500" />,
      bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100/80 border-orange-200/80 text-orange-600',
      activeBg: 'from-orange-500 to-red-500 text-white',
      ring: 'ring-orange-500/30 border-orange-500',
      badgeBg: 'bg-orange-50 text-orange-700 border-orange-200',
      tag: 'কোর্স ও গাইড',
    };
  }
  if (s.includes('web') || s.includes('wordpress') || s.includes('template')) {
    return {
      icon: <Globe className="w-7 h-7 sm:w-8 sm:h-8 text-teal-500" />,
      bg: 'bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100/80 border-teal-200/80 text-teal-600',
      activeBg: 'from-teal-500 to-emerald-600 text-white',
      ring: 'ring-teal-500/30 border-teal-500',
      badgeBg: 'bg-teal-50 text-teal-700 border-teal-200',
      tag: 'ওয়েব টেমপ্লেট',
    };
  }
  if (s.includes('data') || s.includes('list') || s.includes('excel')) {
    return {
      icon: <Database className="w-7 h-7 sm:w-8 sm:h-8 text-sky-500" />,
      bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-sky-100/80 border-sky-200/80 text-sky-600',
      activeBg: 'from-sky-500 to-blue-600 text-white',
      ring: 'ring-sky-500/30 border-sky-500',
      badgeBg: 'bg-sky-50 text-sky-700 border-sky-200',
      tag: 'ডেটাবেস ও শিটস',
    };
  }

  return {
    icon: <FolderKanban className="w-7 h-7 sm:w-8 sm:h-8 text-emerald-500" />,
    bg: 'bg-gradient-to-br from-slate-50 via-emerald-50/60 to-teal-50 border-slate-200 text-emerald-600',
    activeBg: 'from-emerald-500 to-teal-600 text-white',
    ring: 'ring-emerald-500/30 border-emerald-500',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tag: 'ডিজিটাল রিসোর্স',
  };
};

export const PopularCategoriesSection: React.FC<PopularCategoriesSectionProps> = ({
  onSelectCategory,
}) => {
  const { categories, products, loading } = useStore();
  const [activeTabId, setActiveTabId] = useState<string>('all');

  const activeCategories = categories.filter((c) => c.active !== false);

  if (!loading && activeCategories.length === 0) {
    return null;
  }

  const getProductCountForCategory = (catId: string) => {
    return products.filter((p) => p.categoryId === catId && p.available !== false).length;
  };

  // Hit products for the currently selected category tab
  const filteredHitProducts = React.useMemo(() => {
    const available = products.filter((p) => p.available !== false);
    if (activeTabId === 'all') {
      // Sort by featured/discount/rating so best hit products appear first
      return [...available]
        .sort((a, b) => {
          const scoreA = (a.featured ? 10 : 0) + (a.oldPrice && a.oldPrice > a.price ? 5 : 0);
          const scoreB = (b.featured ? 10 : 0) + (b.oldPrice && b.oldPrice > b.price ? 5 : 0);
          return scoreB - scoreA;
        })
        .slice(0, 10);
    }
    return available.filter((p) => p.categoryId === activeTabId).slice(0, 10);
  }, [products, activeTabId]);

  const currentSelectedCategory = activeCategories.find((c) => c.id === activeTabId);

  return (
    <section
      id="categories"
      className="py-10 sm:py-14 bg-gradient-to-b from-slate-50/70 via-white to-slate-50/40 border-y border-slate-200/70 relative overflow-hidden"
    >
      {/* Soft ambient background accents for visual comfort */}
      <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-emerald-100/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-indigo-100/40 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 text-center md:text-left">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-extrabold mb-2.5 shadow-2xs">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
              <span>হিট প্রোডাক্ট ও ক্যাটাগরি এক্সপ্লোরার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              হিট প্রোডাক্টগুলো ক্যাটাগরি অনুযায়ী ব্রাউজ করুন
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl">
              আপনার পছন্দের ক্যাটাগরিতে ক্লিক করে তাৎক্ষণিকভাবে সেরা হিট প্রোডাক্টগুলো দেখুন এবং এক ক্লিকেই অর্ডার করুন
            </p>
          </div>

          <div className="flex items-center justify-center md:justify-end gap-2">
            <button
              type="button"
              onClick={() => setActiveTabId('all')}
              className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTabId === 'all'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                  : 'bg-white text-slate-700 border border-slate-200 hover:border-emerald-400'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>সব হিট প্রোডাক্ট ({products.length})</span>
            </button>
          </div>
        </div>

        {/* Categories Grid: Ultra-Comfortable, Tactile, Interactive Cards */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5 sm:gap-4">
            {activeCategories.map((category) => {
              const count = getProductCountForCategory(category.id);
              const isSelected = activeTabId === category.id;
              const { icon, bg, ring, badgeBg, tag } = getCategoryIconDetails(
                category.slug || category.name
              );

              return (
                <motion.div
                  key={category.id}
                  whileHover={{ y: -5, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    if (activeTabId === category.id) {
                      onSelectCategory(category);
                    } else {
                      setActiveTabId(category.id);
                    }
                  }}
                  className={`group cursor-pointer p-4 sm:p-5 rounded-2xl sm:rounded-3xl transition-all duration-300 flex flex-col items-center text-center justify-between relative overflow-hidden ${
                    isSelected
                      ? `bg-white border-2 ring-4 ${ring} shadow-xl`
                      : 'bg-white/95 hover:bg-white border border-slate-200/90 hover:border-emerald-400 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10'
                  }`}
                >
                  {/* Top Category Tag Pill */}
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border mb-3 ${badgeBg}`}
                  >
                    {tag}
                  </span>

                  {/* Prominent Icon / Image Container */}
                  <div className="relative mb-3.5">
                    <div
                      className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl sm:rounded-3xl p-3 border flex items-center justify-center overflow-hidden shrink-0 shadow-xs group-hover:scale-105 transition-all duration-300 ${bg}`}
                    >
                      {category.imageUrl ? (
                        <img
                          src={normalizeImageUrl(category.imageUrl)}
                          alt={category.name}
                          className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                        />
                      ) : (
                        icon
                      )}
                    </div>

                    {/* Product count badge */}
                    <span
                      className={`absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full font-black text-[10px] shadow-sm border-2 border-white transition-colors ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-900 text-white group-hover:bg-emerald-600'
                      }`}
                    >
                      {count} টি
                    </span>
                  </div>

                  {/* Category Name & Comfortable Action Hint */}
                  <div className="w-full space-y-1">
                    <h3 className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-1">
                      {category.name}
                    </h3>
                    <div className="flex items-center justify-center gap-1 text-[11px] font-semibold text-slate-500 group-hover:text-emerald-600 transition-colors">
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600 font-bold">নির্বাচিত ক্যাটাগরি</span>
                        </>
                      ) : (
                        <>
                          <span>প্রোডাক্ট দেখুন</span>
                          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                        </>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

        {/* Instant Hit Products Showcase for Selected Category */}
        <div className="mt-8 sm:mt-10 bg-white rounded-3xl border border-slate-200/90 p-4 sm:p-6 lg:p-7 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-5 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 flex items-center gap-2">
                  <span>
                    {currentSelectedCategory
                      ? `${currentSelectedCategory.name} — হিট প্রোডাক্টসমূহ`
                      : '🔥 সেরা হিট প্রোডাক্টসমূহ (সব ক্যাটাগরি)'}
                  </span>
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {filteredHitProducts.length} টি প্রোডাক্ট
                  </span>
                </h3>
                <p className="text-xs text-slate-500">
                  {currentSelectedCategory?.description ||
                    'উপরের যেকোনো ক্যাটাগরিতে ট্যাপ করে সেই ক্যাটাগরির প্রোডাক্টগুলো এখানে সাথে সাথে দেখুন'}
                </p>
              </div>
            </div>

            {currentSelectedCategory && (
              <button
                type="button"
                onClick={() => onSelectCategory(currentSelectedCategory)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer shrink-0"
              >
                <span>{currentSelectedCategory.name}-এর সব পণ্য দেখুন</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
              {[...Array(5)].map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTabId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4"
              >
                {filteredHitProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
};
