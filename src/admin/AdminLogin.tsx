import React, { useState } from 'react';
import { Mail, Key, ShieldCheck, AlertCircle, Sparkles, ArrowRight, Lock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { ADMIN_UID } from '../firebase/config';

export const AdminLogin: React.FC = () => {
  const { user, isAdmin, loginWithEmail, loginWithGoogle, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getSafeErrorMessage = (err: any): string => {
    const code = err?.code || '';
    switch (code) {
      case 'auth/invalid-email':
        return 'অনুগ্রহ করে একটি সঠিক ইমেইল অ্যাড্রেস লিখুন।';
      case 'auth/user-disabled':
        return 'এই অ্যাকাউন্টটি নিষ্ক্রিয় করা হয়েছে।';
      case 'auth/user-not-found':
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'ইমেইল অথবা পাসওয়ার্ড সঠিক নয়।';
      case 'auth/too-many-requests':
        return 'অতিরিক্ত ব্যর্থ চেষ্টার কারণে সাময়িকভাবে বন্ধ আছে। কিছুক্ষণ পর আবার চেষ্টা করুন।';
      case 'auth/network-request-failed':
        return 'ইন্টারনেট সংযোগে সমস্যা দেখা দিয়েছে। সংযোগ চেক করে পুনরায় চেষ্টা করুন।';
      case 'auth/popup-closed-by-user':
        return 'লগইন উইন্ডো বন্ধ করা হয়েছে।';
      default:
        return err?.message || 'লগইন সম্পন্ন করা যায়নি। পুনরায় সঠিক তথ্য দিয়ে চেষ্টা করুন।';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setError('ইমেইল এবং পাসওয়ার্ড উভয়ই আবশ্যক।');
      return;
    }

    setLoading(true);
    try {
      await loginWithEmail(cleanEmail, password);
    } catch (err: any) {
      setError(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(getSafeErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  // If user is authenticated in Firebase but does not hold the authorized ADMIN_UID or email
  if (user && !isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border-2 border-rose-500/40 text-center space-y-4 shadow-2xl animate-fadeIn">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto shadow-lg shadow-rose-500/10">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-white">অননুমোদিত অ্যাকাউন্ট</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            আপনার লগইনকৃত ইমেইল: <strong className="text-white font-mono">{user.email || user.uid.slice(0, 10)}</strong><br />
            এই অ্যাকাউন্টটিতে অ্যাডমিন এক্সেস অনুমোদিত নেই। অনুমোদিত অ্যাডমিন গুগল অ্যাকাউন্টে লগইন করুন।
          </p>
          <div className="pt-3 space-y-2">
            <button
              onClick={logout}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg transition-all cursor-pointer"
            >
              লগআউট করে সঠিক অ্যাকাউন্টে সাইন ইন করুন
            </button>
            <button
              type="button"
              onClick={() => {
                window.location.hash = '';
                window.location.pathname = '/';
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              মূল স্টোরে ফিরে যান
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl relative overflow-hidden">
        {/* Top Glow Ambient */}
        <div className="absolute -top-20 -left-20 w-48 h-48 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-6 relative">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-indigo-600 flex items-center justify-center text-white mx-auto mb-3.5 shadow-xl shadow-emerald-500/20 border border-white/20">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white tracking-tight">অ্যাডমিন সিকিউর কন্ট্রোল</h2>
          <p className="text-xs text-slate-400 mt-1">
            Nasir Digital Hub — সুরক্ষিত ক্লাউড ড্যাশবোর্ড
          </p>
        </div>

        {error && (
          <div className="p-3.5 mb-5 rounded-2xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-fadeIn">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span className="font-semibold">{error}</span>
          </div>
        )}

        {/* 1-Click Google Login Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 text-xs font-black flex items-center justify-center gap-2.5 transition-all shadow-lg active:scale-98 cursor-pointer disabled:opacity-50 mb-5"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
            />
            <path
              fill="#34A853"
              d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
            />
            <path
              fill="#FBBC05"
              d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.17 0 9.97 0 12s.45 3.83 1.25 5.42l4.03-3.15Z"
            />
            <path
              fill="#EA4335"
              d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
            />
          </svg>
          <span>Google দিয়ে ১-ক্লিকে সাইন ইন করুন</span>
        </button>

        <div className="relative my-5 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-[11px] text-slate-500 font-bold uppercase tracking-wider">
            অথবা ইমেইল পাসওয়ার্ড
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-indigo-400" />
              অ্যাডমিন ইমেইল
            </label>
            <input
              type="email"
              required
              autoComplete="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-indigo-400" />
              পাসওয়ার্ড
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-4 py-2.5 text-xs text-white focus:outline-none placeholder:text-slate-600 transition-colors font-mono"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-2xl font-black text-xs bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-600 hover:opacity-95 text-white shadow-lg shadow-emerald-600/30 transition-all active:scale-98 disabled:opacity-50 cursor-pointer"
          >
            {loading ? 'যাচাই করা হচ্ছে...' : 'ইমেইল দিয়ে লগইন করুন'}
          </button>
        </form>

        <div className="pt-5 text-center">
          <button
            type="button"
            onClick={() => {
              window.location.hash = '';
              window.location.pathname = '/';
            }}
            className="text-xs text-slate-400 hover:text-emerald-400 transition-colors font-semibold"
          >
            ← মূল স্টোরে ফিরে যান
          </button>
        </div>
      </div>
    </div>
  );
};
