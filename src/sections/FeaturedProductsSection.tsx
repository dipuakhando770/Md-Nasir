import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { ProductCardSkeleton } from '../components/common/SkeletonLoader';

interface FeaturedProductsSectionProps {
  onViewAll?: () => void;
}

export const FeaturedProductsSection: React.FC<FeaturedProductsSectionProps> = ({ onViewAll }) => {
  const { products, loading } = useStore();

  const featuredProducts = products.filter((p) => p.featured);

  if (!loading && featuredProducts.length === 0) {
    return null;
  }

  return (
    <section id="featured" className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>স্পটলাইট কালেকশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              জনপ্রিয় ফিচার্ড পণ্য (Featured)
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              আমাদের প্ল্যাটফর্মের সর্বাধিক প্রশংসিত ও বেশি ব্যবহৃত ডিজিটাল পণ্যসমূহ
            </p>
          </div>

          {onViewAll && featuredProducts.length > 5 && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span>সব ফিচার্ড পণ্য দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {featuredProducts.slice(0, 12).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
