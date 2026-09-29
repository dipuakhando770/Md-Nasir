/**
 * Dynamic XML Sitemap Generator
 * Conforms to sitemaps.org XML schema specification.
 * 
 * Features:
 * - Real dynamic product URLs using clean SEO slugs (e.g. /product/freelancing-digital-product-business-100tb-digital-product-bundle-all-product-price-only-299)
 * - Automatic <lastmod> timestamps
 * - Automatic category URLs
 * - Strict exclusion of private/admin/checkout/cart URLs
 * - Safe XML escaping
 */

import { defaultCategories, defaultProducts } from '../firebase/defaultData';
import { generateSlug } from './slugify';

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function generateDynamicSitemapXml(baseUrl = 'https://www.nasirdigitalhub.com'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const nowIso = new Date().toISOString().split('T')[0];

  interface SitemapUrl {
    loc: string;
    lastmod?: string;
    changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly';
    priority?: string;
  }

  const urls: SitemapUrl[] = [
    // 1. Homepage
    {
      loc: `${cleanBase}/`,
      lastmod: nowIso,
      changefreq: 'daily',
      priority: '1.0',
    },
    // 2. Shop Page
    {
      loc: `${cleanBase}/shop`,
      lastmod: nowIso,
      changefreq: 'daily',
      priority: '0.9',
    },
  ];

  // 3. Dynamic Categories
  const activeCategories = defaultCategories.filter((c) => c.active !== false);
  for (const cat of activeCategories) {
    const catSlug = generateSlug(cat.slug || cat.id);
    urls.push({
      loc: `${cleanBase}/shop?category=${encodeURIComponent(catSlug)}`,
      lastmod: nowIso,
      changefreq: 'weekly',
      priority: '0.7',
    });
  }

  // 4. Dynamic Products (Only published & available)
  const activeProducts = defaultProducts.filter((p) => p.available !== false);
  for (const prod of activeProducts) {
    const prodSlug = prod.slug ? generateSlug(prod.slug) : generateSlug(prod.title || prod.id);
    const prodUrl = `${cleanBase}/product/${prodSlug}`;
    const lastModDate = prod.updatedAt || prod.createdAt
      ? new Date(prod.updatedAt || prod.createdAt).toISOString().split('T')[0]
      : nowIso;

    urls.push({
      loc: prodUrl,
      lastmod: lastModDate,
      changefreq: 'weekly',
      priority: prod.featured ? '0.8' : '0.7',
    });
  }

  // Build XML String
  const xmlEntries = urls
    .map((item) => {
      return `  <url>
    <loc>${escapeXml(item.loc)}</loc>
    ${item.lastmod ? `<lastmod>${item.lastmod}</lastmod>` : ''}
    ${item.changefreq ? `<changefreq>${item.changefreq}</changefreq>` : ''}
    ${item.priority ? `<priority>${item.priority}</priority>` : ''}
  </url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${xmlEntries}
</urlset>`;
}

export function generateRobotsTxt(baseUrl = 'https://www.nasirdigitalhub.com'): string {
  const cleanBase = baseUrl.replace(/\/+$/, '');
  return `# Robots.txt for Nasir Digital Hub
# Domain: ${cleanBase}

User-agent: *
Allow: /
Allow: /product/
Allow: /shop
Allow: /public/
Disallow: /admin
Disallow: /api/

# Sitemap Location
Sitemap: ${cleanBase}/sitemap.xml
`;
}
