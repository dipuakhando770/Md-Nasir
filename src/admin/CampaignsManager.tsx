import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Timer, CheckCircle2, XCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Campaign } from '../types';
import { createCampaign, updateCampaign, deleteCampaign } from '../firebase/services';
import { formatDate } from '../utils/formatters';

export const CampaignsManager: React.FC = () => {
  const { campaigns, products } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingCampaign(null);
    setTitle('');
    setSubtitle('');
    setSelectedProductIds([]);
    const now = new Date();
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    setStartDateStr(now.toISOString().split('T')[0]);
    setEndDateStr(nextWeek.toISOString().split('T')[0]);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Campaign) => {
    setEditingCampaign(c);
    setTitle(c.title);
    setSubtitle(c.subtitle || '');
    setSelectedProductIds(c.productIds || []);
    setStartDateStr(
      c.startAt ? new Date(c.startAt).toISOString().split('T')[0] : ''
    );
    setEndDateStr(
      c.endAt ? new Date(c.endAt).toISOString().split('T')[0] : ''
    );
    setActive(c.active);
    setIsModalOpen(true);
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedProductIds.includes(productId)) {
      setSelectedProductIds(selectedProductIds.filter((id) => id !== productId));
    } else {
      setSelectedProductIds([...selectedProductIds, productId]);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || selectedProductIds.length === 0) {
      alert('ক্যাম্পেইনের নাম এবং অন্তত ১টি পণ্য নির্বাচন করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const startAt = startDateStr ? new Date(startDateStr).getTime() : Date.now();
      const endAt = endDateStr
        ? new Date(endDateStr).getTime() + 24 * 60 * 60 * 1000 - 1
        : Date.now() + 7 * 24 * 60 * 60 * 1000;

      const payload = {
        title: title.trim(),
        subtitle: subtitle.trim(),
        productIds: selectedProductIds,
        startAt,
        endAt,
        active,
      };

      if (editingCampaign) {
        await updateCampaign(editingCampaign.id, payload);
      } else {
        await createCampaign(payload);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save campaign error:', err);
      alert('ক্যাম্পেইন সংরক্ষণ করতে সমস্যা হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`আপনি কি "${title}" ক্যাম্পেইন মুছে ফেলতে চান?`)) {
      try {
        await deleteCampaign(id);
      } catch (err) {
        console.error('Delete campaign error:', err);
        alert('মুছতে সমস্যা হয়েছে।');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">সাপ্তাহিক অফার ও ক্যাম্পেইন</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            হোমপেজের সাপ্তাহিক হাইলাইটস এবং বিশেষ ছাড়ের ক্যাম্পেইন পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ক্যাম্পেইন তৈরি করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map((camp) => (
          <div
            key={camp.id}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <h3 className="font-bold text-base text-white">{camp.title}</h3>
                {camp.active ? (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    সক্রিয়
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 shrink-0">
                    নিষ্ক্রিয়
                  </span>
                )}
              </div>

              {camp.subtitle && (
                <p className="text-xs text-slate-300 mb-3">{camp.subtitle}</p>
              )}

              <div className="text-xs text-slate-400 space-y-1">
                <div>মেয়াদ: {formatDate(camp.startAt)} থেকে {formatDate(camp.endAt)}</div>
                <div>মোট নির্বাচিত পণ্য: {camp.productIds?.length || 0} টি</div>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => openEditModal(camp)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => handleDelete(camp.id, camp.title)}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {campaigns.length === 0 && (
          <div className="col-span-2 py-10 text-center text-slate-500 italic bg-slate-900/40 rounded-2xl border border-slate-800">
            বর্তমানে কোনো সক্রিয় বা তৈরি ক্যাম্পেইন নেই।
          </div>
        )}
      </div>

      {/* Add / Edit Campaign Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-white">
                {editingCampaign ? 'ক্যাম্পেইন সম্পাদনা' : 'নতুন ক্যাম্পেইন তৈরি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ক্যাম্পেইনের শিরোনাম (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="উদাঃ এই সপ্তাহের মেগা ডিসকাউন্ট অফার"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সাবটাইটেল বা বিবরণ
                </label>
                <input
                  type="text"
                  value={subtitle}
                  onChange={(e) => setSubtitle(e.target.value)}
                  placeholder="সীমিত সময়ের সেরা সব ডিজিটাল টেমপ্লেট ও লাইসেন্স"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    শুরুর তারিখ
                  </label>
                  <input
                    type="date"
                    value={startDateStr}
                    onChange={(e) => setStartDateStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    শেষ তারিখ
                  </label>
                  <input
                    type="date"
                    value={endDateStr}
                    onChange={(e) => setEndDateStr(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  ক্যাম্পেইনে প্রদর্শনের জন্য পণ্য নির্বাচন করুন ({selectedProductIds.length} টি নির্বাচিত) *
                </label>
                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                  {products.map((p) => {
                    const isChecked = selectedProductIds.includes(p.id);
                    return (
                      <label
                        key={p.id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer text-xs ${
                          isChecked ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleProductSelection(p.id)}
                            className="rounded bg-slate-900 border-slate-800 text-indigo-600"
                          />
                          <span>{p.title}</span>
                        </div>
                        <span className="text-slate-400">৳{p.price}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex items-center">
                <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={active}
                    onChange={(e) => setActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>ক্যাম্পেইন সক্রিয় রাখুন (Active)</span>
                </label>
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
