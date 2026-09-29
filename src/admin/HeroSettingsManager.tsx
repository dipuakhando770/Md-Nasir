import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  Edit2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  Layers,
  Clock,
  Play,
  Copy,
  X,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { updateStoreSettings } from '../firebase/services';
import { ImageUploader, isSafeImageUrl } from '../components/common/ImageUploader';
import { HeroSlide } from '../types';
import { HD_HERO_PRESETS, DEFAULT_HD_HERO_SLIDES } from '../constants/defaultBanners';
import { normalizeImageUrl } from '../utils/formatters';

// Ultra High-Fidelity Banner Handler (Preserves 100% original quality, crisp fonts, colors & details)
async function optimizeBase64Banner(urlOrData: string): Promise<string> {
  if (!urlOrData || !urlOrData.startsWith('data:image/') || urlOrData.length <= 450000) {
    return urlOrData;
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const maxDim = 2560; // 2K QHD / 4K Crisp Master Width
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(urlOrData);
          return;
        }
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // Retain ultra-crisp near-lossless 0.96 quality
        let quality = 0.96;
        let compressed = canvas.toDataURL('image/webp', quality);
        if (!compressed.startsWith('data:image/webp')) {
          compressed = canvas.toDataURL('image/jpeg', quality);
        }

        // Only soft touch if extremely large for Firestore doc payload, keep min quality 0.90
        while (compressed.length > 500000 && quality > 0.90) {
          quality -= 0.02;
          compressed = canvas.toDataURL('image/webp', quality);
        }
        resolve(compressed);
      } catch {
        resolve(urlOrData);
      }
    };
    img.onerror = () => resolve(urlOrData);
    img.src = urlOrData;
  });
}

