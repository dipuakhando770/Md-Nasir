import React, { useState } from 'react';
import {
  CreditCard,
  Key,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  Eye,
  EyeOff,
  Activity,
  Globe,
  Send,
  Zap,
  HelpCircle,
  FileCode2,
  Terminal,
  Smartphone,
  Layers,
  Sparkles,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { updateStoreSettings } from '../firebase/services';

export const PaybdManager: React.FC = () => {
  const { settings } = useStore();

  const [enabled, setEnabled] = useState(settings.paybd?.enabled !== false);
  const [brandKey, setBrandKey] = useState(
    settings.paybd?.brandKey || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ'
  );
  const [deviceKey, setDeviceKey] = useState(
    settings.paybd?.secretKey || 'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg'
  );
  const [apiKey, setApiKey] = useState(
    settings.paybd?.apiKey || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ'
  );
  const [gatewayUrl, setGatewayUrl] = useState(
    settings.paybd?.gatewayUrl || 'https://app-paybd.pipilikhost.com/api/payment/create'
  );

  const [showBrandKey, setShowBrandKey] = useState(false);
  const [showDeviceKey, setShowDeviceKey] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Diagnostic Ping State
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    status: number;
    latencyMs: number;
    message: string;
    paymentUrl?: string;
    raw?: any;
  } | null>(null);

  // Active Tab in Guide section
  const [guideTab, setGuideTab] = useState<'overview' | 'whmcs' | 'webhook' | 'node'>('overview');

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ais-dev-fky3k73nobbkf3pnwtj7za-42550456606.asia-southeast1.run.app';
  const autoWebhookUrl = `${origin}/api/payment/callback?api=${encodeURIComponent(brandKey)}&invoice=ORDER_ID`;
  const autoJonotapayUrl = `${origin}/modules/gateways/callback/jonotapay.php?api=${encodeURIComponent(brandKey)}&invoice=ORDER_ID`;

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSaveSuccess(false);

    try {
      await updateStoreSettings({
        paybd: {
          enabled,
          brandKey: brandKey.trim(),
          secretKey: deviceKey.trim(),
          apiKey: apiKey.trim(),
          gatewayUrl: gatewayUrl.trim(),
        },
      });

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err) {
      console.error('Failed to save PayBD settings:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const startTime = performance.now();

    try {
      const res = await fetch('/api/payment/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 10,
          customerPhone: '01312701392',
          customerName: 'Admin Connection Diagnostic',
          customerEmail: 'admin@store.com',
          orderId: `DIAG-${Date.now().toString().slice(-4)}`,
          brandKey: brandKey.trim(),
          secretKey: deviceKey.trim(),
          apiKey: apiKey.trim(),
          gatewayUrl: gatewayUrl.trim(),
        }),
      });

      const endTime = performance.now();
      const latency = Math.round(endTime - startTime);
      const data = await res.json().catch(() => null);

      if (res.ok && data && data.success) {
        setTestResult({
          success: true,
          status: res.status,
          latencyMs: latency,
          message: 'PayBD গেটওয়ে সফলভাবে সংযোগ স্থাপন করেছে এবং লাইভ পেমেন্ট লিংক তৈরি হয়েছে!',
          paymentUrl: data.paymentUrl,
          raw: data.raw,
        });
      } else {
        setTestResult({
          success: false,
          status: res.status,
          latencyMs: latency,
          message: (data && data.message) || 'গেটওয়ে থেকে কোনো এরর রেসপন্স এসেছে।',
          raw: data,
        });
      }
    } catch (err: any) {
      const endTime = performance.now();
      setTestResult({
        success: false,
        status: 500,
        latencyMs: Math.round(endTime - startTime),
        message: err?.message || 'সার্ভার সংযোগে ত্রুটি ঘটেছে।',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/95 border border-slate-800/90 shadow-2xl backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-600/25 shrink-0">
            <CreditCard className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-black text-white">PayBD / JonotaPay পেমেন্ট গেটওয়ে কন্ট্রোল প্যানেল</h2>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                  enabled
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    enabled ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                {enabled ? 'সিস্টেম সক্রিয় (Active)' : 'সিস্টেম নিষ্ক্রিয় (Disabled)'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              স্বয়ংক্রিয় bKash, Nagad, Rocket, Upay ও কার্ড পেমেন্ট ব্যবস্থাপনা, লাইভ ডায়াগনস্টিক ও ওয়েব হুক কনফিগারেশন
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting}
            className="px-4 py-2.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {isTesting ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Activity className="w-3.5 h-3.5 text-indigo-400" />
            )}
            <span>{isTesting ? 'টেস্টিং চলছে...' : 'Live Connection টেস্ট করুন'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Settings & Diagnostics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Form & Key Configuration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <form
            onSubmit={handleSaveSettings}
            className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-5"
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  API ক্রিডেনশিয়াল ও কী (Keys)
                </h3>
              </div>

              {/* Master Toggle Switch */}
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                <span className="ml-2.5 text-xs font-bold text-slate-300">
                  {enabled ? 'অনলাইন পেমেন্ট চালু' : 'পেমেন্ট বন্ধ'}
                </span>
              </label>
            </div>

            {/* Notice Box */}
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 space-y-1">
              <div className="flex items-center gap-2 font-bold text-white">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>PipilikHost PayBD আর্কিটেকচার</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                পেমেন্ট রিকোয়েস্ট তৈরি করতে <strong>Brand Key</strong> ব্যবহার করা হয় এবং ডিভাইস সংযোগের জন্য <strong>Device Key</strong> সংরক্ষিত থাকে।
              </p>
            </div>

            {/* 1. Brand Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>BRAND-KEY * (প্রধান ব্র্যান্ড কি)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowBrandKey(!showBrandKey)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showBrandKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showBrandKey ? 'লুকান' : 'দেখুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(brandKey, 'brandKey')}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'brandKey' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'brandKey' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>
              <input
                type={showBrandKey ? 'text' : 'password'}
                required
                value={brandKey}
                onChange={(e) => setBrandKey(e.target.value)}
                placeholder="আপনার Brand Key দিন"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 2. Device Key / Secret Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>DEVICE-KEY / SECRET-KEY (ডিভাইস অটোমেশন কি)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowDeviceKey(!showDeviceKey)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showDeviceKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showDeviceKey ? 'লুকান' : 'দেখুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(deviceKey, 'deviceKey')}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'deviceKey' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'deviceKey' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>
              <input
                type={showDeviceKey ? 'text' : 'password'}
                value={deviceKey}
                onChange={(e) => setDeviceKey(e.target.value)}
                placeholder="আপনার Device Key দিন"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 3. API Key / Master Key */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <span>API-KEY / Master Key (ঐচ্ছিক/ব্যাকআপ)</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {showApiKey ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{showApiKey ? 'লুকান' : 'দেখুন'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(apiKey, 'apiKey')}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    {copiedField === 'apiKey' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'apiKey' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
              </div>
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="API Key"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* 4. Gateway Endpoint URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-300">
                পেমেন্ট গেটওয়ে ক্রিয়েট API URL
              </label>
              <input
                type="url"
                required
                value={gatewayUrl}
                onChange={(e) => setGatewayUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Save & Reset Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
              {saveSuccess ? (
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold animate-fade-in">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>পেমেন্ট গেটওয়ে সেটিংস সফলভাবে সংরক্ষিত হয়েছে!</span>
                </div>
              ) : (
                <span className="text-[11px] text-slate-400">
                  পরিবর্তন করার পর অবশ্যই সংরক্ষণ করুন
                </span>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সেটিংস সংরক্ষণ করুন'}</span>
              </button>
            </div>
          </form>

          {/* Supported Methods Showcase */}
          <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-400" />
              <span>সাপোর্টেড পেমেন্ট মেথড ও চ্যানেলসমূহ</span>
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-[#d81467]">bKash (বিকাশ)</span>
                <span className="text-[10px] text-emerald-400 mt-0.5">অটোমেশন সক্রিয়</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-[#d87b0a]">Nagad (নগদ)</span>
                <span className="text-[10px] text-emerald-400 mt-0.5">অটোমেশন সক্রিয়</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-[#8C3494]">Rocket (রকেট)</span>
                <span className="text-[10px] text-slate-400 mt-0.5">সাপোর্টেড</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center">
                <span className="text-xs font-black text-sky-400">Cards & Upay</span>
                <span className="text-[10px] text-slate-400 mt-0.5">সাপোর্টেড</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Diagnostic Ping & Webhook URL (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Ping & Diagnostic Monitor */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-indigo-400" />
                <h3 className="text-sm font-bold text-white">লাইভ কানেকশন ডায়াগনস্টিক</h3>
              </div>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={isTesting}
                className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                {isTesting ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Zap className="w-3.5 h-3.5" />
                )}
                <span>{isTesting ? 'টেস্টিং...' : 'পিং টেস্ট'}</span>
              </button>
            </div>

            {testResult ? (
              <div
                className={`p-4 rounded-2xl border space-y-3 transition-all ${
                  testResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-rose-500/10 border-rose-500/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {testResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <span
                      className={`text-xs font-extrabold ${
                        testResult.success ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {testResult.success ? 'সফল (Status 200 OK)' : `ত্রুটি (Status ${testResult.status})`}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                    {testResult.latencyMs} ms
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{testResult.message}</p>

                {testResult.paymentUrl && (
                  <div className="pt-2 border-t border-slate-800/80 space-y-2">
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                      <span>জেনারেটেড টেস্ট পেমেন্ট লিংক:</span>
                    </div>
                    <a
                      href={testResult.paymentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
                    >
                      <span>পেমেন্ট উইন্ডো টেস্ট করুন (Open in New Tab)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 text-center space-y-2">
                <Smartphone className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-300">
                  গেটওয়ে সংযোগ পরীক্ষা করতে "পিং টেস্ট" বাটনে চাপুন
                </p>
                <p className="text-[11px] text-slate-500">
                  এটি সরাসরি PayBD গেটওয়েতে টেস্ট অর্ডার রিকোয়েস্ট পাঠিয়ে রেসপন্স যাচাই করবে
                </p>
              </div>
            )}
          </div>

          {/* Webhook & Callback URLs */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <Globe className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">ওয়েবহুক ও কলব্যাক URL</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    স্ট্যান্ডার্ড Webhook / IPN URL:
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(autoWebhookUrl, 'webhook')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'webhook' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'webhook' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  {autoWebhookUrl}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-300">
                    WHMCS Callback URL:
                  </label>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(autoJonotapayUrl, 'jonotapay')}
                    className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 cursor-pointer"
                  >
                    {copiedField === 'jonotapay' ? (
                      <Check className="w-3 h-3" />
                    ) : (
                      <Copy className="w-3 h-3" />
                    )}
                    <span>{copiedField === 'jonotapay' ? 'কপি হয়েছে' : 'কপি'}</span>
                  </button>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-slate-300 break-all select-all">
                  {autoJonotapayUrl}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Integration Guide Tabs */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">ইন্টিগ্রেশন গাইডলাইন ও ডকুমেন্টেশন</h3>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setGuideTab('overview')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'overview'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ওভারভিউ
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('whmcs')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'whmcs'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WHMCS প্লাগইন
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('webhook')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'webhook'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              কলব্যাক ও IPN
            </button>
            <button
              type="button"
              onClick={() => setGuideTab('node')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                guideTab === 'node'
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              API কোড
            </button>
          </div>
        </div>

        {guideTab === 'overview' && (
          <div className="space-y-3 text-xs text-slate-300 leading-relaxed">
            <p>
              PayBD (PipilikHost) পেমেন্ট গেটওয়ে পার্সোনাল বিকাশ, নগদ এবং রকেট অ্যাকাউন্ট অটোমেশনের মাধ্যমে গ্রাহকের কাছ থেকে স্বয়ংক্রিয়ভাবে পেমেন্ট সংগ্রহ করে।
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[10px]">১</span>
                  চেকআউট ও রিডাইরেক্ট
                </span>
                <p className="text-[11px] text-slate-400">
                  গ্রাহক চেকআউটে তথ্য পূরণ করলে নতুন ট্যাবে PayBD নিরাপদ গেটওয়েতে রিডাইরেক্ট হয়।
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-[10px]">২</span>
                  পেমেন্ট সম্পন্নকরণ
                </span>
                <p className="text-[11px] text-slate-400">
                  গ্রাহক বিকাশ বা নগদে সেন্ড মানি করে TrxID দিয়ে পেমেন্ট কনফার্ম করে।
                </p>
              </div>
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <span className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center text-[10px]">৩</span>
                  ইনস্ট্যান্ট ভেরিফিকেশন
                </span>
                <p className="text-[11px] text-slate-400">
                  কলব্যাক ও ভেরিফাই API স্বয়ংক্রিয়ভাবে অর্ডার স্ট্যাটাস COMPLETED মার্ক করে।
                </p>
              </div>
            </div>
          </div>
        )}

        {guideTab === 'whmcs' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p>
              আপনার প্রদত্ত WHMCS মডিউল ফরম্যাট সম্পূর্ণ সাপোর্ট করে। WHMCS গেটওয়ে ফাইল সরাসরি কলব্যাকে সংযুক্ত রয়েছে:
            </p>
            <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-indigo-300 overflow-x-auto">
{`// WHMCS Callback Target:
${autoJonotapayUrl}

// Parameter Format:
invoice={INVOICE_ID}&transactionId={TRANSACTION_ID}&paymentAmount={AMOUNT}&paymentFee={FEE}&status=COMPLETED`}
            </pre>
          </div>
        )}

        {guideTab === 'webhook' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p>
              পেমেন্ট সফল বা ব্যর্থ হওয়ার পর গেটওয়ে স্বয়ংক্রিয়ভাবে নিচের কলব্যাক হ্যান্ডলারে রিডাইরেক্ট এবং সার্ভার টু সার্ভার ভেরিফিকেশন সম্পন্ন করে:
            </p>
            <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-emerald-300 overflow-x-auto">
{`POST /api/payment/callback
{
  "transaction_id": "ABCDEF12345",
  "invoice": "ORD-123456",
  "amount": "10",
  "status": "COMPLETED"
}`}
            </pre>
          </div>
        )}

        {guideTab === 'node' && (
          <div className="space-y-3 text-xs text-slate-300">
            <p>আমাদের অ্যাপের ব্যাকএন্ডে চলা স্বয়ংক্রিয় Node.js API রিকোয়েস্ট ফরম্যাট:</p>
            <pre className="p-3 rounded-2xl bg-slate-950 border border-slate-800 font-mono text-[11px] text-amber-300 overflow-x-auto">
{`fetch('https://app-paybd.pipilikhost.com/api/payment/create', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'API-KEY': '${brandKey}',
    'BRAND-KEY': '${brandKey}',
    'DEVICE-KEY': '${deviceKey}',
    'SECRET-KEY': '${deviceKey}'
  },
  body: JSON.stringify({
    cus_name: "Customer Name",
    cus_email: "customer@gmail.com",
    amount: "10",
    webhook_url: "${autoWebhookUrl}",
    success_url: "${origin}/?payment=success",
    cancel_url: "${origin}/?payment=cancel"
  })
});`}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};
