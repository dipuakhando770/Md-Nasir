import React from 'react';
import { Sparkles, Timer, ArrowRight, Zap } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { ProductCard } from '../components/common/ProductCard';
import { formatDate } from '../utils/formatters';

export const WeeklyHighlightsSection: React.FC = () => {
  const { campaigns, products, loading } = useStore();

  const now = Date.now();

  // Find active campaigns within valid time window
  const activeCampaign = campaigns.find((c) => {
    if (!c.active) return false;
    if (c.startAt && c.startAt > now) return false;
    if (c.endAt && c.endAt < now) return false;
    return true;
  });

  if (!loading && !activeCampaign) {
    return null; // Gracefully hide if no active campaign
  }

  if (!activeCampaign) return null;

  // Get products included in campaign
  const campaignProducts = products.filter((p) =>
    activeCampaign.productIds?.includes(p.id)
  );

  if (campaignProducts.length === 0) return null;

  return (
    <section className="py-10 sm:py-14 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Campaign Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold mb-2">
              <Timer className="w-3.5 h-3.5 text-amber-600 animate-spin" style={{ animationDuration: '6s' }} />
              <span>
                {activeCampaign.endAt ? `মেয়াদ: ${formatDate(activeCampaign.endAt)} পর্যন্ত` : 'সীমিত সময়ের অফার'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {activeCampaign.title || 'এই সপ্তাহের সেরা অফার'}
            </h2>
            {activeCampaign.subtitle && (
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                {activeCampaign.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Campaign Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
          {campaignProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
};
