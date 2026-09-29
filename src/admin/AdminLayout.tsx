import React, { useState, useEffect } from 'react';
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
  Menu,
  X,
  Search,
  BellRing,
  ExternalLink,
  ChevronRight,
  UserCheck,
  Moon,
  Globe,
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
import { SeoHealthDashboard } from './SeoHealthDashboard';
import { subscribeToOrders } from '../firebase/services';
import { Order } from '../types';

interface AdminLayoutProps {
  onBackToStore: () => void;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | number;
  badgeColor?: string;
}

interface NavGroup {
  group: string;
  items: NavItem[];
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ onBackToStore }) => {
  const { user, isAdmin, logout } = useAuth();
  const { settings, products, categories, campaigns } = useStore();
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(0);

  useEffect(() => {
    const unsub = subscribeToOrders((orders: Order[]) => {
      const pending = orders.filter(
        (o) =>
          o.status === 'pending' ||
          (!o.status && o.paymentStatus !== 'paid' && o.paymentStatus !== 'completed')
      ).length;
      setPendingOrdersCount(pending);
    });
    return () => unsub();
  }, []);

  if (!user || !isAdmin) {
    return <AdminLogin />;
  }

  const activeBannersCount = (settings.heroSlides || []).filter((s) => s.active !== false).length;
  const isPaybdActive = settings.paybd?.enabled !== false;

  const navItems: NavGroup[] = [
    {
      group: 'মূল মেনু',
      items: [
        { id: 'dashboard', label: 'ড্যাশবোর্ড', icon: LayoutDashboard },
        {
          id: 'orders',
          label: 'অর্ডার ও অনুমোদন',
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} টি পেন্ডিং` : undefined,
          badgeColor: 'bg-amber-500 text-slate-950 font-black animate-pulse',
        },
        { id: 'analytics', label: 'লাইভ অ্যানালিটিক্স', icon: Activity },
      ],
    },
    {
      group: 'ক্যাটালগ ও কন্টেন্ট',
      items: [
        { id: 'products', label: 'পণ্যসমূহ (Products)', icon: Package, badge: products.length },
        { id: 'categories', label: 'ক্যাটাগরি সমূহ', icon: Layers, badge: categories.length },
        { id: 'hero', label: 'হিরো ব্যানার স্লাইডার', icon: Sparkles, badge: activeBannersCount },
        { id: 'campaigns', label: 'সাপ্তাহিক অফার', icon: Flame, badge: campaigns.length },
        { id: 'benefits', label: 'সুবিধাসমূহ (Trust)', icon: ShieldCheck },
      ],
    },
    {
      group: 'সিস্টেম ও কনফিগারেশন',
      items: [
        {
          id: 'paybd',
          label: 'PayBD পেমেন্ট গেটওয়ে',
          icon: CreditCard,
          badge: isPaybdActive ? 'সক্রিয়' : 'বন্ধ',
          badgeColor: isPaybdActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400',
        },
        {
          id: 'seo',
          label: 'SEO ও কনভার্সন মনিটর',
          icon: Globe,
          badge: 'রেডি',
          badgeColor: 'bg-emerald-500/20 text-emerald-400',
        },
        { id: 'settings', label: 'ওয়েবসাইট ও SMTP সেটিংস', icon: Settings },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col antialiased selection:bg-emerald-500 selection:text-white">
      {/* Top Fixed Command Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-6 lg:px-8 py-3.5 shadow-xl">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Mobile Toggle & Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shadow-md shadow-emerald-500/10 shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.websiteName}
                    className="w-full h-full object-contain p-1"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-black text-sm sm:text-base text-white tracking-tight">
                    {settings.websiteName || 'Nasir Digital Hub'}
                  </h1>
                  <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Admin Live
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 hidden sm:block">
                  সুপার অ্যাডমিন কন্ট্রোল ও অটোমেশন প্যানেল
                </p>
              </div>
            </div>
          </div>

          {/* Right Action Bar */}
          <div className="flex items-center gap-2.5">
            {/* Pending Orders Action Jump */}
            {pendingOrdersCount > 0 && (
              <button
                type="button"
                onClick={() => {
                  setActiveTab('orders');
                  setSidebarOpen(false);
                }}
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-black hover:bg-amber-500/30 transition-all cursor-pointer animate-pulse"
              >
                <BellRing className="w-3.5 h-3.5 text-amber-400" />
                <span>{pendingOrdersCount} টি অর্ডার অপেক্ষমাণ</span>
              </button>
            )}

            {/* Quick Add Product */}
            <button
              type="button"
              onClick={() => {
                setActiveTab('products');
                setSidebarOpen(false);
              }}
              className="hidden md:flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold transition-all cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>নতুন পণ্য</span>
            </button>

            {/* Live Store View Button */}
            <button
              type="button"
              onClick={onBackToStore}
              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black flex items-center gap-1.5 shadow-lg shadow-emerald-600/25 transition-all cursor-pointer active:scale-95"
            >
              <Store className="w-3.5 h-3.5" />
              <span>লাইভ স্টোর</span>
            </button>

            {/* User Profile / Logout */}
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div className="hidden xl:block text-right">
                <span className="block text-xs font-bold text-slate-200">
                  {user.displayName || 'Admin'}
                </span>
                <span className="block text-[10px] text-slate-400 truncate max-w-[150px]">
                  {user.email}
                </span>
              </div>

              <button
                type="button"
                onClick={logout}
                className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                title="লগআউট করুন"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Body: Sidebar + Active Tab Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col lg:flex-row gap-6">
        {/* Desktop Sidebar / Mobile Drawer */}
        <aside
          className={`lg:w-64 shrink-0 transition-all duration-200 ${
            sidebarOpen
              ? 'fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md p-6 overflow-y-auto block'
              : 'hidden lg:block'
          }`}
        >
          {sidebarOpen && (
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 lg:hidden">
              <h3 className="font-black text-white text-base">অ্যাডমিন নেভিগেশন</h3>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 rounded-full bg-slate-800 text-slate-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          )}

          <div className="space-y-6 sticky top-24">
            {navItems.map((group, gIdx) => (
              <div key={gIdx} className="space-y-1.5">
                <p className="px-3 text-[10px] font-black uppercase tracking-wider text-slate-300">
                  {group.group}
                </p>
                <div className="space-y-1">
                  {group.items.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => {
                          setActiveTab(tab.id);
                          setSidebarOpen(false);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                          isActive
                            ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-600/25 border border-emerald-400/40'
                            : 'text-slate-300 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          <span>{tab.label}</span>
                        </div>

                        {tab.badge !== undefined && (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                              tab.badgeColor ||
                              (isActive ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300')
                            }`}
                          >
                            {tab.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Quick System Badge */}
            <div className="p-4 rounded-3xl bg-slate-900/80 border border-slate-800/80 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>ফায়ারবেস ক্লাউড সক্রিয়</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                সকল অর্ডার, ডাটা ও ইউজার অ্যাক্টিভিটি ক্লাউড ডাটাবেজে সংরক্ষিত হচ্ছে।
              </p>
            </div>
          </div>
        </aside>

        {/* Dynamic Main Workspace Tab */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && <AdminDashboard onNavigateTab={setActiveTab} />}
          {activeTab === 'orders' && <OrdersManager />}
          {activeTab === 'analytics' && <AnalyticsDashboard />}
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'categories' && <CategoryManager />}
          {activeTab === 'hero' && <HeroSettingsManager />}
          {activeTab === 'campaigns' && <CampaignsManager />}
          {activeTab === 'benefits' && <BenefitsManager />}
          {activeTab === 'paybd' && <PaybdManager />}
          {activeTab === 'seo' && <SeoHealthDashboard />}
          {activeTab === 'settings' && <StoreSettingsManager />}
        </main>
      </div>
    </div>
  );
};