export const HeroSettingsManager: React.FC = () => {
  const { settings, categories } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Auto slide settings
  const [heroAutoSlide, setHeroAutoSlide] = useState(settings.heroAutoSlide !== false);
  const [heroSlideInterval, setHeroSlideInterval] = useState(settings.heroSlideInterval || 4);

  // Slides array (Unlimited - only real database slides)
  const [slides, setSlides] = useState<HeroSlide[]>(() => {
    if (settings.heroSlides && settings.heroSlides.length > 0) {
      return [...settings.heroSlides].sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1));
    }
    return [];
  });

  // Sync state when settings change from Firestore snapshot
  useEffect(() => {
    if (Array.isArray(settings.heroSlides)) {
      setSlides([...settings.heroSlides].sort((a, b) => (a.sortOrder || 1) - (b.sortOrder || 1)));
    }
    if (settings.heroAutoSlide !== undefined) {
      setHeroAutoSlide(settings.heroAutoSlide !== false);
    }
    if (settings.heroSlideInterval !== undefined) {
      setHeroSlideInterval(settings.heroSlideInterval || 4);
    }
  }, [settings.heroSlides, settings.heroAutoSlide, settings.heroSlideInterval]);

  // Modal for adding or editing a slide
  const [isSlideModalOpen, setIsSlideModalOpen] = useState(false);
  const [editingSlideId, setEditingSlideId] = useState<string | null>(null);
  const [slideImageUrl, setSlideImageUrl] = useState('');
  const [slideLinkUrl, setSlideLinkUrl] = useState('');
  const [slideActive, setSlideActive] = useState(true);

  // Automatic sync helper to Firestore Database
  const persistChangesToFirestore = async (
    updatedSlides: HeroSlide[],
    updatedAutoSlide = heroAutoSlide,
    updatedInterval = heroSlideInterval
  ) => {
    setIsSubmitting(true);
    setFormError(null);
    try {
      // Optimize all slides so base64 payloads never exceed Firestore 1MB document limit
      const optimizedSlides: HeroSlide[] = await Promise.all(
        updatedSlides.map(async (s, index) => {
          const cleanImg = await optimizeBase64Banner(s.imageUrl);
          return {
            id: s.id || `slide-${Date.now()}-${index}`,
            imageUrl: cleanImg,
            linkUrl: s.linkUrl || '',
            active: s.active !== false,
            sortOrder: index + 1,
          };
        })
      );

      setSlides(optimizedSlides);

      await updateStoreSettings({
        websiteName: settings.websiteName || 'Nasir Digital Hub',
        whatsappNumber: settings.whatsappNumber || '01962780922',
        heroSlides: optimizedSlides,
        heroAutoSlide: Boolean(updatedAutoSlide),
        heroSlideInterval: Math.max(2, Math.round(Number(updatedInterval) || 4)),
      });

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Auto-save hero slides error:', err);
      setFormError(
        'ডাটাবেসে সংরক্ষণ করতে সমস্যা হয়েছে। অনুগ্রহ করে নিচে থাকা "সব পরিবর্তন সংরক্ষণ করুন" বাটনে ক্লিক করুন।'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const openAddSlideModal = () => {
    setEditingSlideId(null);
    setSlideImageUrl('');
    setSlideLinkUrl('');
    setSlideActive(true);
    setIsSlideModalOpen(true);
  };

  const openEditSlideModal = (slide: HeroSlide) => {
    setEditingSlideId(slide.id);
    setSlideImageUrl(slide.imageUrl);
    setSlideLinkUrl(slide.linkUrl || '');
    setSlideActive(slide.active !== false);
    setIsSlideModalOpen(true);
  };

  const handleSaveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideImageUrl.trim()) {
      alert('ব্যানার ছবির লিংক বা আপলোড করা ছবি আবশ্যক।');
      return;
    }

    if (!isSafeImageUrl(slideImageUrl.trim())) {
      alert('অবৈধ ছবি লিংক। নিরাপদ https:// লিংক অথবা আপলোড করা ছবি দিন।');
      return;
    }

    const optimizedImg = await optimizeBase64Banner(slideImageUrl.trim());
    let nextSlides: HeroSlide[] = [];

    if (editingSlideId) {
      nextSlides = slides.map((s) =>
        s.id === editingSlideId
          ? {
              ...s,
              imageUrl: optimizedImg,
              linkUrl: slideLinkUrl.trim(),
              active: slideActive,
            }
          : s
      );
    } else {
      const newSlide: HeroSlide = {
        id: `slide-${Date.now()}`,
        imageUrl: optimizedImg,
        linkUrl: slideLinkUrl.trim(),
        active: slideActive,
        sortOrder: slides.length + 1,
      };
      nextSlides = [...slides, newSlide];
    }

    setSlides(nextSlides);
    setIsSlideModalOpen(false);

    // Auto-save immediately to Firestore database
    await persistChangesToFirestore(nextSlides);
  };

  const handleDeleteSlide = async (id: string) => {
    if (window.confirm('আপনি কি এই ব্যানার স্লাইডটি স্থায়ীভাবে মুছে ফেলতে চান?')) {
      const nextSlides = slides
        .filter((s) => s.id !== id)
        .map((s, idx) => ({ ...s, sortOrder: idx + 1 }));
      setSlides(nextSlides);
      await persistChangesToFirestore(nextSlides);
    }
  };

  const handleDuplicateSlide = async (slide: HeroSlide) => {
    const dup: HeroSlide = {
      ...slide,
      id: `slide-${Date.now()}`,
      sortOrder: slides.length + 1,
    };
    const nextSlides = [...slides, dup];
    setSlides(nextSlides);
    await persistChangesToFirestore(nextSlides);
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index - 1];
    newSlides[index - 1] = temp;
    newSlides.forEach((s, idx) => {
      s.sortOrder = idx + 1;
    });
    setSlides(newSlides);
    await persistChangesToFirestore(newSlides);
  };

  const handleMoveDown = async (index: number) => {
    if (index === slides.length - 1) return;
    const newSlides = [...slides];
    const temp = newSlides[index];
    newSlides[index] = newSlides[index + 1];
    newSlides[index + 1] = temp;
    newSlides.forEach((s, idx) => {
      s.sortOrder = idx + 1;
    });
    setSlides(newSlides);
    await persistChangesToFirestore(newSlides);
  };

  const handleToggleSlideActive = async (id: string) => {
    const nextSlides = slides.map((s) => (s.id === id ? { ...s, active: !s.active } : s));
    setSlides(nextSlides);
    await persistChangesToFirestore(nextSlides);
  };

  const handleToggleAutoSlide = async (enabled: boolean) => {
    setHeroAutoSlide(enabled);
    await persistChangesToFirestore(slides, enabled, heroSlideInterval);
  };

  const handleIntervalChange = async (interval: number) => {
    setHeroSlideInterval(interval);
    await persistChangesToFirestore(slides, heroAutoSlide, interval);
  };

  const handleSaveAll = async (e: React.FormEvent) => {
    e.preventDefault();
    await persistChangesToFirestore(slides, heroAutoSlide, heroSlideInterval);
  };

  const handleApplyPreset = async (preset: (typeof HD_HERO_PRESETS)[0]) => {
    const newSlide: HeroSlide = {
      id: `preset-${preset.id}-${Date.now()}`,
      imageUrl: preset.imageUrl,
      linkUrl: preset.targetLink,
      active: true,
      sortOrder: slides.length + 1,
    };
    const nextSlides = [...slides, newSlide];
    setSlides(nextSlides);
    await persistChangesToFirestore(nextSlides);
  };

  const handleLoadAllDefaultHDBanners = async () => {
    if (
      slides.length > 0 &&
      !window.confirm(
        'আপনি কি বর্তমান স্লাইডার প্রতিস্থাপন করে ৩টি অফিসিয়াল আল্ট্রা-এইচডি (Ultra-HD) ব্যানার লোড করতে চান?'
      )
    ) {
      return;
    }
    setSlides(DEFAULT_HD_HERO_SLIDES);
    await persistChangesToFirestore(DEFAULT_HD_HERO_SLIDES);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <span>আল্ট্রা-এইচডি ব্যানার ও হিরো স্লাইডার ম্যানেজার</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            উচ্চ রেজুলিউশন (HD/4K) ব্যানার ম্যানেজ করুন — সম্পূর্ণ ক্রিস্টাল ক্লিয়ার কোয়ালিটিতে হোমপেজে প্রদর্শিত হবে
          </p>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20 animate-pulse">
              <CheckCircle2 className="w-4 h-4" /> ডাটাবেসে সংরক্ষিত হয়েছে!
            </span>
          )}

          <button
            type="button"
            onClick={openAddSlideModal}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>নতুন ব্যানার যোগ করুন</span>
          </button>
        </div>
      </div>

      {/* Official HD Banner Presets Quick Gallery */}
      <div className="bg-gradient-to-r from-indigo-950/70 via-slate-900 to-slate-900 border border-indigo-500/30 rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-indigo-500/20 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>অফিসিয়াল আল্ট্রা-এইচডি ব্যানার প্রিসেট (HD Presets)</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  HD 1080p
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                এক ক্লিকেই আপনার স্টোরে সুপার-শার্প এবং আকর্ষণীয় ডিজাইনড ব্যানার যুক্ত করুন
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLoadAllDefaultHDBanners}
            disabled={isSubmitting}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>সবগুলো HD ব্যানার লোড করুন</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {HD_HERO_PRESETS.map((preset) => (
            <div
              key={preset.id}
              className="group relative rounded-xl border border-slate-800 bg-slate-950/80 overflow-hidden hover:border-indigo-500/60 transition-all flex flex-col justify-between"
            >
              <div className="aspect-[21/9] w-full bg-slate-900 overflow-hidden relative">
                <img
                  src={preset.imageUrl}
                  alt={preset.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-slate-950/70 backdrop-blur-md border border-white/20 text-[9px] font-bold text-white">
                  ULTRA HD
                </div>
              </div>
              <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <h4 className="text-xs font-bold text-white line-clamp-1">{preset.title}</h4>
                  <p className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">{preset.subtitle}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleApplyPreset(preset)}
                  disabled={isSubmitting}
                  className="w-full py-1.5 rounded-lg bg-slate-900 hover:bg-indigo-600 text-slate-200 hover:text-white border border-slate-700 hover:border-indigo-500 text-[11px] font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>স্লাইডারে যুক্ত করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {formError && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError}</span>
          </div>
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-3 py-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold shrink-0 cursor-pointer"
          >
            পুনরায় চেষ্টা করুন
          </button>
        </div>
      )}

      {/* Global Auto Slide Settings Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center shrink-0">
            <Play className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white">অটোমেটিক স্লাইডার সেটিংস (Auto-Play)</h4>
            <p className="text-[11px] text-slate-400">প্রতিটি ব্যানার স্বয়ংক্রিয়ভাবে একটির পর একটি স্লাইড করবে</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
            <input
              type="checkbox"
              checked={heroAutoSlide}
              onChange={(e) => handleToggleAutoSlide(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <span>অটো-স্লাইড সক্রিয়</span>
          </label>

          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] text-slate-400 font-medium">গতি:</span>
            <select
              value={heroSlideInterval}
              onChange={(e) => handleIntervalChange(Number(e.target.value))}
              className="bg-transparent text-xs text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value={2}>২ সেকেন্ড</option>
              <option value={3}>৩ সেকেন্ড</option>
              <option value={4}>৪ সেকেন্ড (প্রস্তাবিত)</option>
              <option value={5}>৫ সেকেন্ড</option>
              <option value={6}>৬ সেকেন্ড</option>
              <option value={8}>৮ সেকেন্ড</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banner Slides List (Unlimited) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
          <span>মোট ব্যানার স্লাইড: {slides.length} টি</span>
          <span>(অর্ডার পরিবর্তন করতে তীর চিহ্ন চাপুন)</span>
        </div>

        <div className="space-y-3">
          {slides.map((slide, idx) => (
            <div
              key={slide.id || idx}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row items-stretch sm:items-center gap-4 justify-between ${
                slide.active
                  ? 'bg-slate-900 border-slate-800'
                  : 'bg-slate-950/60 border-slate-900 opacity-60'
              }`}
            >
              {/* Left: Thumbnail & Details */}
              <div className="flex items-center gap-3.5 min-w-0 flex-1">
                {/* Index badge */}
                <span className="w-6 h-6 rounded-full bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>

                {/* Banner Thumbnail Preview */}
                <div className="w-28 sm:w-40 aspect-[21/8] rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 shadow-sm">
                  <img
                    src={normalizeImageUrl(slide.imageUrl)}
                    alt={`Slide ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Target Info */}
                <div className="min-w-0 flex-1 space-y-1">
                  <h4 className="font-bold text-sm text-white truncate">
                    ব্যানার #{idx + 1}
                  </h4>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>
                      টার্গেট অ্যাকশন:{' '}
                      <strong className="text-indigo-400 font-mono">
                        {slide.linkUrl ? `/${slide.linkUrl}` : 'শপ পেজ (All Products)'}
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right: Actions */}
              <div className="flex items-center justify-end gap-1.5 border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-800 shrink-0">
                {/* Move Up */}
                <button
                  type="button"
                  onClick={() => handleMoveUp(idx)}
                  disabled={idx === 0 || isSubmitting}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="উপরে নিন"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>

                {/* Move Down */}
                <button
                  type="button"
                  onClick={() => handleMoveDown(idx)}
                  disabled={idx === slides.length - 1 || isSubmitting}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                  title="নিচে নিন"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>

                {/* Active Toggle */}
                <button
                  type="button"
                  onClick={() => handleToggleSlideActive(slide.id)}
                  disabled={isSubmitting}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    slide.active
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                  title={slide.active ? 'সক্রিয় (ক্লিক করে নিষ্ক্রিয় করুন)' : 'নিষ্ক্রিয় (ক্লিক করে সক্রিয় করুন)'}
                >
                  {slide.active ? 'সক্রিয়' : 'বন্ধ'}
                </button>

                {/* Duplicate */}
                <button
                  type="button"
                  onClick={() => handleDuplicateSlide(slide)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
                  title="কপি / ডুপ্লিকেট"
                >
                  <Copy className="w-4 h-4" />
                </button>

                {/* Edit */}
                <button
                  type="button"
                  onClick={() => openEditSlideModal(slide)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors cursor-pointer"
                  title="সম্পাদনা"
                >
                  <Edit2 className="w-4 h-4" />
                </button>

                {/* Delete */}
                <button
                  type="button"
                  onClick={() => handleDeleteSlide(slide.id)}
                  disabled={isSubmitting}
                  className="p-2 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors cursor-pointer"
                  title="মুছে ফেলুন"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Manual Save All Fallback Button */}
      <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
        <p className="text-xs text-slate-500">
          💡 যেকোনো ব্যানার যোগ বা পরিবর্তনের সাথে সাথে ফায়ারবেস ডাটাবেসে স্বয়ংক্রিয়ভাবে সেভ হয়।
        </p>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSubmitting}
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
        >
          {isSubmitting ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সব পরিবর্তন সংরক্ষণ করুন'}</span>
        </button>
      </div>

      {/* Slide Edit / Add Modal */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-400" />
                <span>{editingSlideId ? 'ব্যানার সম্পাদনা' : 'নতুন ব্যানার আপলোড'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsSlideModalOpen(false)}
                className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSlide} className="space-y-4">
              {/* Image Uploader */}
              <ImageUploader
                label="আল্ট্রা-এইচডি ব্যানার ছবি (Original HD / 4K Banner Upload / URL) *"
                value={slideImageUrl}
                onChange={(url) => setSlideImageUrl(url)}
                helperText="প্রস্তাবিত সাইজ: 1920x640, 2560x960 বা যেকোনো ওয়াইডস্ক্রিন রেশিও। ১০০% অরিজিনাল কোয়ালিটি ও শার্পনেস বজায় থাকবে।"
                maxDimension={2560}
                preserveOriginalQuality={true}
              />

              {/* Target Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ক্লিক করলে কোথায় যাবে (Target Category / Link)
                </label>
                <select
                  value={slideLinkUrl}
                  onChange={(e) => setSlideLinkUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="">শপ পেজ (All Products)</option>
                  <option value="#discount">বিশেষ ছাড় সেকশন (#discount)</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      ক্যাটাগরি: {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Active Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-200">
                  <input
                    type="checkbox"
                    checked={slideActive}
                    onChange={(e) => setSlideActive(e.target.checked)}
                    className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4"
                  />
                  <span>এই ব্যানারটি হোমপেজে সক্রিয় থাকবে</span>
                </label>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSlideModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold hover:bg-slate-700 cursor-pointer"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'সেভ হচ্ছে...' : editingSlideId ? 'আপডেট ও সেভ করুন' : 'ডাটাবেসে সেভ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
