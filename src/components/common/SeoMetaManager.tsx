import React, { useEffect } from 'react';
import { useStore } from '../../context/StoreContext';
import { Product } from '../../types';
import { getProductFullUrl } from '../../utils/slugify';

interface SeoMetaManagerProps {
  currentView: 'home' | 'shop' | 'admin' | 'product';
  activeProduct?: Product | null;
}

function upsertMetaTag(
  attrName: 'name' | 'property',
  attrValue: string,
  content: string
) {
  if (typeof document === 'undefined') return;
  let el = document.head.querySelector(
    `meta[${attrName}="${attrValue}"]`
  ) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

function upsertLinkTag(rel: string, href: string) {
  if (typeof document === 'undefined' || !href) return;
  let el = document.head.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

export const SeoMetaManager: React.FC<SeoMetaManagerProps> = ({
  currentView,
  activeProduct,
}) => {
  const { settings, products } = useStore();

  useEffect(() => {
    const siteName = settings.websiteName || 'Nasir Digital Hub';
    const baseMetaTitle =
      settings.metaTitle ||
      `${siteName} — ${settings.tagline || 'প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস'}`;
    const baseMetaDesc =
      settings.metaDescription ||
      settings.description ||
      'বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, প্রিমিয়াম সাবস্ক্রিপশন, ডিজাইন টেমপ্লেট ও অনলাইন টুলস শপ।';
    const baseKeywords =
      settings.metaKeywords ||
      'Nasir Digital Hub, ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, প্রিমিয়াম সাবস্ক্রিপশন, Canva Pro, Digital Products BD';

    // Determine page-specific title & description
    let finalTitle = baseMetaTitle;
    let finalDescription = baseMetaDesc;
    let finalImage =
      settings.ogImageUrl ||
      settings.logoUrl ||
      (settings.heroSlides && settings.heroSlides[0]?.imageUrl) ||
      '';

    if (currentView === 'product' && activeProduct) {
      finalTitle = `${activeProduct.title} — ৳${activeProduct.price} | ${siteName}`;
      finalDescription =
        activeProduct.shortDescription ||
        activeProduct.description?.slice(0, 160) ||
        baseMetaDesc;
      if (activeProduct.imageUrl) {
        finalImage = activeProduct.imageUrl;
      }
    } else if (currentView === 'shop') {
      finalTitle = `সকল ডিজিটাল প্রোডাক্ট ও সফটওয়্যার — ${siteName}`;
    } else if (currentView === 'admin') {
      finalTitle = `অ্যাডমিন প্যানেল — ${siteName}`;
    }

    // 1. Browser Title & Basic SEO Meta Tags
    document.title = finalTitle;
    upsertMetaTag('name', 'description', finalDescription);
    upsertMetaTag('name', 'keywords', baseKeywords);
    upsertMetaTag('name', 'author', siteName);
    upsertMetaTag('name', 'application-name', siteName);
    upsertMetaTag(
      'name',
      'robots',
      currentView === 'admin'
        ? 'noindex, nofollow'
        : 'index, follow, max-image-preview:large, max-snippet:-1'
    );

    // 2. OpenGraph Tags for Social Link Sharing (WhatsApp, Facebook, Messenger, Telegram, LinkedIn)
    const baseOrigin =
      typeof window !== 'undefined'
        ? window.location.origin
        : 'https://www.nasirdigitalhub.com';

    const canonicalUrl =
      currentView === 'product' && activeProduct
        ? getProductFullUrl(activeProduct)
        : typeof window !== 'undefined'
        ? window.location.origin + window.location.pathname
        : baseOrigin;

    upsertMetaTag('property', 'og:type', currentView === 'product' ? 'product' : 'website');
    upsertMetaTag('property', 'og:site_name', siteName);
    upsertMetaTag('property', 'og:title', finalTitle);
    upsertMetaTag('property', 'og:description', finalDescription);
    if (canonicalUrl) {
      upsertMetaTag('property', 'og:url', canonicalUrl);
      upsertLinkTag('canonical', canonicalUrl);
    }
    if (finalImage && !finalImage.startsWith('data:')) {
      upsertMetaTag('property', 'og:image', finalImage);
    }

    // 3. Twitter / X Card Meta Tags
    upsertMetaTag('name', 'twitter:card', 'summary_large_image');
    upsertMetaTag('name', 'twitter:title', finalTitle);
    upsertMetaTag('name', 'twitter:description', finalDescription);
    if (finalImage && !finalImage.startsWith('data:')) {
      upsertMetaTag('name', 'twitter:image', finalImage);
    }

    // 4. Dynamic Favicon
    const faviconHref = settings.faviconUrl || settings.logoUrl;
    if (faviconHref) {
      upsertLinkTag('icon', faviconHref);
      upsertLinkTag('apple-touch-icon', faviconHref);
    }

    // Google Search Console Site Verification
    const gVerify =
      (settings as any).googleSiteVerification ||
      (typeof process !== 'undefined' ? process.env?.VITE_GOOGLE_SITE_VERIFICATION : undefined) ||
      '';
    if (gVerify) {
      upsertMetaTag('name', 'google-site-verification', gVerify);
    }

    // 5. Schema.org JSON-LD Structured Data for Google Search Ranking
    const scriptId = 'dynamic-seo-jsonld';
    let scriptEl = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = scriptId;
      scriptEl.type = 'application/ld+json';
      document.head.appendChild(scriptEl);
    }

    const structuredData: Record<string, unknown> =
      currentView === 'product' && activeProduct
        ? {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Product',
                name: activeProduct.title,
                description: finalDescription,
                image:
                  activeProduct.imageUrl && !activeProduct.imageUrl.startsWith('data:')
                    ? activeProduct.imageUrl
                    : undefined,
                sku: activeProduct.id,
                brand: {
                  '@type': 'Brand',
                  name: siteName,
                },
                offers: {
                  '@type': 'Offer',
                  price: String(activeProduct.price),
                  priceCurrency: 'BDT',
                  availability: activeProduct.available
                    ? 'https://schema.org/InStock'
                    : 'https://schema.org/OutOfStock',
                  url: canonicalUrl,
                  priceValidUntil: new Date(Date.now() + 31536000000).toISOString().split('T')[0],
                },
              },
              {
                '@type': 'BreadcrumbList',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: baseOrigin,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: activeProduct.categoryId || 'Products',
                    item: `${baseOrigin}/shop?category=${encodeURIComponent(activeProduct.categoryId || '')}`,
                  },
                  {
                    '@type': 'ListItem',
                    position: 3,
                    name: activeProduct.title,
                    item: canonicalUrl,
                  },
                ],
              },
            ],
          }
        : {
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'WebSite',
                name: siteName,
                alternateName: baseMetaTitle,
                description: baseMetaDesc,
                url: canonicalUrl || undefined,
                keywords: baseKeywords,
                potentialAction: {
                  '@type': 'SearchAction',
                  target: `${baseOrigin}/shop?q={search_term_string}`,
                  'query-input': 'required name=search_term_string',
                },
              },
              {
                '@type': 'Organization',
                name: siteName,
                description: baseMetaDesc,
                url: canonicalUrl || undefined,
                logo: settings.logoUrl || undefined,
                contactPoint: {
                  '@type': 'ContactPoint',
                  telephone: settings.whatsappNumber || '+8801962780922',
                  contactType: 'customer service',
                  availableLanguage: ['Bengali', 'English'],
                },
              },
              {
                '@type': 'ItemList',
                name: 'ডিজিটাল প্রোডাক্ট ও সফটওয়্যার সমূহ',
                itemListElement: products.slice(0, 30).map((p, index) => ({
                  '@type': 'ListItem',
                  position: index + 1,
                  item: {
                    '@type': 'Product',
                    name: p.title,
                    description: p.shortDescription || p.description?.slice(0, 120),
                    image: p.imageUrl && !p.imageUrl.startsWith('data:') ? p.imageUrl : undefined,
                    offers: {
                      '@type': 'Offer',
                      price: String(p.price),
                      priceCurrency: 'BDT',
                      availability: p.available ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
                      url: getProductFullUrl(p),
                    },
                  },
                })),
              },
            ],
          };

    scriptEl.textContent = JSON.stringify(structuredData);
  }, [settings, currentView, activeProduct, products.length]);

  return null;
};
