import React from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ArrowRight,
  FolderArchive,
  Palette,
  Film,
  Package,
  Smartphone,
  Laptop,
  CreditCard,
  GraduationCap,
  Globe,
  Database,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Category } from '../../types';

interface QuickCategoryBarProps {
  onSelectCategory: (cat: Category) => void;
  onViewAll: () => void;
}

const getQuickCategoryIcon = (slugOrName: string) => {
  const s = (slugOrName || '').toLowerCase();
  if (s.includes('graphic') || s.includes('canva')) {
    return <Palette className="w-4 h-4 text-rose-600" />;
  }
  if (s.includes('video') || s.includes('capcut')) {
    return <Film className="w-4 h-4 text-indigo-600" />;
  }
  if (s.includes('bundle') || s.includes('pack')) {
    return <Package className="w-4 h-4 text-amber-600" />;
  }
  if (s.includes('mobile') || s.includes('app')) {
    return <Smartphone className="w-4 h-4 text-emerald-600" />;
  }
  if (s.includes('pc') || s.includes('soft') || s.includes('windows')) {
    return <Laptop className="w-4 h-4 text-blue-600" />;
  }
  if (s.includes('subscript') || s.includes('netflix') || s.includes('chatgpt')) {
    return <CreditCard className="w-4 h-4 text-purple-600" />;
  }
  if (s.includes('tutorial') || s.includes('course')) {
    return <GraduationCap className="w-4 h-4 text-orange-600" />;
  }
  if (s.includes('web') || s.includes('wordpress')) {
    return <Globe className="w-4 h-4 text-teal-600" />;
  }
  if (s.includes('data') || s.includes('excel')) {
    return <Database className="w-4 h-4 text-sky-600" />;
  }
  return <FolderArchive className="w-4 h-4 text-emerald-600" />;
};

export const QuickCategoryBar: React.FC<QuickCategoryBarProps> = ({
  onSelectCategory,
  onViewAll,
}) => {
  const { categories, products } = useStore();

  const activeCategories = categories.filter((c) => c.active !== false);

  if (activeCategories.length === 0) return null;

  return (
    <div className="py-2.5 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 uppercase tracking-wider">
              ডিজিটাল ক্যাটাগরি (Browse Categories)
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewAll}
            className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 transition-colors"
          >
            <span>সব পণ্য দেখুন</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable category pills with prominent icons */}
        <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
          {activeCategories.map((cat) => {
            const count = products.filter((p) => p.categoryId === cat.id).length;
            const icon = getQuickCategoryIcon(cat.slug || cat.name);

            return (
              <motion.button
                key={cat.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => onSelectCategory(cat)}
                className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 transition-all text-left shrink-0 group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform shadow-xs">
                  {cat.imageUrl ? (
                    <img src={cat.imageUrl} alt={cat.name} className="w-5 h-5 object-contain" />
                  ) : (
                    icon
                  )}
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 group-hover:text-emerald-700">
                    {cat.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {count} টি পণ্য
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
