import React from 'react';
import { MessageCircle, Zap, ShieldCheck } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { sanitizeWhatsAppNumber } from '../utils/formatters';

export const WhatsAppCtaSection: React.FC = () => {
  const { settings } = useStore();
  const whatsappNumber = settings.whatsappNumber || '01962780922';
  const targetNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const whatsappUrl = `https://wa.me/${targetNumber}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি নাসির ডিজিটাল হাব এর সাথে যোগাযোগ করতে চাই।')}`;

  return (
    <section className="py-10 sm:py-14 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-900 to-emerald-950 p-8 sm:p-12 text-center text-white shadow-xl">
        <div className="max-w-2xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 text-white flex items-center justify-center mx-auto shadow-lg backdrop-blur-sm">
            <MessageCircle className="w-8 h-8 fill-white/20" />
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            যেকোনো ডিজিটাল প্রোডাক্টের প্রয়োজনে সরাসরি WhatsApp এ কথা বলুন
          </h2>

          <p className="text-xs sm:text-sm text-emerald-100 leading-relaxed max-w-xl mx-auto">
            কোনো নির্দিষ্ট সফটওয়্যার, সাবস্ক্রিপশন অথবা কাস্টম ডিজিটাল রিসোর্স প্রয়োজন? আমাদের সরাসরি জানান, আমরা সর্বোচ্চ দ্রুততায় ব্যবস্থা করে দেব।
          </p>

          <div className="pt-3 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black text-sm bg-white hover:bg-emerald-50 text-emerald-900 shadow-xl flex items-center justify-center gap-2.5 active:scale-95 transition-all"
            >
              <MessageCircle className="w-5 h-5 fill-emerald-600 text-emerald-600" />
              <span>WhatsApp চ্যাট শুরু করুন ({whatsappNumber})</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
