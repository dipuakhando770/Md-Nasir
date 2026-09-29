import React, { useRef, useState } from 'react';
import { Upload, Image as ImageIcon, X, Link, Check, AlertCircle, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';
import { formatGoogleDriveImageUrl, normalizeImageUrl } from '../../utils/formatters';

interface ImageUploaderProps {
  label?: string;
  value: string;
  onChange: (urlOrBase64: string) => void;
  helperText?: string;
  maxDimension?: number; // max width/height in px for compression
  preserveOriginalQuality?: boolean;
}

const ALLOWED_IMAGE_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export function isSafeImageUrl(url: string): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (trimmed === '') return true;
  
  // Safe HTTP/HTTPS image URL
  if (/^https?:\/\/.+/i.test(trimmed)) {
    // Disallow javascript or data protocol injection
    return !/^(javascript|data|vbscript):/i.test(trimmed);
  }

  // Safe data image URI (only jpeg, jpg, png, webp)
  if (/^data:image\/(jpeg|jpg|png|webp);base64,[a-zA-Z0-9+/=]+$/i.test(trimmed)) {
    return true;
  }

  return false;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label = 'ছবি আপলোড করুন (Image Upload)',
  value,
  onChange,
  helperText = 'ডিভাইস থেকে ছবি আপলোড করুন অথবা গুগল ড্রাইভ / ইমেজ URL পেস্ট করুন',
  maxDimension = 2560,
  preserveOriginalQuality = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [mode, setMode] = useState<'upload' | 'url'>('upload');
  const [urlInput, setUrlInput] = useState(value && value.startsWith('http') ? value : '');
  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const [imgLoadError, setImgLoadError] = useState(false);

  // Process image file maintaining crystal clear original fidelity
  const processImageFile = (file: File) => {
    // 1. MIME Type Validation
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type.toLowerCase())) {
      setError('শুধুমাত্র JPG, PNG বা WebP ছবি অনুমোদিত (SVG বা অন্যান্য ফাইল সমর্থিত নয়)।');
      return;
    }

    // 2. File Size Validation
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('ছবির আকার সর্বোচ্চ ১০ মেগাবাইট (10MB) হতে পারে।');
      return;
    }

    setError(null);
    setInfoMessage(null);
    setIsCompressing(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      const originalDataUrl = e.target?.result as string;

      // If preserveOriginalQuality is true and file size is <= 450KB, use original directly without touching pixels
      if (preserveOriginalQuality && file.size <= 450 * 1024) {
        onChange(originalDataUrl);
        setIsCompressing(false);
        return;
      }

      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const targetMax = Math.max(maxDimension, 2560); // Keep full Ultra-HD / 2K sharpness

          // Only downscale if larger than 2560px
          if (width > targetMax || height > targetMax) {
            if (width > height) {
              height = Math.round((height * targetMax) / width);
              width = targetMax;
            } else {
              width = Math.round((width * targetMax) / height);
              height = targetMax;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, width, height);
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            const isTransparentFormat =
              file.type === 'image/png' || file.type === 'image/webp';
            
            // Ultra high quality encoding to prevent any noticeable loss or blur
            let quality = preserveOriginalQuality ? 0.96 : 0.92;
            let mimeOut = isTransparentFormat ? 'image/webp' : 'image/jpeg';
            let optimizedBase64 = canvas.toDataURL(mimeOut, quality);

            // Fallback for browsers that don't support webp export
            if (isTransparentFormat && !optimizedBase64.startsWith('data:image/webp')) {
              const pngData = canvas.toDataURL('image/png');
              if (pngData.length <= 400000) {
                optimizedBase64 = pngData;
              } else {
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = width;
                tempCanvas.height = height;
                const tCtx = tempCanvas.getContext('2d');
                if (tCtx) {
                  tCtx.fillStyle = '#ffffff';
                  tCtx.fillRect(0, 0, width, height);
                  tCtx.drawImage(canvas, 0, 0);
                  optimizedBase64 = tempCanvas.toDataURL('image/jpeg', 0.94);
                }
              }
            } else {
              // Only gently adjust if huge (> 400KB), never drop below 0.88 high quality
              while (optimizedBase64.length > 400000 && quality > 0.88) {
                quality -= 0.03;
                optimizedBase64 = canvas.toDataURL(mimeOut, quality);
              }
            }
            onChange(optimizedBase64);
          } else {
            onChange(originalDataUrl);
          }
        } catch {
          // Fallback to original data URL if canvas fails
          onChange(originalDataUrl);
        } finally {
          setIsCompressing(false);
        }
      };
      img.onerror = () => {
        setError('ছবি লোড করতে ব্যর্থ হয়েছে। ফাইলটি ত্রুটিপূর্ণ হতে পারে।');
        setIsCompressing(false);
      };
      img.src = originalDataUrl;
    };
    reader.onerror = () => {
      setError('ফাইল রিড করতে ব্যর্থ হয়েছে।');
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleUrlApply = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) {
      setError('অনুগ্রহ করে সঠিক ইমেজ URL বা গুগল ড্রাইভ লিঙ্ক দিন।');
      return;
    }

    if (!isSafeImageUrl(trimmed)) {
      setError('অবৈধ অথবা অনিরাপদ URL স্কিম। শুধুমাত্র https:// বা http:// লিঙ্ক দিন।');
      return;
    }

    // Automatically convert Google Drive / Dropbox share URLs into direct embed URLs
    const directUrl = formatGoogleDriveImageUrl(trimmed);
    const isDrive = /drive\.google\.com|docs\.google\.com|googleusercontent\.com/i.test(trimmed);

    onChange(directUrl);
    setUrlInput(directUrl);
    setError(null);
    setImgLoadError(false);

    if (isDrive) {
      setInfoMessage('Google Drive লিঙ্ক সফলভাবে কনভার্ট হয়েছে! (ড্রাইভ ফাইলের পারমিশন "Anyone with the link" থাকতে হবে)');
    } else {
      setInfoMessage(null);
    }
  };

  const handleRemove = () => {
    onChange('');
    setUrlInput('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setError(null);
    setInfoMessage(null);
    setImgLoadError(false);
  };

  const displayImageUrl = normalizeImageUrl(value);
  const isGoogleDriveImage = Boolean(
    value && /googleusercontent\.com|drive\.google\.com/i.test(value)
  );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
        {/* Toggle Mode */}
        <div className="flex items-center bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[10px]">
          <button
            type="button"
            onClick={() => {
              setMode('upload');
              setError(null);
            }}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
              mode === 'upload' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            ফাইল আপলোড
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('url');
              setError(null);
            }}
            className={`px-2 py-0.5 rounded-md font-semibold transition-colors cursor-pointer ${
              mode === 'url' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            গুগল ড্রাইভ / URL
          </button>
        </div>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1.5 animate-fadeIn">
          <Check className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* Image Preview or Dropzone */}
      {value ? (
        <div className="relative rounded-2xl bg-slate-950 border border-slate-800 p-2.5 flex items-center gap-3 group">
          <div className="w-16 h-16 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
            {imgLoadError ? (
              <div className="p-1 text-center text-[10px] text-amber-400 flex flex-col items-center">
                <AlertCircle className="w-4 h-4 text-amber-400 mb-0.5" />
                <span>লোড হয়নি</span>
              </div>
            ) : (
              <img
                src={displayImageUrl}
                alt="preview"
                crossOrigin="anonymous"
                onError={() => {
                  setImgLoadError(true);
                  if (isGoogleDriveImage) {
                    setError('গুগল ড্রাইভ ছবিটি লোড করা যায়নি। অনুগ্রহ করে গুগল ড্রাইভে গিয়ে ফাইলের Share সেটিং "Anyone with the link can view" দিন।');
                  } else {
                    setError('ছবি প্রিভিউ প্রদর্শন করতে ব্যর্থ হয়েছে। লিঙ্কটি সঠিক কিনা যাচাই করুন।');
                  }
                }}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" />
              <span>
                {isGoogleDriveImage ? 'গুগল ড্রাইভ ইমেজ সংযুক্ত হয়েছে' : 'ছবি সংযুক্ত হয়েছে'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">
              {value.startsWith('data:') ? 'ডিভাইস থেকে অপ্টিমাইজড' : value}
            </p>
            {isGoogleDriveImage && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">
                <Sparkles className="w-3 h-3" />
                Google Drive Direct CDN
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-800 transition-colors cursor-pointer"
            title="ছবি মুছুন"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : mode === 'upload' ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragOver
              ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
              : 'border-slate-800 hover:border-slate-700 bg-slate-950/60'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex flex-col items-center justify-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400">
              {isCompressing ? (
                <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
              ) : (
                <Upload className="w-5 h-5 text-indigo-400" />
              )}
            </div>
            <div>
              <p className="text-xs font-bold text-white">
                {isCompressing ? 'ছবি অপ্টিমাইজ হচ্ছে...' : 'ছবি ড্রপ করুন অথবা ক্লিক করে নির্বাচন করুন'}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">{helperText} (JPG, PNG, WebP — Max 10MB)</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Link className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="url"
                placeholder="Google Drive লিংক পেস্ট করুন (যেমন: https://drive.google.com/file/d/...)"
                value={urlInput}
                onChange={(e) => {
                  setUrlInput(e.target.value);
                  setError(null);
                  setInfoMessage(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleUrlApply();
                  }
                }}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <button
              type="button"
              onClick={handleUrlApply}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              যোগ করুন
            </button>
          </div>

          {/* Google Drive User Help Card */}
          <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 text-slate-400 text-[11px] space-y-1">
            <p className="font-semibold text-indigo-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>গুগল ড্রাইভ (Google Drive) থেকে ছবি ব্যবহারের সহজ নিয়ম:</span>
            </p>
            <ol className="list-decimal list-inside space-y-0.5 text-slate-400 text-[10.5px]">
              <li>গুগল ড্রাইভে ছবিটি আপলোড করুন।</li>
              <li>ছবির উপর রাইট ক্লিক করে <strong>Share &gt; Share</strong> এ যান।</li>
              <li>General access এ <strong>&quot;Anyone with the link&quot;</strong> (যেকোনো ব্যক্তি যার লিঙ্ক আছে) নির্বাচন করে <strong>Copy link</strong> করুন।</li>
              <li>কপি করা লিঙ্কটি উপরের বক্সে পেস্ট করে <strong>&quot;যোগ করুন&quot;</strong> বাটনে চাপুন — এটি স্বয়ংক্রিয়ভাবে সরাসরি ফুল কোয়ালিটিতে লোড হবে!</li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};

