import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';

interface LatestProductsSectionProps {
  onViewAll?: () => void;
}

export const LatestProductsSection: React.FC<LatestProductsSectionProps> = ({ onViewAll }) => {
  const { products, loading } = useStore();

  const latestProducts = [...products].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

  if (!loading && latestProducts.length === 0) {
    return null;
  }

  return (
    <section id="latest" className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>নতুন সংযোজন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              লেটেস্ট ডিজিটাল পণ্যসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              মার্কেটপ্লেসে সদ্য যুক্ত হওয়া আধুনিক টুলস ও রিসোর্স
            </p>
          </div>

          {onViewAll && latestProducts.length > 5 && (
            <button
              type="button"
              onClick={onViewAll}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
            >
              <span>সকল নতুন পণ্য দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {latestProducts.slice(0, 12).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
