import React, { useState, useEffect, useRef } from 'react';
import {
  Activity,
  Eye,
  ShoppingCart,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  RefreshCw,
  TrendingUp,
  Filter,
  Search,
  ArrowUpRight,
  MessageCircle,
  Download,
  Smartphone,
  Monitor,
  Copy,
  Check,
  Volume2,
  VolumeX,
  FileSpreadsheet,
  Zap,
  PhoneCall,
  User,
  DollarSign,
  AlertTriangle,
} from 'lucide-react';
import { ActivityLog, ActivityType } from '../types';
import { subscribeToActivityLogs, clearOldActivityLogs } from '../firebase/services';
import { formatPrice, sanitizeWhatsAppNumber } from '../utils/formatters';
import { useStore } from '../context/StoreContext';

export const AnalyticsDashboard: React.FC = () => {
  const { settings } = useStore();
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isClearing, setIsClearing] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const prevLogsCountRef = useRef<number>(0);

  useEffect(() => {
    const unsub = subscribeToActivityLogs(
      (newLogs) => {
        // If new log arrives and sound is enabled, play a subtle chime
        if (
          soundEnabled &&
          prevLogsCountRef.current > 0 &&
          newLogs.length > prevLogsCountRef.current
        ) {
          try {
            const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
            osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
            gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.25);
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.start();
            osc.stop(audioCtx.currentTime + 0.25);
          } catch {
            // Ignore audio context autoplay restriction
          }
        }
        prevLogsCountRef.current = newLogs.length;
        setLogs(newLogs);
        setLoading(false);
      },
      (err) => {
        console.error('Activity logs error:', err);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [soundEnabled]);

  // Filtered logs
  const filteredLogs = logs.filter((log) => {
    // Type filter
    if (filterType === 'page' && log.type !== 'page_view' && log.type !== 'product_view') return false;
    if (filterType === 'cart' && log.type !== 'add_to_cart' && log.type !== 'remove_from_cart') return false;
    if (filterType === 'order' && log.type !== 'order_placed' && log.type !== 'order_cancelled' && log.type !== 'checkout_start') return false;
    if (filterType === 'whatsapp' && log.type !== 'whatsapp_click') return false;

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchTitle = log.title?.toLowerCase().includes(q);
      const matchCustomer = log.customerName?.toLowerCase().includes(q) || log.customerPhone?.includes(q);
      const matchProduct = log.productTitle?.toLowerCase().includes(q);
      const matchPath = log.path?.toLowerCase().includes(q);
      const matchOrderId = log.orderId?.toLowerCase().includes(q);
      return matchTitle || matchCustomer || matchProduct || matchPath || matchOrderId;
    }
    return true;
  });

  // Calculate stats
  const totalPageViews = logs.filter((l) => l.type === 'page_view' || l.type === 'product_view').length;
  const totalCartAdds = logs.filter((l) => l.type === 'add_to_cart').length;
  const totalCartRemoves = logs.filter((l) => l.type === 'remove_from_cart').length;
  const totalOrdersPlaced = logs.filter((l) => l.type === 'order_placed').length;
  const totalOrdersCancelled = logs.filter((l) => l.type === 'order_cancelled').length;
  const totalWhatsAppClicks = logs.filter((l) => l.type === 'whatsapp_click').length;

  const totalOrderValue = logs
    .filter((l) => l.type === 'order_placed' && typeof l.amount === 'number')
    .reduce((sum, l) => sum + (l.amount || 0), 0);

  const cartConversionRate =
    totalCartAdds > 0 ? Math.round((totalOrdersPlaced / totalCartAdds) * 100) : 0;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearLogs = async () => {
    if (window.confirm('আপনি কি পূর্ববর্তী অ্যাক্টিভিটি হিস্ট্রি ডাটাবেজ থেকে মুছে ফেলতে চান?')) {
      setIsClearing(true);
      try {
        await clearOldActivityLogs();
        setLogs([]);
      } catch (err) {
        console.error('Clear logs error:', err);
      } finally {
        setIsClearing(false);
      }
    }
  };

  const handleExportCSV = () => {
    if (logs.length === 0) return;
    const headers = ['Type', 'Title', 'Customer Name', 'Phone', 'Amount (BDT)', 'Order ID', 'Path', 'Device', 'Time'];
    const rows = logs.map((l) => [
      l.type,
      `"${(l.title || '').replace(/"/g, '""')}"`,
      `"${(l.customerName || '').replace(/"/g, '""')}"`,
      `"${(l.customerPhone || '').replace(/"/g, '""')}"`,
      l.amount || 0,
      l.orderId || '',
      `"${(l.path || '').replace(/"/g, '""')}"`,
      l.device || 'Web',
      new Date(l.timestamp).toLocaleString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `activity_logs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getActivityBadge = (type: ActivityType) => {
    switch (type) {
      case 'order_placed':
        return {
          label: 'নতুন অর্ডার',
          bg: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
        };
      case 'order_cancelled':
        return {
          label: 'অর্ডার বাতিল',
          bg: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
          icon: <XCircle className="w-3.5 h-3.5 text-rose-400" />,
        };
      case 'add_to_cart':
        return {
          label: 'কার্টে যোগ',
          bg: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
          icon: <ShoppingCart className="w-3.5 h-3.5 text-amber-400" />,
        };
      case 'remove_from_cart':
        return {
          label: 'কার্ট রিমুভ',
          bg: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
          icon: <Trash2 className="w-3.5 h-3.5 text-orange-400" />,
        };
      case 'checkout_start':
        return {
          label: 'চেকআউট শুরু',
          bg: 'bg-indigo-500/15 text-indigo-400 border-indigo-500/30',
          icon: <ArrowUpRight className="w-3.5 h-3.5 text-indigo-400" />,
        };
      case 'product_view':
        return {
          label: 'পণ্য ভিউ',
          bg: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
          icon: <Eye className="w-3.5 h-3.5 text-blue-400" />,
        };
      case 'whatsapp_click':
        return {
          label: 'হোয়াটসঅ্যাপ',
          bg: 'bg-teal-500/15 text-teal-400 border-teal-500/30',
          icon: <MessageCircle className="w-3.5 h-3.5 text-teal-400" />,
        };
      case 'direct_download':
        return {
          label: 'ফ্রি ডাউনলোড',
          bg: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
          icon: <Download className="w-3.5 h-3.5 text-purple-400" />,
        };
      default:
        return {
          label: 'পেজ ভিজিট',
          bg: 'bg-slate-800 text-slate-300 border-slate-700',
          icon: <Activity className="w-3.5 h-3.5 text-slate-400" />,
        };
    }
  };

  const formatTimestamp = (ts: number) => {
    const d = new Date(ts);
    return d.toLocaleString('bn-BD', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getWhatsAppDirectUrl = (log: ActivityLog) => {
    const phone = log.customerPhone ? sanitizeWhatsAppNumber(log.customerPhone) : '';
    if (!phone) return null;
    const name = log.customerName || 'সম্মানিত কাস্টমার';
    const text = encodeURIComponent(
      `👋 আসসালামু আলাইকুম ${name}!\n` +
      `আমরা ${settings.websiteName || 'Nasir Digital Hub'} থেকে যোগাযোগ করছি।\n` +
      (log.orderId ? `আপনার অর্ডার #${log.orderId} সম্পর্কিত কোনো সহায়তার প্রয়োজন আছে কি?\n` : '') +
      (log.productTitle ? `আপনি "${log.productTitle}" পণ্যটি দেখেছিলেন। এ বিষয়ে কোনো তথ্য জানতে চান?\n` : '') +
      `আমরা আপনাকে সম্পূর্ণ সহযোগিতা করতে প্রস্তুত!`
    );
    return `https://wa.me/${phone}?text=${text}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-emerald-400 tracking-wider uppercase flex items-center gap-1.5">
              <span>রিয়েল-টাইম লাইভ ট্র্যাকিং সক্রিয়</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px]">
                {logs.length} ইভেন্ট রেকর্ড
              </span>
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            অ্যানালিটিক্স ও লাইভ ট্র্যাকিং সেন্টার
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            ভিজিটর ব্রাউজিং, কার্টে পণ্য যোগ, অর্ডার ইনিশিয়েশন এবং পেমেন্ট ট্র্যাকিংয়ের লাইভ মনিটর।
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap self-stretch md:self-auto">
          {/* Sound Alert Toggle */}
          <button
            type="button"
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
              soundEnabled
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="নতুন ইভেন্টে সাউন্ড অ্যালার্ট"
          >
            {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>{soundEnabled ? 'সাউন্ড অন' : 'মিউট'}</span>
          </button>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={logs.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600/15 hover:bg-indigo-600/25 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>এক্সপোর্ট CSV</span>
          </button>

          {/* Clear Logs */}
          <button
            type="button"
            onClick={handleClearLogs}
            disabled={isClearing || logs.length === 0}
            className="flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all disabled:opacity-40 cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>লগ ক্লিয়ার</span>
          </button>
        </div>
      </div>

      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Page Views */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-blue-400 mb-2">
            <span className="text-xs font-bold text-slate-400">মোট পেজ ভিউ</span>
            <Eye className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-white">{totalPageViews}</div>
          <div className="text-[10px] text-slate-500 mt-1">লাইভ ভিজিটর ট্র্যাকিং</div>
        </div>

        {/* Card 2: Cart Adds */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-amber-400 mb-2">
            <span className="text-xs font-bold text-slate-400">কার্টে যোগ</span>
            <ShoppingCart className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-amber-400">{totalCartAdds}</div>
          <div className="text-[10px] text-amber-400/80 mt-1">পণ্য ব্যাগে রাখা হয়েছে</div>
        </div>

        {/* Card 3: Orders Placed */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-emerald-400 mb-2">
            <span className="text-xs font-bold text-slate-400">অর্ডার সম্পন্ন</span>
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-emerald-400">{totalOrdersPlaced}</div>
          <div className="text-[10px] text-emerald-400/80 mt-1">প্লেস হওয়া অর্ডার</div>
        </div>

        {/* Card 4: Total Value */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-indigo-400 mb-2">
            <span className="text-xs font-bold text-slate-400">অর্ডার ভ্যালু</span>
            <DollarSign className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-indigo-300">৳{totalOrderValue}</div>
          <div className="text-[10px] text-indigo-400/80 mt-1">মোট আনুমানিক বিক্রি</div>
        </div>

        {/* Card 5: Conversion */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-purple-400 mb-2">
            <span className="text-xs font-bold text-slate-400">কার্ট কনভার্শন</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-purple-300">{cartConversionRate}%</div>
          <div className="text-[10px] text-purple-400/80 mt-1">কার্ট থেকে অর্ডার হার</div>
        </div>

        {/* Card 6: WhatsApp */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-4 shadow-md">
          <div className="flex items-center justify-between text-teal-400 mb-2">
            <span className="text-xs font-bold text-slate-400">হোয়াটসঅ্যাপ চ্যাট</span>
            <MessageCircle className="w-4 h-4" />
          </div>
          <div className="text-2xl font-black text-teal-400">{totalWhatsAppClicks}</div>
          <div className="text-[10px] text-teal-400/80 mt-1">সরাসরি ইনকোয়ারি</div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'সব অ্যাক্টিভিটি' },
            { id: 'order', label: '🛍️ অর্ডার ও চেকআউট' },
            { id: 'cart', label: '🛒 কার্ট ইভেন্ট' },
            { id: 'page', label: '👁️ পেজ ও পণ্য ভিউ' },
            { id: 'whatsapp', label: '💬 হোয়াটসঅ্যাপ' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                filterType === tab.id
                  ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 text-white shadow-md'
                  : 'bg-slate-800/90 hover:bg-slate-800 text-slate-300 border border-slate-700/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="কাস্টমার নাম, ফোন, অর্ডার ID বা পণ্য সার্চ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>
      </div>

      {/* Live Activity Table Feed */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm sm:text-base font-bold text-white">
              লাইভ অ্যাক্টিভিটি স্ট্রিম ({filteredLogs.length})
            </h3>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            লাইভ অটো-আপডেট হচ্ছে • কোন রিলোড প্রয়োজন নেই
          </span>
        </div>

        {filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-500 text-xs">
            {search ? 'সার্চের সাথে কোনো অ্যাক্টিভিটি রেকর্ড মেলেনি।' : 'এখনো কোনো অ্যাক্টিভিটি লগ পাওয়া যায়নি।'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/90 text-slate-400 font-bold border-b border-slate-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">ইভেন্ট টাইপ</th>
                  <th className="py-3 px-4">অ্যাক্টিভিটি বিবরণ</th>
                  <th className="py-3 px-4">কাস্টমার / কন্টাক্ট</th>
                  <th className="py-3 px-4">ডিভাইস</th>
                  <th className="py-3 px-4 text-right">সময়</th>
                  <th className="py-3 px-4 text-center">কুইক একশন</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-medium">
                {filteredLogs.map((log) => {
                  const badge = getActivityBadge(log.type);
                  const waUrl = getWhatsAppDirectUrl(log);

                  return (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors group">
                      {/* Type Badge */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border shadow-xs ${badge.bg}`}
                        >
                          {badge.icon}
                          <span>{badge.label}</span>
                        </span>
                      </td>

                      {/* Title & Product Info */}
                      <td className="py-3.5 px-4">
                        <div className="text-white font-semibold flex items-center gap-1.5">
                          <span>{log.title}</span>
                          {log.orderId && (
                            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-emerald-400 border border-slate-700">
                              #{log.orderId}
                            </span>
                          )}
                        </div>
                        {log.path && (
                          <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                            {log.path}
                          </div>
                        )}
                        {log.amount && log.amount > 0 && (
                          <div className="text-[11px] text-emerald-400 font-bold mt-0.5 flex items-center gap-1">
                            <span>মূল্য:</span>
                            <span className="font-extrabold">{formatPrice(log.amount)}</span>
                          </div>
                        )}
                      </td>

                      {/* Customer / Context Info */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        {log.customerName || log.customerPhone ? (
                          <div>
                            <div className="text-white font-semibold flex items-center gap-1">
                              <User className="w-3 h-3 text-indigo-400" />
                              <span>{log.customerName || 'কাস্টমার'}</span>
                            </div>
                            {log.customerPhone && (
                              <div className="text-[11px] text-slate-400 font-mono flex items-center gap-1 mt-0.5">
                                <PhoneCall className="w-2.5 h-2.5 text-slate-500" />
                                <span>{log.customerPhone}</span>
                              </div>
                            )}
                          </div>
                        ) : log.productTitle ? (
                          <div className="text-slate-300 font-medium truncate max-w-xs">
                            {log.productTitle}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-[11px]">সাধারণ ভিজিটর</span>
                        )}
                      </td>

                      {/* Device */}
                      <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 text-[11px]">
                        <span className="inline-flex items-center gap-1">
                          {log.device?.toLowerCase().includes('mobile') || log.device?.toLowerCase().includes('android') || log.device?.toLowerCase().includes('iphone') ? (
                            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Monitor className="w-3.5 h-3.5 text-blue-400" />
                          )}
                          <span>{log.device || 'ওয়েব ব্রাউজার'}</span>
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap text-slate-400 text-[11px] font-mono">
                        {formatTimestamp(log.timestamp)}
                      </td>

                      {/* Quick Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* WhatsApp Direct Chat */}
                          {waUrl && (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/30 transition-colors"
                              title="কাস্টমারকে হোয়াটসঅ্যাপে মেসেজ দিন"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Copy Phone / Info */}
                          {log.customerPhone && (
                            <button
                              type="button"
                              onClick={() => handleCopy(log.customerPhone!, `phone_${log.id}`)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors cursor-pointer"
                              title="নম্বর কপি করুন"
                            >
                              {copiedId === `phone_${log.id}` ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
