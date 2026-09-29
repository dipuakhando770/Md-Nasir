import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpDown,
  Tag,
  CheckCircle2,
  PackageOpen,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { ProductCard } from '../components/common/ProductCard';
import { EmptyState } from '../components/common/EmptyState';
import { calculateDiscount } from '../utils/formatters';

interface ShopPageProps {
  onSelectProduct?: (product: Product) => void;
}

export const ShopPage: React.FC<ShopPageProps> = ({ onSelectProduct }) => {
  const { products, categories, selectedCategory, setSelectedCategory, searchQuery, setSearchQuery } =
    useStore();

  const [sortOption, setSortOption] = useState<
    'default' | 'price-low' | 'price-high' | 'discount' | 'rating'
  >('default');
  const [selectedType, setSelectedType] = useState<'all' | 'digital' | 'physical'>('all');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [onlyDiscounted, setOnlyDiscounted] = useState(false);
  const [onlyFree, setOnlyFree] = useState(false);

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter((p) => {
        const titleMatch = p.title.toLowerCase().includes(q);
        const descMatch = p.description?.toLowerCase().includes(q);
        const tagsMatch = p.tags?.some((t) => t.toLowerCase().includes(q));
        const catMatch = categories
          .find((c) => c.id === p.categoryId)
          ?.name.toLowerCase()
          .includes(q);
        return titleMatch || descMatch || tagsMatch || catMatch;
      });
    }

    // Category filter
    if (selectedCategory) {
      list = list.filter((p) => p.categoryId === selectedCategory);
    }

    // Product type filter
    if (selectedType !== 'all') {
      list = list.filter((p) => p.type === selectedType);
    }

    // Availability filter
    if (onlyAvailable) {
      list = list.filter((p) => p.available);
    }

    // Discount filter
    if (onlyDiscounted) {
      list = list.filter((p) => p.oldPrice && p.oldPrice > p.price);
    }

    // Free product filter
    if (onlyFree) {
      list = list.filter((p) => Boolean(p.isFree));
    }

    // Sorting
    switch (sortOption) {
      case 'price-low':
        list.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        list.sort((a, b) => b.price - a.price);
        break;
      case 'discount':
        list.sort((a, b) => {
          const dA = calculateDiscount(a.price, a.oldPrice);
          const dB = calculateDiscount(b.price, b.oldPrice);
          return dB - dA;
        });
        break;
      case 'rating':
        list.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case 'default':
      default:
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        break;
    }

    return list;
  }, [
    products,
    categories,
    searchQuery,
    selectedCategory,
    selectedType,
    onlyAvailable,
    onlyDiscounted,
    onlyFree,
    sortOption,
  ]);

  const clearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory(null);
    setSelectedType('all');
    setOnlyAvailable(false);
    setOnlyDiscounted(false);
    setOnlyFree(false);
    setSortOption('default');
  };

  const hasActiveFilters =
    Boolean(searchQuery) ||
    Boolean(selectedCategory) ||
    selectedType !== 'all' ||
    onlyAvailable ||
    onlyDiscounted ||
    onlyFree;

  return (
    <div className="min-h-screen py-8 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
            ডিজিটাল শপ ও প্রোডাক্টস
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            আপনার পছন্দের ক্যাটাগরি ও ফিল্টার নির্বাচন করে প্রয়োজনীয় পণ্যটি খুঁজে নিন
          </p>
        </div>

        {/* Search & Filter Controls Bar */}
        <div className="bg-white border border-slate-200 rounded-3xl p-4 sm:p-5 mb-8 shadow-xs space-y-4">
          {/* Top Row: Search & Sort */}
          <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="পণ্য, সফটওয়্যার বা কি-ওয়ার্ড দিয়ে খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-900 focus:outline-none placeholder:text-slate-400 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Sort Options */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold text-slate-500 hidden sm:inline-flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5" /> সাজান:
              </span>
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value as typeof sortOption)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs sm:text-sm rounded-xl px-3.5 py-2.5 focus:outline-none focus:border-emerald-500 font-medium"
              >
                <option value="default">নতুন পণ্য (Default)</option>
                <option value="price-low">মূল্য: কম থেকে বেশি</option>
                <option value="price-high">মূল্য: বেশি থেকে কম</option>
                <option value="discount">সর্বোচ্চ ছাড়</option>
                <option value="rating">সেরা রেটিং</option>
              </select>
            </div>
          </div>

          {/* Categories Pill Scroller */}
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === null
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
              }`}
            >
              সকল পণ্য ({products.length})
            </button>
            {categories
              .filter((c) => c.active !== false)
              .map((cat) => {
                const count = products.filter((p) => p.categoryId === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                      selectedCategory === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-50 text-slate-600 hover:text-emerald-700 border border-slate-200'
                    }`}
                  >
                    {cat.name} ({count})
                  </button>
                );
              })}
          </div>

          {/* Additional Filter Chips */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setOnlyFree(!onlyFree)}
                className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                  onlyFree
                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-emerald-700'
                }`}
              >
                <span>🎁 ফ্রি প্রোডাক্টস (Free)</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyDiscounted(!onlyDiscounted)}
                className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                  onlyDiscounted
                    ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>🔥 শুধুমাত্র ছাড়ের পণ্য</span>
              </button>

              <button
                type="button"
                onClick={() => setOnlyAvailable(!onlyAvailable)}
                className={`px-3 py-1.5 rounded-xl border transition-colors flex items-center gap-1.5 ${
                  onlyAvailable
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-bold'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>✅ স্টকে আছে</span>
              </button>

              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value as typeof selectedType)}
                className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-2.5 py-1.5 focus:outline-none"
              >
                <option value="all">সকল ধরন</option>
                <option value="digital">ডিজিটাল পণ্য</option>
                <option value="physical">ফিজিক্যাল পণ্য</option>
              </select>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-emerald-600 hover:text-emerald-700 flex items-center gap-1 font-semibold ml-auto"
              >
                <X className="w-3.5 h-3.5" /> ফিল্টার রিসেট করুন
              </button>
            )}
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between text-xs text-slate-500 mb-6 font-medium">
          <span>মোট {filteredProducts.length} টি পণ্য পাওয়া গেছে</span>
        </div>

        {/* Product Cards Grid or Empty State */}
        {filteredProducts.length === 0 ? (
          <EmptyState
            icon={PackageOpen}
            title={
              searchQuery
                ? 'আপনার সার্চের সাথে মিলছে এমন কোনো পণ্য পাওয়া যায়নি'
                : 'কোনো পণ্য পাওয়া যায়নি'
            }
            description="অন্য কোনো কি-ওয়ার্ড দিয়ে চেষ্টা করুন অথবা ফিল্টার পরিবর্তন করে দেখুন।"
            actionText="ফিল্টার রিসেট করুন"
            onAction={clearAllFilters}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenModal={onSelectProduct}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
