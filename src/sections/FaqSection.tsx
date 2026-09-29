import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: 'অর্ডার করার পর ডিজিটাল পণ্য কীভাবে পাবো?',
      answer:
        'চেকআউট সম্পন্ন করে WhatsApp এ অর্ডার কনফার্ম করার সাথে সাথেই আমাদের প্রতিনিধি আপনাকে সরাসরি ডাউনলোড লিংক, লাইসেন্স কী এবং বিস্তারিত ইন্সটলেশন গাইডলাইন পাঠিয়ে দেবেন। সম্পূর্ণ প্রক্রিয়াটি সাধারণত ৫ থেকে ১৫ মিনিটের মধ্যে সম্পন্ন হয়।',
    },
    {
      question: 'পেমেন্ট কীভাবে সম্পন্ন করব?',
      answer:
        'আপনি bKash, Nagad, Rocket অথবা ব্যাংক ট্রান্সফারের মাধ্যমে সহজেই নিরাপদে পেমেন্ট করতে পারবেন। অর্ডারের পর আপনাকে আমাদের অফিশিয়াল মার্চেন্ট/পার্সোনাল নম্বর প্রদান করা হবে।',
    },
    {
      question: 'ডিজিটাল প্রডাক্ট কি লাইফটাইম ব্যবহার করা যাবে?',
      answer:
        'হ্যাঁ! আমাদের অধিকাংশ ডিজিটাল টেমপ্লেট, বান্ডেল ও রিসোর্স লাইফটাইম অ্যাক্সেস সহ প্রদান করা হয়। সফটওয়্যার সাবস্ক্রিপশনের ক্ষেত্রে পণ্যের বিবরণে উল্লেখিত মেয়াদ প্রযোজ্য হবে।',
    },
    {
      question: 'কোনো টেকনিক্যাল সমস্যা হলে কীভাবে সহায়তা পাবো?',
      answer:
        'যেকোনো সহায়তা বা প্রশ্নের জন্য আমাদের ২৪/৭ WhatsApp হেল্পলাইন খোলা রয়েছে। আমাদের এক্সপার্ট টিম আপনাকে যেকোনো সমস্যা সমাধানে স্ক্রিনশট বা ভিডিও গাইডের মাধ্যমে তাৎক্ষণিক সহায়তা দেবে।',
    },
    {
      question: 'পণ্য কাজ না করলে কি রিপ্লেসমেন্ট গ্যারান্টি আছে?',
      answer:
        'অবশ্যই! আমাদের প্রতিটি ডিজিটাল পণ্যের ওপর ১০০% ভেরিফিকেশন ও জেনুইন রিপ্লেসমেন্ট গ্যারান্টি প্রদান করা হয়। কোনো ত্রুটি থাকলে আমরা দ্রুততম সময়ে নতুন অ্যাক্সেস প্রদান করি।',
    },
  ];

  return (
    <section id="faq" className="py-12 sm:py-16 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>সাধারণ জিজ্ঞাসা</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্নাবলী (FAQ)
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2">
            আমাদের সেবা ও ডেলিভারি সংক্রান্ত প্রয়োজনীয় কিছু সাধারণ প্রশ্ন ও উত্তর
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className={`rounded-2xl border transition-all duration-200 bg-white ${
                  isOpen ? 'border-emerald-500 shadow-md shadow-emerald-500/5' : 'border-slate-200'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-900">
                    {faq.question}
                  </span>
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? 'rotate-180 text-emerald-600 bg-emerald-50'
                        : 'text-slate-400 bg-slate-100'
                    }`}
                  >
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
