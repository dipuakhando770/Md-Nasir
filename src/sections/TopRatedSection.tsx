import React from 'react';
import { Star } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';

export const TopRatedSection: React.FC = () => {
  const { products, loading } = useStore();

  const ratedProducts = products
    .filter((p) => (p.rating || 0) >= 4.5)
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));

  if (!loading && ratedProducts.length === 0) {
    return null;
  }

  return (
    <section id="top-rated" className="py-10 sm:py-14 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              <span>গ্রাহক সন্তুষ্টি</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
              সেরা রেটিং প্রাপ্ত পণ্যসমূহ
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              ব্যবহারকারীদের সর্বোচ্চ রেটিং ও রিভিউ প্রাপ্ত প্রিমিয়াম কালেকশন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {ratedProducts.slice(0, 6).map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
