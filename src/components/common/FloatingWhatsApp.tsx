import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Sparkles, Send } from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { sanitizeWhatsAppNumber } from '../../utils/formatters';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [userMsg, setUserMsg] = useState('');

  const whatsappNumber = settings.whatsappNumber || '01962780922';
  const targetNumber = sanitizeWhatsAppNumber(whatsappNumber);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const textToSend = userMsg.trim() || 'আসসালামু আলাইকুম! নাসির ডিজিটাল হাব থেকে সেবা নিতে চাই।';
    const url = `https://wa.me/${targetNumber}?text=${encodeURIComponent(textToSend)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
    setUserMsg('');
  };

  const directWhatsAppUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! নাসির ডিজিটাল হাব থেকে সেবা নিতে চাই।')}`;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 15 }}
            className="mb-3 w-80 sm:w-88 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden text-slate-100"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-700 to-teal-800 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center border border-white/20">
                    <MessageCircle className="w-5 h-5 fill-white" />
                  </div>
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-emerald-900" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">Nasir Digital Hub Support</h4>
                  <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    আমরা অনলাইনে আছি (২৪/৭)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg hover:bg-white/10 text-white/80 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Chat Body */}
            <div className="p-4 bg-slate-950/60 space-y-3 text-xs">
              <div className="bg-slate-900 p-3 rounded-2xl rounded-tl-sm border border-slate-800 text-slate-200 leading-relaxed shadow-sm">
                👋 আসসালামু আলাইকুম! কীভাবে আপনাকে সহায়তা করতে পারি? আপনার পছন্দের প্রোডাক্ট বা কোনো প্রশ্ন থাকলে সরাসরি মেসেজ দিন।
              </div>

              {/* Quick Questions Chips */}
              <div className="space-y-1.5 pt-1">
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">দ্রুত প্রশ্ন করুন:</p>
                <button
                  type="button"
                  onClick={() => setUserMsg('Canva Pro / CapCut Pro এর লাইসেন্স কীভাবে পাবো?')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 text-slate-300 hover:text-emerald-400 text-[11px] transition-colors"
                >
                  ⚡ সফটওয়্যার লাইসেন্স ও এক্টিভেশন কীভাবে পাবো?
                </button>
                <button
                  type="button"
                  onClick={() => setUserMsg('পেমেন্ট মেথড (bKash/Nagad) এবং ডেলিভারি চার্জ কত?')}
                  className="w-full text-left p-2 rounded-xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/80 text-slate-300 hover:text-emerald-400 text-[11px] transition-colors"
                >
                  💳 পেমেন্ট মাধ্যম ও ইন্সট্যান্ট ডেলিভারি প্রক্রিয়া
                </button>
              </div>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSend} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={userMsg}
                onChange={(e) => setUserMsg(e.target.value)}
                placeholder="আপনার বার্তা লিখুন..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="submit"
                className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/30 transition-all shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Pulse Button (Matching Screenshot 832 & 833) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="relative flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-slate-800 shadow-xl border border-slate-200 hover:border-emerald-400 group"
      >
        <span className="font-semibold text-xs text-slate-700">Contact us</span>
        <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-md">
          <MessageCircle className="w-4 h-4 fill-white" />
        </div>
      </motion.button>
    </div>
  );
};
