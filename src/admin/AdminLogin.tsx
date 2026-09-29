import React, { useState } from 'react';
import { Mail, Key, ShieldCheck, AlertCircle, Sparkles } from 'lucide-react';
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
        return 'লগইন সম্পন্ন করা যায়নি। পুনরায় সঠিক তথ্য দিয়ে চেষ্টা করুন।';
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

  // If user is authenticated in Firebase but does not hold the authorized ADMIN_UID
  if (user && !isAdmin) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 rounded-3xl bg-slate-900 border border-rose-500/30 text-center space-y-4 shadow-2xl">
        <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white">অননুমোদিত অ্যাক্সেস (Unauthorized)</h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          আপনার লগইনকৃত অ্যাকাউন্টটি ({user.email || user.uid.slice(0, 8)}) অ্যাডমিন সুবিধার জন্য অনুমোদিত নয়। শুধুমাত্র অনুমোদিত অ্যাডমিন অ্যাকাউন্টই ড্যাশবোর্ডে প্রবেশ করতে পারে।
        </p>
        <div className="pt-2">
          <button
            onClick={logout}
            className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-semibold text-xs transition-colors"
          >
            অন্য অ্যাকাউন্টে লগইন করুন
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto my-16 p-6 sm:p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl">
      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-600/30">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-black text-white">অ্যাডমিন সিকিউর লগইন</h2>
        <p className="text-xs text-slate-400 mt-1">
          স্টোর ম্যানেজমেন্ট ড্যাশবোর্ডে প্রবেশ করতে প্রমাণীকরণ সম্পন্ন করুন
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
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
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none placeholder:text-slate-600 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
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
            className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none placeholder:text-slate-600 transition-colors"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all active:scale-98 disabled:opacity-50"
        >
          {loading ? 'যাচাই করা হচ্ছে...' : 'লগইন করুন'}
        </button>
      </form>

      <div className="relative my-6 text-center">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-800" />
        </div>
        <span className="relative bg-slate-900 px-3 text-[11px] text-slate-500 font-medium">
          অথবা
        </span>
      </div>

      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={loading}
        className="w-full py-2.5 px-4 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors active:scale-98"
      >
        <Sparkles className="w-4 h-4 text-indigo-400" />
        <span>Google দিয়ে সাইন ইন করুন</span>
      </button>

      <div className="pt-4 text-center">
        <button
          type="button"
          onClick={() => {
            window.location.hash = '';
            window.location.reload();
          }}
          className="text-xs text-slate-400 hover:text-indigo-400 transition-colors underline underline-offset-4"
        >
          ← মূল স্টোরে ফিরে যান
        </button>
      </div>
    </div>
  );
};
