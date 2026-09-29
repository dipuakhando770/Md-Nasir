import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { getCategoryIconDetails } from './PopularCategoriesSection';

interface DynamicCategorySectionsProps {
  onSelectCategory: (category: Category) => void;
}

export const DynamicCategorySections: React.FC<DynamicCategorySectionsProps> = ({
  onSelectCategory,
}) => {
  const { categories, products } = useStore();

  const categoriesWithProducts = categories
    .filter((c) => c.active !== false)
    .map((category) => {
      const categoryProducts = products.filter(
        (product) => product.categoryId === category.id && product.available !== false
      );
      return {
        category,
        categoryProducts,
      };
    })
    .filter((item) => item.categoryProducts.length > 0);

  if (categoriesWithProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8 sm:space-y-12 py-4">
      {categoriesWithProducts.map(({ category, categoryProducts }) => {
        const { icon, bg, badgeBg, tag } = getCategoryIconDetails(
          category.slug || category.name
        );
        const displayName =
          category.name === 'Graphic'
            ? 'Graphic Design'
            : category.name === 'Video'
              ? 'Video Editing'
              : category.name === 'Tutorial'
                ? 'Tutorials'
                : category.name;

        return (
          <section key={category.id} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-4 sm:p-6 lg:p-7 shadow-xs hover:shadow-md transition-shadow">
              {/* Comfortable Category Header Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 mb-6 border-b border-slate-100">
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-2.5 border flex items-center justify-center shrink-0 shadow-2xs ${bg}`}
                  >
                    {category.imageUrl ? (
                      <img
                        src={category.imageUrl}
                        alt={displayName}
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      icon
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${badgeBg}`}
                      >
                        {tag}
                      </span>
                      <span className="text-[11px] font-bold text-slate-400">
                        • {categoryProducts.length} টি প্রোডাক্ট
                      </span>
                    </div>
                    <h3 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                      {displayName}
                    </h3>
                    {category.description && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => onSelectCategory(category)}
                  className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-sm shadow-emerald-600/20 transition-colors cursor-pointer shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>সব দেখুন ({categoryProducts.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </motion.button>
              </div>

              {/* 5-Column Products Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5 sm:gap-4">
                {categoryProducts.slice(0, 5).map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
};
