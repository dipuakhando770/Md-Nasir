import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Zap, ShieldCheck, Headphones, Award, Check, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Benefit } from '../types';
import { createBenefit, updateBenefit, deleteBenefit } from '../firebase/services';

export const BenefitsManager: React.FC = () => {
  const { benefits } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBenefit, setEditingBenefit] = useState<Benefit | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('zap');
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingBenefit(null);
    setTitle('');
    setDescription('');
    setIcon('zap');
    setSortOrder(benefits.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (b: Benefit) => {
    setEditingBenefit(b);
    setTitle(b.title);
    setDescription(b.description);
    setIcon(b.icon || 'zap');
    setSortOrder(b.sortOrder || 1);
    setActive(b.active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      alert('শিরোনাম ও বিবরণ দিন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        title: title.trim(),
        description: description.trim(),
        icon,
        sortOrder: Number(sortOrder),
        active,
      };

      if (editingBenefit) {
        await updateBenefit(editingBenefit.id, payload);
      } else {
        await createBenefit(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save benefit error:', err);
      alert('সুবিধা আইটেম সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`আপনি কি "${title}" আইটেমটি মুছে ফেলতে চান?`)) {
      try {
        await deleteBenefit(id);
      } catch (err) {
        console.error('Delete benefit error:', err);
        alert('মুছতে সমস্যা হয়েছে।');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">কেন আমরা / সেবার সুবিধাসমূহ</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            হোমপেজের 'Why Choose Us' সেকশনের কার্ডসমূহ সম্পাদনা ও তৈরি করুন
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন সুবিধা যোগ করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {benefits.map((b) => (
          <div
            key={b.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 font-bold uppercase text-[10px]">
                  {b.icon}
                </span>
                <span className="text-[10px] text-slate-500">ক্রম: {b.sortOrder}</span>
              </div>
              <h3 className="font-bold text-sm text-white mb-1">{b.title}</h3>
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {b.description}
              </p>
            </div>

            <div className="pt-3 mt-4 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-emerald-400 font-semibold">
                {b.active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => openEditModal(b)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(b.id, b.title)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingBenefit ? 'সুবিধা আইটেম সম্পাদনা' : 'নতুন সুবিধা যোগ'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  আইকন সিলেক্টর
                </label>
                <select
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="zap">ইন্সট্যান্ট স্পিড (Zap)</option>
                  <option value="shield">নিরাপত্তা ও জেনুইন (Shield)</option>
                  <option value="headphones">২৪/৭ সাপোর্ট (Headphones)</option>
                  <option value="award">গুণগত মান (Award)</option>
                  <option value="clock">সময় ও ডেলিভারি (Clock)</option>
                  <option value="handshake">বিশ্বাস ও পার্টনারশিপ (Handshake)</option>
                  <option value="sparkles">প্রিমিয়াম কোয়ালিটি (Sparkles)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  শিরোনাম (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="উদাঃ তাত্ক্ষণিক অনলাইন ডেলিভারি"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  বিস্তারিত বিবরণ *
                </label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="অর্ডারের সাথে সাথেই আপনার ইমেইল বা হোয়াটসঅ্যাপে এক্সেস লিংক পৌঁছে যাবে।"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ক্রম (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                    />
                    <span>সক্রিয় রাখুন</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
