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
        /* Official Circular Cyber Brand Logo System */
        <div className="inline-flex items-center gap-2.5">
          <img
            src="/logo.svg"
            alt={siteName}
            className={`${
              variant === 'loader'
                ? 'h-20 sm:h-24 w-auto drop-shadow-lg'
                : 'h-10 sm:h-11 w-auto drop-shadow-md'
            } object-contain transition-transform duration-300 group-hover:scale-[1.05]`}
          />
          {variant !== 'loader' && !hideVisibleTitle && (
            <div className="flex flex-col justify-center text-left leading-none">
              <span
                className={`font-black tracking-tight ${
                  variant === 'header'
                    ? 'text-lg sm:text-xl text-slate-900 group-hover:text-cyan-600'
                    : 'text-lg sm:text-xl text-white'
                } transition-colors`}
              >
                {siteName}
              </span>
              <span
                className={`text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase mt-0.5 ${
                  isDarkBg ? 'text-cyan-400' : 'text-cyan-600'
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
