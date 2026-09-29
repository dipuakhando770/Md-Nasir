import React from 'react';
import { ShieldCheck, CheckCircle2 } from 'lucide-react';

export const TrustPaymentBanner: React.FC = () => {
  return (
    <section className="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-sm">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Left: Security & Guarantees */}
          <div className="lg:col-span-7 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>১০০% নিরাপদ ও বিশ্বস্ত পেমেন্ট সিস্টেম</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              সহজ লেনদেন ও তাৎক্ষণিক লাইসেন্স ডেলিভারি
            </h3>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl">
              বিকাশ, নগদ, রকেট অথবা ব্যাংক পেমেন্ট সম্পন্ন করে সাথে সাথে আপনার ডিজিটাল পণ্যের সম্পূর্ণ অ্যাক্সেস গ্রহণ করুন।
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>ইন্সট্যান্ট অ্যাক্সেস</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>২৪/৭ লাইভ সাপোর্ট</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>মানিব্যাক গ্যারান্টি</span>
              </div>
            </div>
          </div>

          {/* Right: Payment Method Badges */}
          <div className="lg:col-span-5 flex flex-col items-center lg:items-end justify-center">
            <p className="text-xs text-slate-500 font-bold mb-2.5">সমর্থিত পেমেন্ট মেথডসমূহ:</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full max-w-md">
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-pink-50 border border-pink-200 text-[#E2136E] font-black text-xs">
                <span>bKash (বিকাশ)</span>
              </div>
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-orange-50 border border-orange-200 text-[#d87b0a] font-black text-xs">
                <span>Nagad (নগদ)</span>
              </div>
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-purple-50 border border-purple-200 text-[#8C3494] font-black text-xs">
                <span>Rocket (রকেট)</span>
              </div>
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-bold text-xs">
                <span>Upay (উপায়)</span>
              </div>
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 font-bold text-xs">
                <span>Bank Transfer</span>
              </div>
              <div className="flex items-center justify-center p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 font-bold text-xs">
                <span>Visa / Master</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
