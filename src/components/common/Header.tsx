import React, { useState, useRef, useEffect } from 'react';
import {
  ShoppingBag,
  Search,
  Phone,
  Menu,
  X,
  Sparkles,
  Flame,
  ArrowRight,
  ChevronDown,
  LayoutGrid,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { useCart } from '../../context/CartContext';
import { sanitizeWhatsAppNumber } from '../../utils/formatters';
import { BrandLogo } from './BrandLogo';

interface HeaderProps {
  currentView: 'home' | 'shop' | 'admin' | 'product';
  setCurrentView: (view: 'home' | 'shop' | 'admin' | 'product') => void;
  onSelectCategory?: (categoryId?: string) => void;
  onOpenOrderHistory?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  setCurrentView,
  onSelectCategory,
  onOpenOrderHistory,
}) => {
  const { settings, categories, searchQuery, setSearchQuery, setSelectedCategory, selectedCategory } = useStore();
  const { cartCount, setIsCartOpen, setIsCheckoutOpen } = useCart();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoryDropdownOpen, setCategoryDropdownOpen] = useState(false);
  const [localSearch, setLocalSearch] = useState(searchQuery);
  const [userOrdersCount, setUserOrdersCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const data = localStorage.getItem('ndh_user_order_history_v1');
      return data ? JSON.parse(data).length : 0;
    } catch {
      return 0;
    }
  });
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const data = localStorage.getItem('ndh_user_order_history_v1');
        setUserOrdersCount(data ? JSON.parse(data).length : 0);
      } catch {
        setUserOrdersCount(0);
      }
    };
    window.addEventListener('ndh_user_orders_updated', handleUpdate);
    return () => window.removeEventListener('ndh_user_orders_updated', handleUpdate);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(localSearch);
    if (currentView !== 'shop') {
      setCurrentView('shop');
      window.history.pushState(null, '', '/shop');
    }
  };

  const handleCategoryClick = (catId?: string) => {
    setSelectedCategory(catId || null);
    setCategoryDropdownOpen(false);
    if (onSelectCategory) {
      onSelectCategory(catId);
    } else {
      setCurrentView('shop');
      window.history.pushState(null, '', '/shop');
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const displayCategories = categories;

  const whatsappPhone = settings.whatsappNumber || '01962780922';
  const targetNumber = sanitizeWhatsAppNumber(whatsappPhone);
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি ডিজিটাল প্রোডাক্ট সম্পর্কে জানতে চাচ্ছি।')}`;

  return (
    <header className="sticky top-0 z-40 w-full shadow-sm bg-white">
      {/* 1. Top Notice Announcement Bar (Live Right-to-Left Broadcast Telecast Ticker) */}
      {settings.announcement?.enabled !== false && (
        <div className="bg-[#0b0f19] text-slate-200 text-xs py-2 px-3 sm:px-4 border-b border-slate-800/80 overflow-hidden relative shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            {/* Left Telecast Heading Pill Badge */}
            <div className="shrink-0 z-10 flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[11px] sm:text-xs px-2.5 sm:px-3 py-1 rounded-full shadow-md">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse-glow" />
              <span className="tracking-wide uppercase">🔥 আজকের অফার</span>
            </div>

            {/* Continuous Smooth Right-to-Left Scrolling Broadcast Ticker */}
            <div className="flex-1 overflow-hidden relative cursor-pointer group flex items-center">
              <div className="animate-marquee whitespace-nowrap flex items-center gap-12 text-xs sm:text-sm font-semibold text-emerald-300">
                <span className="flex items-center gap-2">
                  <span>
                    {settings.announcement?.text ||
                      '🔥 আজকের বিশেষ অফার — প্রিমিয়াম সকল ডিজিটাল প্রোডাক্টে পাচ্ছেন আকর্ষণীয় ছাড় ও ইন্সট্যান্ট অটো ডেলিভারি!'}
                  </span>
                  <span className="text-amber-400 font-bold">★ ১০০% জেনুইন ও ভেরিফাইড প্রোডাক্ট</span>
                  <span className="text-emerald-400 font-bold">★ ২৪/৭ লাইভ সাপোর্ট</span>
                </span>

                <span className="flex items-center gap-2" aria-hidden="true">
                  <span>
                    {settings.announcement?.text ||
                      '🔥 আজকের বিশেষ অফার — প্রিমিয়াম সকল ডিজিটাল প্রোডাক্টে পাচ্ছেন আকর্ষণীয় ছাড় ও ইন্সট্যান্ট অটো ডেলিভারি!'}
                  </span>
                  <span className="text-amber-400 font-bold">★ ১০০% জেনুইন ও ভেরিফাইড প্রোডাক্ট</span>
                  <span className="text-emerald-400 font-bold">★ ২৪/৭ লাইভ সাপোর্ট</span>
                </span>
              </div>
            </div>

            {/* Quick Links on Large Screens */}
            <div className="hidden xl:flex items-center gap-2.5 text-[11px] text-slate-400 shrink-0 z-10 pl-2 border-l border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setCurrentView('shop');
                  window.history.pushState(null, '', '/shop');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="hover:text-emerald-400 transition-colors cursor-pointer font-medium"
              >
                সব পণ্য দেখুন →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Main Crisp White Header (Screenshot Reference Logo System) */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 sm:gap-6">
          {/* Logo & Hidden Browser SEO Title */}
          <div className="flex items-center gap-3 shrink-0">
            <h1 className="sr-only">
              {settings.metaTitle || settings.websiteName || 'Nasir Digital Hub'} —{' '}
              {settings.metaDescription || settings.description}
            </h1>
            <button
              type="button"
              onClick={() => {
                setCurrentView('home');
                window.location.hash = '';
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="flex items-center text-left group cursor-pointer focus:outline-none"
              aria-label={settings.websiteName || 'Nasir Digital Hub'}
            >
              <BrandLogo variant="header" />
            </button>
          </div>

          {/* Center: Search Bar with "All Categories" Dropdown & Green "Search" Button (Matching Screenshot 833) */}
          <div className="flex-1 max-w-2xl hidden md:block">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center border-2 border-emerald-600 rounded-full overflow-hidden bg-white shadow-sm">
              {/* Category Dropdown inside search */}
              <select
                value={selectedCategory || ''}
                onChange={(e) => {
                  const cat = e.target.value;
                  setSelectedCategory(cat || null);
                  if (currentView !== 'shop') {
                    setCurrentView('shop');
                  }
                }}
                className="bg-slate-50 border-r border-slate-200 px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
              >
                <option value="">All Categories</option>
                {displayCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>

              {/* Input Field */}
              <input
                type="text"
                placeholder="Search..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="flex-1 px-4 py-2 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none"
              />

              {/* Green Search Button */}
              <button
                type="submit"
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right: WhatsApp Phone & User Account (Matching Screenshot 832 & 833) */}
          <div className="flex items-center gap-4 sm:gap-6 shrink-0">
            {/* WhatsApp Contact */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:flex items-center gap-2 group text-left"
            >
              <div className="w-8 h-8 rounded-full border border-slate-300 flex items-center justify-center text-slate-700 group-hover:border-emerald-600 group-hover:text-emerald-600 transition-colors">
                <Phone className="w-4 h-4" />
              </div>
              <div className="text-xs">
                <span className="block text-[10px] text-slate-500 font-medium">WhatsApp</span>
                <span className="block font-black text-slate-900 group-hover:text-emerald-600 transition-colors">
                  {whatsappPhone}
                </span>
              </div>
            </a>

            {/* My Orders History Button */}
            {onOpenOrderHistory && (
              <button
                type="button"
                onClick={onOpenOrderHistory}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 border border-slate-200 text-xs font-bold transition-all cursor-pointer shadow-xs relative"
                title="আমার পূর্ববর্তী অর্ডার হিস্ট্রি দেখুন"
              >
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                <span>আমার অর্ডার</span>
                {userOrdersCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full bg-emerald-600 text-white text-[10px] font-black">
                    {userOrdersCount}
                  </span>
                )}
              </button>
            )}

            {/* Cart Icon Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 rounded-full hover:bg-slate-100 text-slate-700 transition-colors"
              title="শপিং ব্যাগ"
            >
              <ShoppingBag className="w-5 h-5 text-slate-800" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[10px] flex items-center justify-center shadow">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Mobile Menu Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-700 md:hidden"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar */}
        <div className="mt-2.5 md:hidden">
          <form onSubmit={handleSearchSubmit} className="flex items-center border border-emerald-600 rounded-full overflow-hidden bg-white">
            <input
              type="text"
              placeholder="Search..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="px-4 py-1.5 bg-emerald-600 text-white text-xs font-bold"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* 3. Subheader Category Menu with Professional Dropdown (Clean & User-Friendly) */}
      <div className="bg-slate-50 border-b border-slate-200 px-4 sm:px-6 lg:px-8 hidden md:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 py-2">
            {/* Category Dropdown Menu Button */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setCategoryDropdownOpen(!categoryDropdownOpen)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                  categoryDropdownOpen
                    ? 'bg-emerald-600 text-white'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>সকল ক্যাটাগরি</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    categoryDropdownOpen ? 'rotate-180 text-white' : 'text-emerald-700'
                  }`}
                />
              </button>

              {/* Dropdown Flyout Panel */}
              {categoryDropdownOpen && (
                <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl border border-slate-200 shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-100 mb-1 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      ক্যাটাগরি ব্রাউজ করুন
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(undefined)}
                      className="text-[11px] font-bold text-emerald-600 hover:underline"
                    >
                      সব দেখুন
                    </button>
                  </div>

                  <div className="space-y-1 max-h-80 overflow-y-auto pr-1">
                    <button
                      type="button"
                      onClick={() => handleCategoryClick(undefined)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                        !selectedCategory
                          ? 'bg-emerald-50 text-emerald-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span>✨</span>
                        <span>সকল ডিজিটাল পণ্য (All)</span>
                      </span>
                      {!selectedCategory && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </button>

                    {displayCategories.map((cat) => {
                      const isSelected = selectedCategory === cat.id;
                      return (
                        <button
                          key={cat.id}
                          type="button"
                          onClick={() => handleCategoryClick(cat.id)}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-left transition-colors ${
                            isSelected
                              ? 'bg-emerald-50 text-emerald-700 font-bold'
                              : 'text-slate-700 hover:bg-slate-50 hover:text-emerald-600'
                          }`}
                        >
                          <span className="flex items-center gap-2 truncate">
                            <span>{cat.icon || '📁'}</span>
                            <span className="truncate">{cat.name}</span>
                          </span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Category Shortcut Pills (Short & Comfortable) */}
            <nav className="flex items-center gap-1.5 overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  setSelectedCategory(null);
                  setCurrentView('home');
                  window.history.pushState(null, '', '/');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  currentView === 'home' && !selectedCategory
                    ? 'text-emerald-700 bg-emerald-100/70'
                    : 'text-slate-700 hover:text-emerald-600 hover:bg-white'
                }`}
              >
                হোম
              </button>

              {displayCategories.slice(0, 6).map((cat) => {
                const isSelected = selectedCategory === cat.id && currentView === 'shop';
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => handleCategoryClick(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                      isSelected
                        ? 'text-emerald-700 bg-emerald-100/70 font-bold'
                        : 'text-slate-700 hover:text-emerald-600 hover:bg-white'
                    }`}
                  >
                    <span>{cat.icon || '•'}</span>
                    <span>{cat.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Top Offers Shortcut on Right */}
          <button
            type="button"
            onClick={() => {
              setSelectedCategory(null);
              setCurrentView('shop');
              window.history.pushState(null, '', '/shop');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="shrink-0 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors ml-4 border border-rose-200/60 shadow-sm"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
            <span>হট অফারস!</span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-3 shadow-lg animate-in slide-in-from-top-2 duration-150">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setCurrentView('home');
                window.history.pushState(null, '', '/');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-800 text-left"
            >
              🏠 হোম পেজ
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedCategory(null);
                setCurrentView('shop');
                window.history.pushState(null, '', '/shop');
                setMobileMenuOpen(false);
              }}
              className="p-2.5 rounded-xl bg-emerald-50 text-xs font-bold text-emerald-700 text-left"
            >
              🛍️ সকল প্রোডাক্ট
            </button>
          </div>

          {/* Mobile Category List */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[11px] font-bold text-slate-400 mb-2 uppercase">ক্যাটাগরি সমূহ</p>
            <div className="grid grid-cols-1 gap-1.5 max-h-60 overflow-y-auto">
              {displayCategories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id)}
                  className="flex items-center gap-2 p-2 rounded-lg text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 text-left"
                >
                  <span>{cat.icon || '📁'}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
