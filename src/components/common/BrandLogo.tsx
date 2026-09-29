import React from 'react';
import { useStore } from '../../context/StoreContext';
import { normalizeImageUrl } from '../../utils/formatters';

interface BrandLogoProps {
  variant?: 'header' | 'footer' | 'loader' | 'admin';
  className?: string;
}

/**
 * Renders the Website Logo in the exact screenshot reference style while keeping
 * the semantic site title & SEO description hidden visually (sr-only) in the browser
 * for Google search indexing and social link sharing.
 */
export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  className = '',
}) => {
  const { settings } = useStore();

  const siteName = settings.websiteName || 'Nasir Digital Hub';
  const seoTitle =
    settings.metaTitle || `${siteName} — প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস`;
  const seoDescription =
    settings.metaDescription ||
    settings.description ||
    'বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, ডিজাইন ও ভিডিও টেমপ্লেট এবং অনলাইন টুলস এর বিশ্বস্ত প্রতিষ্ঠান।';

  // Default is true: hide visible browser text title so only the clean logo system shows,
  // while keeping semantic text in DOM for Google SEO & link previews.
  const hideVisibleTitle = settings.hideHeaderTitle !== false;

  const sizeClasses = {
    header: 'h-10 sm:h-11 w-auto max-w-[190px] sm:max-w-[230px]',
    footer: 'h-10 sm:h-11 w-auto max-w-[190px] sm:max-w-[230px]',
    loader: 'h-20 sm:h-24 w-auto max-w-[240px] sm:max-w-[280px]',
    admin: 'h-10 w-auto max-w-[180px]',
  }[variant];

  const isDarkBg = variant === 'footer' || variant === 'loader' || variant === 'admin';

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Hidden Semantic SEO Title & Description for Google Bot & Link Scrapers */}
      <span className="sr-only">{seoTitle}</span>
      <span className="sr-only">{seoDescription}</span>

      {settings.logoUrl ? (
        <img
          src={normalizeImageUrl(settings.logoUrl)}
          alt={siteName}
          className={`${sizeClasses} object-contain transition-transform duration-300 group-hover:scale-[1.02]`}
        />
      ) : (
        /* Screenshot Reference Style Vector Logo System */
        <div className="inline-flex items-center gap-2.5">
          {/* 3D Geometric Tech Emblem (Screenshot Reference Style) */}
          <div
            className={`relative flex items-center justify-center shrink-0 ${
              variant === 'loader' ? 'w-16 h-16 sm:w-20 sm:h-20' : 'w-10 h-10 sm:w-11 sm:h-11'
            }`}
          >
            <svg
              viewBox="0 0 64 64"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full drop-shadow-sm"
              aria-hidden="true"
            >
              <defs>
                <linearGradient id="logoBlueGrad" x1="8" y1="8" x2="36" y2="56" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="50%" stopColor="#2563eb" />
                  <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="logoEmeraldGrad" x1="26" y1="8" x2="58" y2="42" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="50%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
                <linearGradient id="logoAccentGrad" x1="20" y1="32" x2="56" y2="58" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f59e0b" />
                  <stop offset="50%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#6366f1" />
                </linearGradient>
              </defs>

              {/* Outer Subtle Hexagon Tech Shield */}
              <path
                d="M32 4L56 17.5V46.5L32 60L8 46.5V17.5L32 4Z"
                fill={isDarkBg ? '#0f172a' : '#f8fafc'}
                stroke={isDarkBg ? '#1e293b' : '#e2e8f0'}
                strokeWidth="2"
              />

              {/* Left 3D Geometric Pillar */}
              <path
                d="M16 20C16 17.7909 17.7909 16 20 16H25C27.2091 16 29 17.7909 29 20V45C29 47.2091 27.2091 49 25 49H20C17.7909 49 16 47.2091 16 45V20Z"
                fill="url(#logoBlueGrad)"
              />

              {/* Top Right Dynamic Loop / Tech Wing */}
              <path
                d="M25 16H38C44.6274 16 50 21.3726 50 28C50 34.6274 44.6274 40 38 40H26V31H37C39.2091 31 41 29.2091 41 27C41 24.7909 39.2091 23 37 23H25V16Z"
                fill="url(#logoEmeraldGrad)"
              />

              {/* Bottom Right Forward Arrow / Digital Leg */}
              <path
                d="M31 35L41 35L49 46.5C50.3 48.3 49 50.8 46.8 50.8H39.5C38.2 50.8 37 50.1 36.3 49L28 36.5L31 35Z"
                fill="url(#logoAccentGrad)"
              />

              {/* Center Glowing Node */}
              <circle cx="22.5" cy="22.5" r="2.5" fill="#ffffff" />
            </svg>
          </div>

          {/* Graphic Brand Mark (Matches Screenshot Reference lockup) */}
          {variant !== 'loader' && (
            <div className="flex flex-col justify-center text-left leading-none">
              <span
                className={`font-black tracking-tight ${
                  variant === 'header'
                    ? 'text-lg sm:text-xl text-slate-900 group-hover:text-emerald-600'
                    : 'text-lg sm:text-xl text-white'
                } transition-colors`}
              >
                {hideVisibleTitle
                  ? siteName.split(' ')[0] || 'Nasir'
                  : siteName}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase mt-0.5 ${
                  isDarkBg ? 'text-emerald-400' : 'text-emerald-600'
                }`}
              >
                {settings.tagline || 'Digital Products Service'}
              </span>
            </div>
          )}
        </div>
      )}

      {/* If user uploaded a custom logo AND explicitly turned OFF hideHeaderTitle in settings */}
      {settings.logoUrl && !hideVisibleTitle && variant !== 'loader' && (
        <div className="flex flex-col justify-center text-left leading-none">
          <span
            className={`text-lg sm:text-xl font-black tracking-tight ${
              isDarkBg ? 'text-white' : 'text-slate-900'
            }`}
          >
            {siteName}
          </span>
          {settings.tagline && (
            <span
              className={`text-[10px] font-bold uppercase tracking-wider mt-0.5 ${
                isDarkBg ? 'text-emerald-400' : 'text-emerald-600'
              }`}
            >
              {settings.tagline}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
