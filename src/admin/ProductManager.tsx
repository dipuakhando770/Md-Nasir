import React, { useState } from 'react';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  Zap,
  Star,
  ExternalLink,
  X,
  AlertCircle,
  Globe,
  Eye,
  Download,
  Gift,
  Copy,
  Check,
  Link as LinkIcon,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { Product, ProductType } from '../types';
import { createProduct, updateProduct, deleteProduct } from '../firebase/services';
import { formatPrice, normalizeImageUrl } from '../utils/formatters';
import { ImageUploader, isSafeImageUrl } from '../components/common/ImageUploader';
import { generateSlug, getProductSlug, getProductFullUrl } from '../utils/slugify';

export const ProductManager: React.FC = () => {
  const { products, categories, getCategoryName } = useStore();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [oldPrice, setOldPrice] = useState<number>(0);
  const [available, setAvailable] = useState(true);
  const [featured, setFeatured] = useState(false);
  const [newArrival, setNewArrival] = useState(true);
  const [type, setType] = useState<ProductType>('digital');
  const [isFree, setIsFree] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState('');
  const [livePreviewEnabled, setLivePreviewEnabled] = useState(false);
  const [livePreviewUrl, setLivePreviewUrl] = useState('');
  const [rating, setRating] = useState<number>(5.0);
  const [reviewCount, setReviewCount] = useState<number>(10);
  const [tagsInput, setTagsInput] = useState('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormError(null);
    setTitle('');
    setSlug('');
    setCategoryId(categories[0]?.id || 'graphic');
    setDescription('');
    setShortDescription('');
    setImageUrl('');
    setPrice(0);
    setOldPrice(0);
    setAvailable(true);
    setFeatured(false);
    setNewArrival(true);
    setType('digital');
    setIsFree(false);
    setDownloadUrl('');
    setLivePreviewEnabled(false);
    setLivePreviewUrl('');
    setRating(5.0);
    setReviewCount(12);
    setTagsInput('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormError(null);
    setTitle(p.title);
    setSlug(p.slug);
    setCategoryId(p.categoryId);
    setDescription(p.description || '');
    setShortDescription(p.shortDescription || '');
    setImageUrl(p.imageUrl);
    setPrice(p.price);
    setOldPrice(p.oldPrice || 0);
    setAvailable(p.available);
    setFeatured(p.featured);
    setNewArrival(p.newArrival || false);
    setType(p.type || 'digital');
    setIsFree(Boolean(p.isFree));
    setDownloadUrl(p.downloadUrl || '');
    setLivePreviewEnabled(Boolean(p.livePreviewEnabled));
    setLivePreviewUrl(p.livePreviewUrl || '');
    setRating(p.rating || 5.0);
    setReviewCount(p.reviewCount || 0);
    setTagsInput(p.tags ? p.tags.join(', ') : '');
    setIsModalOpen(true);
  };

  const handleCopyProductUrl = (p: Product) => {
    const fullUrl = getProductFullUrl(p);
    navigator.clipboard?.writeText(fullUrl);
    setCopiedProductId(p.id);
    setTimeout(() => setCopiedProductId(null), 2500);
  };

  const normalizeExternalUrl = (rawUrl: string): string => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    return `https://${trimmed}`;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanTitle = title.trim();
    if (!cleanTitle) {
      setFormError('পণ্যের শিরোনাম (Title) প্রদান করা আবশ্যক।');
      return;
    }

    if (cleanTitle.length > 300) {
      setFormError('শিরোনাম সর্বোচ্চ ৩০০ অক্ষরের মধ্যে হতে হবে।');
      return;
    }

    if (!categoryId) {
      setFormError('অনুগ্রহ করে একটি ক্যাটাগরি নির্বাচন করুন।');
      return;
    }

    const numPrice = isFree ? 0 : Number(price);
    if (isNaN(numPrice) || numPrice < 0) {
      setFormError('মূল্য একটি সঠিক ধনাত্মক সংখ্যা হতে হবে।');
      return;
    }

    const numOldPrice = Number(oldPrice) || 0;
    if (numOldPrice < 0) {
      setFormError('পূর্বের মূল্য ঋণাত্মক হতে পারে না।');
      return;
    }

    if (imageUrl.trim() && !isSafeImageUrl(imageUrl.trim())) {
      setFormError('অবৈধ ইমেজ URL লিঙ্ক। শুধুমাত্র নিরাপদ https:// অথবা ডিভাইস ছবি ব্যবহার করুন।');
      return;
    }

    const normalizedDownloadUrl = normalizeExternalUrl(downloadUrl);
    if (normalizedDownloadUrl && !/^https?:\/\/.+/i.test(normalizedDownloadUrl)) {
      setFormError('ডাউনলোড বা অ্যাক্সেস লিঙ্কটি একটি সঠিক https:// URL হতে হবে।');
      return;
    }

    const normalizedPreviewUrl = normalizeExternalUrl(livePreviewUrl);
    if (livePreviewEnabled && !normalizedPreviewUrl) {
      setFormError('Live Preview অন করা থাকলে একটি সঠিক Live Preview URL প্রদান করুন।');
      return;
    }

    if (normalizedPreviewUrl && !/^https?:\/\/.+/i.test(normalizedPreviewUrl)) {
      setFormError('Live Preview লিঙ্কটি একটি সঠিক https:// ওয়েবসাইট লিঙ্ক হতে হবে।');
      return;
    }

    setIsSubmitting(true);
    try {
      const generatedSlug = (
        slug.trim() ||
        cleanTitle
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-+|-+$/g, '') ||
        `prod-${Date.now()}`
      ).slice(0, 300);

      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean)
        .slice(0, 50);

      const payload = {
        title: cleanTitle,
        slug: generatedSlug,
        categoryId,
        description: description.trim().slice(0, 25000),
        shortDescription: shortDescription.trim().slice(0, 2000),
        imageUrl: imageUrl.trim(),
        gallery: editingProduct?.gallery || [],
        price: numPrice,
        oldPrice: numOldPrice,
        available: Boolean(available),
        featured: Boolean(featured),
        newArrival: Boolean(newArrival),
        type,
        isFree: Boolean(isFree),
        downloadUrl: normalizedDownloadUrl.slice(0, 2000),
        livePreviewEnabled: Boolean(livePreviewEnabled && normalizedPreviewUrl),
        livePreviewUrl: normalizedPreviewUrl.slice(0, 1900),
        rating: Math.min(5, Math.max(0, Number(rating) || 5.0)),
        reviewCount: Math.max(0, Number(reviewCount) || 0),
        tags,
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload);
      } else {
        await createProduct({
          ...payload,
          createdAt: Date.now(),
        });
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('Save product error:', err);
      setFormError('পণ্য সংরক্ষণ করতে ব্যর্থ হয়েছে। অনুমতি বা ডাটা যাচাই করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, productTitle: string) => {
    if (window.confirm(`আপনি কি নিশ্চিত যে "${productTitle}" পণ্যটি স্থায়ীভাবে মুছে ফেলতে চান?`)) {
      try {
        await deleteProduct(id);
      } catch (err) {
        console.error('Delete product error:', err);
        alert('পণ্যটি মুছতে ব্যর্থ হয়েছে।');
      }
    }
  };

  const filteredProducts = products.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase()) ||
      getCategoryName(p.categoryId).toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">পণ্য ব্যবস্থাপনা (Products)</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            স্টোরের সকল ডিজিটাল পণ্য ও রিসোর্স তৈরি, সম্পাদনা ও স্টক পরিচালনা করুন
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>নতুন পণ্য যোগ করুন</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="পণ্যের নাম, ক্যাটাগরি বা স্লাগ দিয়ে খুঁজুন..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
        />
      </div>

      {/* Product List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">ছবি ও নাম</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">মূল্য</th>
                <th className="py-3.5 px-4">স্টক</th>
                <th className="py-3.5 px-4">ফিচার্ড</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-500">
                    কোনো পণ্য পাওয়া যায়নি।
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          {product.imageUrl ? (
                            <img
                              src={normalizeImageUrl(product.imageUrl)}
                              alt={product.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <Zap className="w-5 h-5 text-indigo-400" />
                          )}
                        </div>
                        <div className="min-w-0 max-w-xs sm:max-w-md">
                          <h4 className="font-semibold text-white truncate" title={product.title}>
                            {product.title}
                          </h4>
                          <div className="flex items-center gap-2 flex-wrap mt-0.5">
                            <span className="text-[11px] text-slate-400 font-mono">
                              /{product.slug}
                            </span>
                            {product.isFree && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-extrabold">
                                <Gift className="w-3 h-3" />
                                <span>FREE Download</span>
                              </span>
                            )}
                            {product.livePreviewEnabled && product.livePreviewUrl && (
                              <a
                                href={product.livePreviewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/25 text-[10px] font-bold transition-colors"
                                title={product.livePreviewUrl}
                              >
                                <Eye className="w-3 h-3" />
                                <span>Live Preview ON</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[11px] font-semibold">
                        {getCategoryName(product.categoryId)}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      {product.isFree ? (
                        <div>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-extrabold text-xs">
                            ফ্রি (FREE)
                          </span>
                          {product.oldPrice && product.oldPrice > 0 ? (
                            <div className="text-[11px] text-slate-500 line-through mt-0.5">
                              {formatPrice(product.oldPrice)}
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <>
                          <div className="font-bold text-white text-sm">
                            {formatPrice(product.price)}
                          </div>
                          {product.oldPrice && product.oldPrice > product.price && (
                            <div className="text-[11px] text-slate-500 line-through">
                              {formatPrice(product.oldPrice)}
                            </div>
                          )}
                        </>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {product.available ? (
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> স্টকে আছে
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-rose-400 font-medium">
                          <XCircle className="w-3.5 h-3.5" /> স্টক শেষ
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {product.featured ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-[10px] font-bold">
                          ফিচার্ড
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleCopyProductUrl(product)}
                          className={`p-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1 transition-colors ${
                            copiedProductId === product.id
                              ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border-slate-700'
                          }`}
                          title="টপ লেভেল SEO লিঙ্ক কপি করুন"
                        >
                          {copiedProductId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-[10px] text-emerald-400 font-bold">কপি হয়েছে</span>
                            </>
                          ) : (
                            <>
                              <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                              <span className="text-[10px]">SEO লিঙ্ক</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => openEditModal(product)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                          title="সম্পাদনা"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(product.id, product.title)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors"
                          title="মুছে ফেলুন"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                <span>{editingProduct ? 'পণ্য সম্পাদনা করুন' : 'নতুন ডিজিটাল পণ্য যোগ করুন'}</span>
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    পণ্যের নাম (Title) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={300}
                    placeholder="যেমন: Canva Pro Lifetime Account"
                    value={title}
                    onChange={(e) => {
                      const newTitle = e.target.value;
                      setTitle(newTitle);
                      if (!editingProduct) {
                        setSlug(generateSlug(newTitle));
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ক্যাটাগরি *
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SEO Clean Top-Level URL Slug & Live Preview */}
              <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-indigo-400">
                    🔗 কাস্টম এসইও স্লাগ / লিংক (SEO URL Slug)
                  </label>
                  <span className="text-[10px] text-emerald-400 font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                    হ্যাশট্যাগ (#) ছাড়া টপ লেভেল লিংক
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                    /product/
                  </span>
                  <input
                    type="text"
                    placeholder="canva-pro-lifetime-account"
                    value={slug}
                    onChange={(e) => setSlug(generateSlug(e.target.value))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <span>লাইভ SEO লিঙ্ক:</span>
                  <strong className="font-mono text-emerald-400 truncate">
                    https://www.nasirdigitalhub.com/product/{slug || generateSlug(title) || 'product-name'}
                  </strong>
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    বিক্রয় মূল্য (Price ৳) {isFree ? '(ফ্রি প্রোডাক্ট চালু)' : '*'}
                  </label>
                  <input
                    type="number"
                    required={!isFree}
                    min="0"
                    disabled={isFree}
                    placeholder="499"
                    value={isFree ? 0 : price}
                    onChange={(e) => setPrice(Math.max(0, Number(e.target.value)))}
                    className={`w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 ${
                      isFree ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    পূর্বের মূল্য (Old Price ৳)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="1500"
                    value={oldPrice}
                    onChange={(e) => setOldPrice(Math.max(0, Number(e.target.value)))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    প্রোডাক্ট টাইপ
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as ProductType)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="digital">ডিজিটাল প্রোডাক্ট (Instant Delivery)</option>
                    <option value="physical">ফিজিক্যাল প্রোডাক্ট (Courier Delivery)</option>
                  </select>
                </div>
              </div>

              {/* Free Product Configuration Card (100% Free Download Without Payment) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-emerald-500/35 space-y-3.5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Free Product (ফ্রি প্রোডাক্ট — পেমেন্ট ছাড়াই ফ্রি ডাউনলোড)
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            isFree
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {isFree ? 'ফ্রি ডাউনলোড চালু (FREE ON)' : 'পেইড প্রোডাক্ট (OFF)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        এটি অন করে দিলে কাস্টমাররা কোনো প্রকার পেমেন্ট বা অর্ডার ছাড়াই সরাসরি এক ক্লিকে ফ্রি ডাউনলোড করতে পারবেন
                      </p>
                    </div>
                  </div>

                  {/* Free Product Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsFree((prev) => {
                        const next = !prev;
                        if (next) {
                          setPrice(0);
                        }
                        return next;
                      });
                    }}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      isFree ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={isFree}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        isFree ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Direct Download File / Drive Link Input */}
                <div className="pt-1 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    ডিজিটাল ফ্রি ডাউনলোড বা ফাইল অ্যাক্সেস লিঙ্ক (Google Drive / Mega / Direct File URL)
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Download className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="https://drive.google.com/file/d/..."
                        value={downloadUrl}
                        onChange={(e) => setDownloadUrl(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {downloadUrl.trim() && (
                      <a
                        href={normalizeExternalUrl(downloadUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>টেস্ট ডাউনলোড</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    {isFree
                      ? '✅ ফ্রি প্রোডাক্ট চালু আছে: ইউজাররা "ফ্রি ডাউনলোড করুন" বাটনে ক্লিক করলে সরাসরি এই লিঙ্ক থেকে পেমেন্ট ছাড়াই ডাউনলোড করতে পারবেন।'
                      : 'পেইড বা ফ্রি যেকোনো প্রোডাক্টের ডাউনলোড/অ্যাক্সেস লিঙ্ক এখানে দিতে পারেন।'}
                  </p>
                </div>
              </div>

              {/* Image Uploader */}
              <ImageUploader
                label="প্রোডাক্ট ইমেজ (Product Image)"
                value={imageUrl}
                onChange={(url) => setImageUrl(url)}
                helperText="ডিভাইস থেকে ফাইল নির্বাচন করুন অথবা সরাসরি ইমেজ লিঙ্ক দিন"
                maxDimension={1000}
              />

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  সংক্ষিপ্ত বিবরণ (Short Description)
                </label>
                <input
                  type="text"
                  maxLength={1000}
                  placeholder="কার্ডে প্রদর্শনের জন্য এক বা দুই লাইনের বিবরণ"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  বিস্তারিত বিবরণ (Full Description)
                </label>
                <textarea
                  rows={5}
                  placeholder="পণ্য সম্পর্কে বিস্তারিত তথ্য ও বৈশিষ্ট্য..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ডিজিটাল ডাউনলোড বা এক্সেস লিঙ্ক (ঐচ্ছিক)
                  </label>
                  <input
                    type="url"
                    placeholder="https://drive.google.com/..."
                    value={downloadUrl}
                    onChange={(e) => setDownloadUrl(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    ট্যাগস (কমা দিয়ে লিখুন)
                  </label>
                  <input
                    type="text"
                    placeholder="canva, graphic, design, lifetime"
                    value={tagsInput}
                    onChange={(e) => setTagsInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Web Script / Template Live Preview Configuration Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/90 border border-indigo-500/30 space-y-3.5 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0 mt-0.5">
                      <Globe className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-xs sm:text-sm font-bold text-white">
                          Web Script / Template — Live Preview বাটন ও লিঙ্ক
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${
                            livePreviewEnabled
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
                              : 'bg-slate-800 text-slate-400 border-slate-700'
                          }`}
                        >
                          {livePreviewEnabled ? 'চালু (ON)' : 'বন্ধ (OFF)'}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        এডমিন প্যানেল থেকে Live Preview অন করে ডেমো ইউআরএল দিলে সেই প্রোডাক্টে প্রফেশনাল &quot;Live Preview&quot; বাটন শো করবে
                      </p>
                    </div>
                  </div>

                  {/* Toggle Switch */}
                  <button
                    type="button"
                    onClick={() => setLivePreviewEnabled((prev) => !prev)}
                    className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      livePreviewEnabled ? 'bg-emerald-600' : 'bg-slate-700'
                    }`}
                    role="switch"
                    aria-checked={livePreviewEnabled}
                  >
                    <span
                      className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        livePreviewEnabled ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Live Preview URL Input */}
                <div className="pt-1 space-y-2">
                  <label className="block text-xs font-semibold text-slate-300">
                    Live Preview ওয়েবসাইট URL (ডেমো বা রিভিউ লিঙ্ক) {livePreviewEnabled ? '*' : '(ঐচ্ছিক)'}
                  </label>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <div className="relative flex-1">
                      <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="https://example-demo-site.com"
                        value={livePreviewUrl}
                        onChange={(e) => {
                          const val = e.target.value;
                          setLivePreviewUrl(val);
                          if (val.trim() && !livePreviewEnabled) {
                            setLivePreviewEnabled(true);
                          }
                        }}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>

                    {livePreviewUrl.trim() && (
                      <a
                        href={normalizeExternalUrl(livePreviewUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-500/30 text-emerald-300 text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>টেস্ট প্রিভিউ</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400">
                    কাস্টমাররা &quot;Live Preview&quot; বাটনে ক্লিক করলে সরাসরি নতুন ট্যাবে এই ডেমো বা রিভিউ সাইটটি ব্রাউজ করতে পারবেন।
                  </p>
                </div>
              </div>

              {/* Status Toggles */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={available}
                    onChange={(e) => setAvailable(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>স্টকে সক্রিয় আছে (Available)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={featured}
                    onChange={(e) => setFeatured(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>হোমপেজে ফিচার্ড করুন (Featured)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-200">
                  <input
                    type="checkbox"
                    checked={newArrival}
                    onChange={(e) => setNewArrival(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                  />
                  <span>নতুন সংযোজন (New Arrival)</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'সংরক্ষণ হচ্ছে...' : editingProduct ? 'আপডেট করুন' : 'তৈরি করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
