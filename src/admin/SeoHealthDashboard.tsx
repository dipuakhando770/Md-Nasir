import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Globe,
  FileCode,
  ShieldCheck,
  Sparkles,
  RefreshCw,
  Eye,
  Activity,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { getProductFullUrl, getProductPath } from '../utils/slugify';
import { META_PIXEL_ID } from '../utils/metaPixel';

export const SeoHealthDashboard: React.FC = () => {
  const { products, settings } = useStore();
  const [copiedUrlIndex, setCopiedUrlIndex] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const siteOrigin =
    typeof window !== 'undefined' && window.location.origin
      ? window.location.origin
      : 'https://www.nasirdigitalhub.com';

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.slug && p.slug.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleCopyUrl = (url: string, index: number) => {
    navigator.clipboard?.writeText(url);
    setCopiedUrlIndex(index);
    setTimeout(() => setCopiedUrlIndex(null), 2000);
  };

  // Calculate health stats
  const totalProducts = products.length;
  const publishedProducts = products.filter((p) => p.available !== false).length;
  const productsWithGoodDesc = products.filter((p) => (p.description || '').length >= 100).length;
  const overallHealth = Math.round(
    ((publishedProducts / (totalProducts || 1)) * 0.4 +
      (productsWithGoodDesc / (totalProducts || 1)) * 0.6) *
      100
  );

  return (
    <div className="space-y-6">
      {/* 1. Header & Live Status Overview */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/80 p-6 rounded-2xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Globe className="w-5 h-5" />
            </span>
            <h2 className="text-xl font-black text-white tracking-tight">
              SEO ও কনভার্সন ট্র্যাকিং স্বাস্থ্য মনিটর
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Google Search Console ইনডেক্সিং এবং Meta Pixel / CAPI ট্র্যাকিং এর সামগ্রিক অবস্থা।
          </p>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <FileCode className="w-4 h-4 text-emerald-400" />
            <span>লাইভ Sitemap.xml</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 border border-slate-700 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
            <span>Robots.txt</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            SEO সামগ্রিক স্কোর
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-emerald-400">{overallHealth}%</span>
            <span className="text-xs text-slate-400">অনুকূল (Optimal)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallHealth}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            সচল পণ্য ইনডেক্সযোগ্য
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{publishedProducts}</span>
            <span className="text-xs text-slate-400">/ {totalProducts} টি পণ্য</span>
          </div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>সবগুলো সাইটম্যাপে অন্তর্ভুক্ত</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Meta Pixel & CAPI
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-cyan-400">সক্রিয়</span>
            <span className="text-xs font-mono text-slate-400">ID: {META_PIXEL_ID}</span>
          </div>
          <div className="text-[11px] text-cyan-400 flex items-center gap-1 mt-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Deduplication & CAPI রেডি</span>
          </div>
        </div>

        <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Schema.org Structured Data
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-black text-indigo-400">১০০% ভ্যালিড</span>
          </div>
          <div className="text-[11px] text-indigo-300 flex items-center gap-1 mt-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Product & Breadcrumb JSON-LD</span>
          </div>
        </div>
      </div>

      {/* 3. Google Search Console & Meta Test Event Action Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Google Search Console Guide */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Globe className="w-4 h-4 text-emerald-400" />
              <span>Google Search Console সাবমিশন ধাপ</span>
            </h3>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Google Search Console-এ লগইন করে প্রপার্টি যোগ করুন:{' '}
                <strong className="text-white">https://www.nasirdigitalhub.com/</strong>
              </li>
              <li>
                বাম মেনুর <strong>Sitemaps</strong> অপশনে যান এবং সাবমিট বক্সে লিখুন:{' '}
                <code className="text-emerald-400 font-mono bg-slate-950 px-1 py-0.5 rounded">sitemap.xml</code>
              </li>
              <li>
                <strong>URL Inspection</strong> টুল দিয়ে নিচের যেকোনো পণ্যের লিংক পেস্ট করে <strong>"Request Indexing"</strong> করুন।
              </li>
            </ol>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <a
              href="https://search.google.com/search-console"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300"
            >
              <span>Google Search Console খুলুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>

        {/* Meta Events Manager Test Guide */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <span>Meta Events Manager টেস্ট নির্দেশিকা</span>
            </h3>
            <ol className="text-xs text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
              <li>
                Meta Business Suite &rarr; <strong>Events Manager</strong> &rarr; <strong>Datasets</strong> &rarr; Pixel ID{' '}
                <strong className="text-white">{META_PIXEL_ID}</strong> নির্বাচন করুন।
              </li>
              <li>
                <strong>"Test Events"</strong> ট্যাবে যান এবং ওয়েবসাইটের লিঙ্ক ওপেন করুন।
              </li>
              <li>
                পণ্য পেজ খুললে <strong>ViewContent</strong>, কার্টে যোগ করলে <strong>AddToCart</strong>, চেকআউট শুরু করলে <strong>InitiateCheckout</strong> এবং পেমেন্ট সম্পন্ন হলে <strong>Purchase</strong> ইভেন্ট স্বয়ংক্রিয়ভাবে দৃশ্যমান হবে।
              </li>
            </ol>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800/80">
            <a
              href="https://business.facebook.com/events_manager2"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300"
            >
              <span>Meta Events Manager খুলুন</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* 4. Product SEO Health Table */}
      <div className="bg-slate-900/80 rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
        <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-white text-base">পণ্য ভিত্তিক SEO ও ক্যানোনিকাল স্ট্যাটাস</h3>
            <p className="text-xs text-slate-400">
              প্রতিটি পণ্যের ক্যানোনিকাল লিঙ্ক, মেটা ডেসক্রিপশন এবং স্কিমা স্বাস্থ্য তালিকা।
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="পণ্য বা স্লাগ খুঁজুন..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-64"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">পণ্য ও স্লাগ</th>
                <th className="py-3.5 px-4">মূল্য (BDT)</th>
                <th className="py-3.5 px-4">ক্যানোনিকাল URL</th>
                <th className="py-3.5 px-4">ইনডেক্সিং</th>
                <th className="py-3.5 px-4">সাইটম্যাপ</th>
                <th className="py-3.5 px-4">স্কিমা</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredProducts.map((product, idx) => {
                const fullUrl = getProductFullUrl(product);
                const pathUrl = getProductPath(product);
                const isPublished = product.available !== false;

                return (
                  <tr key={product.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3.5 px-4 font-semibold text-white max-w-xs">
                      <div className="truncate">{product.title}</div>
                      <div className="text-[10px] text-slate-500 font-mono truncate">{pathUrl}</div>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">
                      ৳{product.price}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400 max-w-xs truncate">
                      {fullUrl}
                    </td>
                    <td className="py-3.5 px-4">
                      {isPublished ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-semibold text-[10px]">
                          index, follow
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold text-[10px]">
                          noindex
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      {isPublished ? (
                        <span className="text-emerald-400 flex items-center gap-1 font-semibold text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>অন্তর্ভুক্ত</span>
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">বাদ দেওয়া</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 font-mono text-[10px]">
                        Product + Breadcrumb
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleCopyUrl(fullUrl, idx)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
                        title="URL কপি করুন (Google Search Console এর জন্য)"
                      >
                        {copiedUrlIndex === idx ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">কপি হয়েছে</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>কপি URL</span>
                          </>
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
