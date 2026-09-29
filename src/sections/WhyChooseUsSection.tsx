import React from 'react';
import {
  Zap,
  ShieldCheck,
  Headphones,
  Award,
  Clock,
  CheckCircle2,
  HeartHandshake,
  Sparkles,
  Layers,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Benefit } from '../types';

export const WhyChooseUsSection: React.FC = () => {
  const { benefits } = useStore();

  const iconMap: Record<string, React.ReactNode> = {
    zap: <Zap className="w-6 h-6 text-amber-500" />,
    shield: <ShieldCheck className="w-6 h-6 text-emerald-600" />,
    headphones: <Headphones className="w-6 h-6 text-indigo-600" />,
    award: <Award className="w-6 h-6 text-rose-500" />,
    clock: <Clock className="w-6 h-6 text-blue-600" />,
    check: <CheckCircle2 className="w-6 h-6 text-teal-600" />,
    handshake: <HeartHandshake className="w-6 h-6 text-purple-600" />,
    sparkles: <Sparkles className="w-6 h-6 text-yellow-500" />,
  };

  // Default fallback benefits
  const defaultBenefits: Benefit[] = [
    {
      id: '1',
      icon: 'zap',
      title: 'তাত্ক্ষণিক ডেলিভারি',
      description: 'অর্ডারের সাথে সাথে আপনার ইমেইল বা হোয়াটসঅ্যাপে সরাসরি অ্যাক্সেস লিংক ও বিস্তারিত গাইড পৌঁছে যাবে।',
      active: true,
      sortOrder: 1,
    },
    {
      id: '2',
      icon: 'shield',
      title: '১০০% জেনুইন ও নিরাপদ',
      description: 'সকল ডিজিটাল পণ্য ও সফটওয়্যার লাইসেন্স সম্পূর্ণ অথেন্টিক এবং বিশ্বস্ত সোর্স থেকে সরবরাহকৃত।',
      active: true,
      sortOrder: 2,
    },
    {
      id: '3',
      icon: 'headphones',
      title: 'ডেডিকেটেড টেকনিক্যাল সাপোর্ট',
      description: 'যেকোনো ইন্সটলেশন বা কনফিগারেশন সংক্রান্ত সমস্যায় সরাসরি WhatsApp হেল্পলাইনে সার্বক্ষণিক সমাধান।',
      active: true,
      sortOrder: 3,
    },
    {
      id: '4',
      icon: 'award',
      title: 'সহজ ও সাশ্রয়ী মূল্য',
      description: 'বাংলাদেশের ফ্রিল্যান্সার, ডিজাইনার এবং বিজনেসের জন্য সর্বোচ্চ কোয়ালিটির রিসোর্স সবচেয়ে সাশ্রয়ী মূল্যে।',
      active: true,
      sortOrder: 4,
    },
  ];

  const activeBenefits =
    benefits && benefits.length > 0
      ? benefits.filter((b) => b.active !== false)
      : defaultBenefits;

  return (
    <section id="benefits" className="py-12 sm:py-16 bg-white border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>আমাদের সেবার বিশেষত্ব ও সুবিধা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            কেন নাসির ডিজিটাল হাব বেছে নেবেন?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            আমরা শুধু ডিজিটাল পণ্য বিক্রি করি না, প্রতিটি পণ্যের সঠিক ব্যবহার ও শতভাগ সহায়তা নিশ্চিত করি
          </p>
        </div>

        {/* Benefit Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {activeBenefits.map((benefit, idx) => {
            const iconKey = benefit.icon?.toLowerCase() || 'zap';
            const iconElement = iconMap[iconKey] || <Zap className="w-6 h-6 text-amber-500" />;

            return (
              <div
                key={benefit.id || idx}
                className="p-6 rounded-3xl bg-white border border-slate-200 hover:border-emerald-500 transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1 shadow-xs hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:bg-emerald-50 group-hover:border-emerald-200 transition-all duration-300 shadow-xs">
                    {iconElement}
                  </div>
                  <h3 className="text-base font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
