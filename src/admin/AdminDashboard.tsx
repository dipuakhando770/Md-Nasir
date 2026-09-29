import React, { useState, useEffect } from 'react';
import {
  Package,
  Layers,
  Sparkles,
  Flame,
  CheckCircle2,
  Database,
  ArrowRight,
  ShoppingCart,
  Settings,
  PlusCircle,
  TrendingUp,
  CreditCard,
  Clock,
  Zap,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { seedInitialCatalog } from '../utils/seedData';
import { formatPrice } from '../utils/formatters';
import { Order } from '../types';
import { subscribeToOrders } from '../firebase/services';

interface AdminDashboardProps {
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateTab }) => {
  const { products, categories, settings, getCategoryName } = useStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);

  useEffect(() => {
    const unsub = subscribeToOrders(
      (newOrders) => {
        setOrders(newOrders);
      },
      (err) => {
        console.error('Error in dashboard orders subscription:', err);
      }
    );
    return () => unsub();
  }, []);

  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.available).length;
  const activeBanners = (settings.heroSlides || []).filter((s) => s.active !== false).length;

  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter(
    (o) =>
      o.status === 'pending' ||
      (!o.status && o.paymentStatus !== 'paid' && o.paymentStatus !== 'completed')
  );
  const paidOrdersCount = orders.filter(
    (o) =>
      o.paymentStatus === 'paid' ||
      o.status === 'completed' ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes('paybd') && o.status !== 'cancelled')
  ).length;

  const totalRevenue = orders.reduce((sum, o) => {
    const isPaid =
      o.paymentStatus === 'paid' ||
      o.status === 'completed' ||
      (o.paymentMethod && o.paymentMethod.toLowerCase().includes('paybd') && o.status !== 'cancelled');
    return isPaid ? sum + (Number(o.total) || 0) : sum;
  }, 0);

  const handleSeedCatalog = async () => {
    if (
      window.confirm(
        'আপনি কি প্রাথমিক ক্যাটাগরি, ডিজিটাল পণ্য এবং সুবিধাসমূহ ডাটাবেজে যুক্ত করতে চান?'
      )
    ) {
      setIsSeeding(true);
      try {
        await seedInitialCatalog();
        setSeedSuccess(true);
        setTimeout(() => setSeedSuccess(false), 4000);
      } catch (err) {
        console.error('Seed catalog failed:', err);
        alert('ডাটাবেজ সিড করতে সমস্যা হয়েছে।');
      } finally {
        setIsSeeding(false);
      }
    }
  };

  const statCards = [
    {
      title: 'মোট বিক্রয় (Total Revenue)',
      value: formatPrice(totalRevenue),
      subtext: `${paidOrdersCount} টি সফল পেমেন্ট থেকে`,
      icon: TrendingUp,
      color: 'from-emerald-500 to-teal-600',
      tab: 'orders',
    },
    {
      title: 'অপেক্ষমাণ অর্ডার (Pending Approval)',
      value: `${pendingOrders.length} টি`,
      subtext: pendingOrders.length > 0 ? '⚠️ ম্যানুয়াল অনুমোদন প্রয়োজন' : 'সব অর্ডার সম্পন্ন',
      icon: Clock,
      color: 'from-amber-500 to-amber-600',
      tab: 'orders',
      isPendingCard: true,
    },
    {
      title: 'মোট পণ্য (Products)',
      value: totalProducts,
      subtext: `${availableProducts} টি স্টকে সক্রিয়`,
      icon: Package,
      color: 'from-indigo-500 to-indigo-600',
      tab: 'products',
    },
    {
      title: 'ক্যাটাগরি ও ব্যানার',
      value: categories.length,
      subtext: `${activeBanners} টি স্লাইডার ব্যানার সক্রিয়`,
      icon: Layers,
      color: 'from-purple-500 to-purple-600',
      tab: 'categories',
    },
  ];

  return (
    <div className="space-y-7">
      {/* Pending Orders Action Banner if any exist */}
      {pendingOrders.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/15 border-2 border-amber-500/40 text-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl animate-fadeIn">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="font-black text-sm text-white flex items-center gap-2">
                <span>{pendingOrders.length} টি অর্ডার অনুমোদনের অপেক্ষায় রয়েছে!</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/30 text-amber-300 text-[10px] font-black">
                  Action Required
                </span>
              </h4>
              <p className="text-xs text-amber-300/80 mt-0.5">
                গ্রাহক পেমেন্ট করেছেন বা অর্ডার সাবমিট করেছেন। ১-ক্লিকে ম্যানুয়ালি অ্যাপ্রুভ করে ডিজিটাল লিঙ্ক ডেলিভারি দিন।
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-lg shadow-amber-500/20 transition-all cursor-pointer shrink-0"
          >
            <Zap className="w-4 h-4" />
            <span>অর্ডার অ্যাপ্রুভ করুন →</span>
          </button>
        </div>
      )}

      {/* Welcome & Quick Action Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            স্বাগতম, {settings.websiteName || 'Nasir Digital Hub'} কন্ট্রোল সেন্টারে
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-xl">
            আপনার ডিজিটাল স্টোরের লাইভ অর্ডার অনুমোদন, PayBD পেমেন্ট হিস্ট্রি, পণ্য ও সেটিংস পরিচালনা করুন।
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => onNavigateTab('orders')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>অর্ডার ও হিস্ট্রি দেখুন ({totalOrdersCount})</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigateTab('products')}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>নতুন পণ্য যোগ করুন</span>
          </button>

          {totalProducts === 0 && (
            <button
              type="button"
              onClick={handleSeedCatalog}
              disabled={isSeeding}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-2 border border-slate-700 transition-all disabled:opacity-50 cursor-pointer"
            >
              <Database className="w-4 h-4" />
              <span>{isSeeding ? 'যুক্ত হচ্ছে...' : 'ডেমো ক্যাটালগ লোড'}</span>
            </button>
          )}

          {seedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4" /> ক্যাটালগ সফলভাবে তৈরি হয়েছে!
            </span>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              onClick={() => onNavigateTab(stat.tab)}
              className={`p-5 rounded-3xl bg-slate-900 border cursor-pointer transition-all duration-200 group flex flex-col justify-between shadow-lg ${
                stat.isPendingCard && pendingOrders.length > 0
                  ? 'border-amber-500/40 hover:border-amber-400 ring-1 ring-amber-500/30'
                  : 'border-slate-800 hover:border-indigo-500/40'
              }`}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-slate-400">{stat.title}</span>
                <div
                  className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform`}
                >
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-white">{stat.value}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{stat.subtext}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Management Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          onClick={() => onNavigateTab('orders')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <ShoppingCart className="w-4 h-4 text-emerald-400" />
              <span>ম্যানুয়াল অর্ডার অনুমোদন ও ডেলিভারি</span>
            </h4>
            <ArrowRight className="w-4 h-4 text-emerald-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            পেন্ডিং অর্ডার পর্যালোচনা করুন, ১-ক্লিকে ম্যানুয়ালি অ্যাপ্রুভ করুন এবং গ্রাহকের ইমেইলে ফাইল লিঙ্ক পাঠান
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('hero')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>হিরো ব্যানার ও স্লাইডার</span>
            </h4>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            হোমপেজের অটোমেটিক স্লাইডার ব্যানার আপলোড, লিঙ্ক ও স্লাইড স্পিড পরিবর্তন করুন
          </p>
        </div>

        <div
          onClick={() => onNavigateTab('paybd')}
          className="p-5 rounded-3xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-colors group"
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-bold text-white text-sm flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-amber-400" />
              <span>PayBD পেমেন্ট গেটওয়ে</span>
            </h4>
            <ArrowRight className="w-4 h-4 text-indigo-400 group-hover:translate-x-1 transition-transform" />
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            ব্র্যান্ড কী, সিক্রেট কী, লাইভ টেস্ট পিং এবং অটোমেটিক Webhook ও WHMCS ইন্টিগ্রেশন
          </p>
        </div>
      </div>

      {/* Recent Products Quick Table */}
      {products.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-white">স্টোরের সক্রিয় পণ্যসমূহ</h3>
            <button
              type="button"
              onClick={() => onNavigateTab('products')}
              className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>সব পণ্য পরিচালনা করুন</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.slice(0, 6).map((prod) => (
              <div
                key={prod.id}
                onClick={() => onNavigateTab('products')}
                className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 flex items-center gap-3 cursor-pointer transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                  {prod.imageUrl ? (
                    <img src={prod.imageUrl} alt={prod.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600">
                      <Package className="w-5 h-5" />
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-xs font-bold text-white truncate">{prod.title}</h4>
                  <div className="flex items-center justify-between mt-1">
                    <span className="text-[11px] text-slate-400">{getCategoryName(prod.categoryId)}</span>
                    <span className="text-xs font-black text-emerald-400">{formatPrice(prod.price)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
