import React, { useState } from 'react';
import {
  LayoutDashboard,
  Package,
  Layers,
  Sparkles,
  Settings,
  Flame,
  ShieldCheck,
  ShoppingCart,
  LogOut,
  Store,
  Zap,
  CreditCard,
  Activity,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useStore } from '../context/StoreContext';
import { AdminLogin } from './AdminLogin';
import { AdminDashboard } from './AdminDashboard';
import { ProductManager } from './ProductManager';
import { CategoryManager } from './CategoryManager';
import { HeroSettingsManager } from './HeroSettingsManager';
import { StoreSettingsManager } from './StoreSettingsManager';
import { CampaignsManager } from './CampaignsManager';
import { BenefitsManager } from './BenefitsManager';
import { OrdersManager } from './OrdersManager';
import { PaybdManager } from './PaybdManager';
import { AnalyticsDashboard } from './AnalyticsDashboard';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const { user, isAdmin, logout } = useAuth();
  const { settings, products, categories, campaigns } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const activeBannersCount = (settings.heroSlides || []).filter((s) => s.active !== false).length;
  const isPaybdActive = settings.paybd?.enabled !== false;

  const tabs = [
    { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
    { id: 'analytics', label: '📊 অ্যানালিটিক্স ও ট্র্যাকিং', icon: Activity },
    { id: 'products', label: 'পণ্যসমূহ', icon: Package, badge: products.length },
    { id: 'categories', label: 'ক্যাটাগরি', icon: Layers, badge: categories.length },
    { id: 'hero', label: 'হিরো ও ব্যানার', icon: Sparkles, badge: activeBannersCount },
    { id: 'orders', label: 'অর্ডারসমূহ', icon: ShoppingCart },
    { id: 'campaigns', label: 'সাপ্তাহিক অফার', icon: Flame, badge: campaigns.length },
    { id: 'benefits', label: 'সুবিধাসমূহ', icon: ShieldCheck },
    {
      id: 'paybd',
      label: 'পেমেন্ট গেটওয়ে (PayBD)',
      icon: CreditCard,
      badge: isPaybdActive ? 'Active' : 'Off',
    },
    { id: 'settings', label: 'ওয়েবসাইট সেটিংস', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Executive Admin Top Command Bar */}
        <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800/90 rounded-3xl p-4 sm:p-5 mb-6 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-500/10 shrink-0">
              {settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt={settings.websiteName}
                  className="w-full h-full object-contain p-1.5"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-tr from-indigo-600 to-emerald-500 flex items-center justify-center text-white">
                  <ShieldCheck className="w-6 h-6" />
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-black text-white text-base sm:text-lg tracking-tight">
                  {settings.websiteName || 'Nasir Digital Hub'} — অ্যাডমিন প্যানেল
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/25">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  ক্লাউড সিঙ্ক সক্রিয়
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                অ্যাডমিন: <span className="text-slate-200 font-medium">{user.email || user.uid.slice(0, 10)}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="px-3.5 py-2 rounded-xl bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/25 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>পণ্য যোগ করুন</span>
            </button>

            <button
              type="button"
              onClick={onBackToStore}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>লাইভ স্টোর দেখুন</span>
            </button>

            <button
              type="button"
              onClick={logout}
              className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>লগআউট</span>
            </button>
          </div>
        </div>

        {/* Navigation Pill Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 whitespace-nowrap transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-lg shadow-indigo-600/30 ring-1 ring-indigo-400/40'
                    : 'bg-slate-900/90 text-slate-400 hover:text-white border border-slate-800/80 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] font-extrabold ${
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Active Tab Workspace */}
        <div className="min-h-[540px]">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'hero' && <HeroSettingsManager />}
          {activeTab === 'campaigns' && <CampaignsManager />}
          {activeTab === 'benefits' && <BenefitsManager />}
          {activeTab === 'paybd' && <PaybdManager />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'settings' && <StoreSettingsManager />}
        </div>
      </div>
    </div>
  );
};
