import React, { useState } from 'react';
import { Plus, Edit2, Trash2, FolderKanban, CheckCircle2, XCircle, X, AlertCircle } from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Category } from '../types';
import { createCategory, updateCategory, deleteCategory } from '../firebase/services';
import { ImageUploader, isSafeImageUrl } from '../components/common/ImageUploader';
import { normalizeImageUrl } from '../utils/formatters';

export const CategoryManager: React.FC = () => {
  const { categories, products } = useStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [sortOrder, setSortOrder] = useState(1);
  const [active, setActive] = useState(true);

  const openAddModal = () => {
    setEditingCategory(null);
    setFormError(null);
    setName('');
    setSlug('');
    setDescription('');
    setImageUrl('');
    setSortOrder(categories.length + 1);
    setActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setFormError(null);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setImageUrl(cat.imageUrl || '');
    setSortOrder(cat.sortOrder || 1);
    setActive(cat.active !== false);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = name.trim();
    if (!cleanName) {
      setFormError('ক্যাটাগরির নাম প্রদান করা আবশ্যক।');
      return;
    }

    if (cleanName.length > 150) {
      setFormError('ক্যাটাগরির নাম সর্বোচ্চ ১৫০ অক্ষরের মধ্যে হতে হবে।');
      return;
    }

    if (imageUrl.trim() && !isSafeImageUrl(imageUrl.trim())) {
      setFormError('অবৈধ ইমেজ লিঙ্ক। শুধুমাত্র নিরাপদ https:// অথবা ডিভাইস ছবি ব্যবহার করুন।');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedSlug = (
        slug.trim() ||
        cleanName
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') ||
        `cat-${Date.now()}`
      ).slice(0, 150);

      const payload = {
        name: cleanName,
        slug: generatedSlug,
        description: description.trim().slice(0, 2000),
        imageUrl: imageUrl.trim(),
        sortOrder: Number(sortOrder) || 1,
        active: Boolean(active),
      };

      if (editingCategory) {
        await updateCategory(editingCategory.id, payload);
      } else {
        await createCategory({
          ...payload,
          createdAt: Date.now(),
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save category error:', err);
      setFormError('ক্যাটাগরি সংরক্ষণ করতে ব্যর্থ হয়েছে।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, categoryName: string) => {
    const productCount = products.filter((p) => p.categoryId === id).length;
    if (productCount > 0) {
      alert(`এই ক্যাটাগরিতে ${productCount} টি পণ্য সক্রিয় রয়েছে। আগে পণ্যগুলোর ক্যাটাগরি পরিবর্তন করুন।`);
      return;
    }

    if (window.confirm(`আপনি কি নিশ্চিত যে "${categoryName}" ক্যাটাগরি মুছে ফেলতে চান?`)) {
      try {
        await deleteCategory(id);
      } catch (err) {
        console.error('Delete category error:', err);
        alert('ক্যাটাগরি মুছতে সমস্যা হয়েছে।');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">ক্যাটাগরি ব্যবস্থাপনা (Categories)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            পণ্যের শ্রেণিবিভাগ তৈরি ও সাজানোর তালিকা
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন ক্যাটাগরি যোগ করুন</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => {
          const productCount = products.filter((p) => p.categoryId === category.id).length;
          return (
            <div
              key={category.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-col justify-between"
            >
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                  {category.imageUrl ? (
                    <img
                      src={normalizeImageUrl(category.imageUrl)}
                      alt={category.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderKanban className="w-6 h-6 text-indigo-400" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className="font-bold text-white truncate" title={category.name}>
                      {category.name}
                    </h4>
                    {category.active !== false ? (
                      <span className="text-[10px] text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10">
                        সক্রিয়
                      </span>
                    ) : (
                      <span className="text-[10px] text-rose-400 font-semibold px-1.5 py-0.5 rounded bg-rose-500/10">
                        নিষ্ক্রিয়
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono">/{category.slug}</p>
                  <p className="text-xs text-slate-500 mt-1">{productCount} টি সংযুক্ত পণ্য</p>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 mt-3 border-t border-slate-800/80">
                <button
                  onClick={() => openEditModal(category)}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="সম্পাদনা"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">
                {editingCategory ? 'ক্যাটাগরি সম্পাদনা' : 'নতুন ক্যাটাগরি তৈরি'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ক্যাটাগরির নাম *
                </label>
                <input
                  type="text"
                  required
                  maxLength={150}
                  placeholder="যেমন: Graphic Design"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সংক্ষিপ্ত বিবরণ
                </label>
                <textarea
                  rows={2}
                  maxLength={2000}
                  placeholder="এই ক্যাটাগরির অন্তর্ভুক্ত পণ্যের সংক্ষিপ্ত পরিচিতি..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <ImageUploader
                label="ক্যাটাগরি আইকন বা থাম্বনেইল"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                helperText="ক্যাটাগরির জন্য ছবি আপলোড করুন অথবা লিঙ্ক দিন"
                maxDimension={500}
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ক্রম সংখ্যা (Sort Order)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(Math.max(1, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                    <input
                      type="checkbox"
                      checked={active}
                      onChange={(e) => setActive(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    <span>সক্রিয় রাখুন (Active)</span>
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingCategory ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
