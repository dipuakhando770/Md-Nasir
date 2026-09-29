import React from 'react';
import { ArrowRight, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface PromotionalBannerSectionProps {
  onCtaClick: () => void;
}

export const PromotionalBannerSection: React.FC<PromotionalBannerSectionProps> = ({ onCtaClick }) => {
  const { settings } = useStore();

  return (
    <section className="py-8 sm:py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-8 sm:p-12 shadow-xl text-white border border-slate-800">
        {/* Decorative ambient shapes */}
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-3.5 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>প্রিমিয়াম ডিজিটাল প্রোডাক্টস হাব</span>
            </div>

            <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              আপনার অনলাইন প্রজেক্ট ও ক্যারিয়ারকে দিন সর্বোচ্চ গতি
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed mx-auto lg:mx-0">
              সহজে এবং দ্রুততম সময়ে লাইসেন্স প্রাপ্ত প্রিমিয়াম ডিজিটাল সম্পদ সংগ্রহ করুন। শতভাগ জেনুইন সার্ভিস এবং সার্বক্ষণিক প্রযুক্তিগত সহায়তার নিশ্চয়তা।
            </p>

            <div className="pt-2 flex flex-wrap gap-4 justify-center lg:justify-start text-xs text-slate-300 font-medium">
              <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                <ShieldCheck className="w-4 h-4" /> ভেরিফাইড লাইসেন্স
              </span>
              <span className="flex items-center gap-1.5 text-amber-300 font-bold">
                <Zap className="w-4 h-4" /> তাৎক্ষণিক অ্যাক্সেস
              </span>
            </div>
          </div>

          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <button
              type="button"
              onClick={onCtaClick}
              className="px-8 py-4 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/40 flex items-center gap-2.5 active:scale-95 transition-all group"
            >
              <span>পণ্যগুলো অন্বেষণ করুন</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
