import React from 'react';
import { MessageCircle, Mail, MapPin, ShieldCheck, Zap, Headphones, ArrowUpRight } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  setCurrentView: (view: 'home' | 'shop' | 'admin' | 'product') => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentView }) => {
  const { settings, categories } = useStore();

  const whatsappNumber = settings.whatsappNumber || '01962780922';
  const whatsappUrl = `https://wa.me/88${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('নাসির ডিজিটাল হাব এর সেবা সম্পর্কে জানতে চাচ্ছি।')}`;

  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400 text-sm mt-20 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-32 bg-indigo-600/5 blur-[120px] pointer-events-none" />

      {/* Trust Badges Row */}
      <div className="border-b border-slate-900/80 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">ইন্সট্যান্ট ডেলিভারি</h4>
              <p className="text-xs text-slate-400 mt-0.5">অর্ডার কনফার্মেশনের সাথে সাথেই লিংক ও অ্যাক্সেস</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">১০০% জেনুইন প্রোডাক্ট</h4>
              <p className="text-xs text-slate-400 mt-0.5">ভেরিফাইড লাইসেন্স ও লাইফটাইম রিসোর্স সাপোর্ট</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/40 border border-slate-800/60 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center shrink-0">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-semibold text-white">২৪/৭ কাস্টমার সাপোর্ট</h4>
              <p className="text-xs text-slate-400 mt-0.5">যেকোনো সহায়তায় সরাসরি WhatsApp হেল্পলাইন</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand & Description (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <BrandLogo variant="footer" />
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              {settings.metaDescription ||
                settings.description ||
                'বাংলাদেশের বিশ্বস্ত প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার লাইসেন্স মার্কেটপ্লেস। অতি দ্রুত ও নিরাপদে গ্রহণ করুন আপনার প্রয়োজনীয় সার্ভিস।'}
            </p>

            <div className="pt-2 flex flex-wrap gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-semibold transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp সাপোর্ট: {whatsappNumber}</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">প্রয়োজনীয় লিংক</h4>
            <ul className="space-y-2.5">
              <li>
                <button
                  onClick={() => {
                    setCurrentView('shop');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>সকল পণ্যসমূহ</span>
                  <ArrowUpRight className="w-3.5 h-3.5 opacity-50" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setTimeout(() => {
                      document.querySelector('#discount')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>বিশেষ অফার ও ছাড়</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setTimeout(() => {
                      document.querySelector('#benefits')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>আমাদের সুবিধাগুলো</span>
                </button>
              </li>
              <li>
                <button
                  onClick={() => {
                    setCurrentView('home');
                    setTimeout(() => {
                      document.querySelector('#faq')?.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="hover:text-indigo-400 transition-colors text-left flex items-center gap-1.5"
                >
                  <span>সাধারণ প্রশ্নোত্তর (FAQ)</span>
                </button>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">ক্যাটাগরি</h4>
            <ul className="space-y-2.5">
              {categories.slice(0, 5).map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setCurrentView('shop');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="hover:text-indigo-400 transition-colors text-left truncate max-w-full"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
              {categories.length === 0 && (
                <li className="text-slate-500 italic">ডিজিটাল রিসোর্স</li>
              )}
            </ul>
          </div>

          {/* Contact Details & Payment Gateways */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">যোগাযোগ</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <span>WhatsApp: {whatsappNumber}</span>
              </li>
              {settings.email && (
                <li className="flex items-start gap-2.5">
                  <Mail className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                  <span>{settings.email}</span>
                </li>
              )}
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <span>{settings.address || 'ঢাকা, বাংলাদেশ'}</span>
              </li>
            </ul>

            <div className="mt-6 pt-4 border-t border-slate-900">
              <p className="text-xs text-slate-400 font-medium mb-2.5">পেমেন্ট মেথডসমূহ:</p>
              <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-300">
                <span className="px-2.5 py-1 rounded-md bg-pink-950/50 border border-pink-500/30 text-pink-300">bKash</span>
                <span className="px-2.5 py-1 rounded-md bg-orange-950/50 border border-orange-500/30 text-orange-300">Nagad</span>
                <span className="px-2.5 py-1 rounded-md bg-purple-950/50 border border-purple-500/30 text-purple-300">Rocket</span>
                <span className="px-2.5 py-1 rounded-md bg-blue-950/50 border border-blue-500/30 text-blue-300">Bank</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="mt-16 pt-8 border-t border-slate-900/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} {settings.websiteName || 'Raduan'}. All rights reserved.</p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস</span>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                window.location.hash = 'admin';
                setCurrentView('admin');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="text-slate-500 hover:text-emerald-400 transition-colors underline underline-offset-4"
            >
              Admin Access
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
