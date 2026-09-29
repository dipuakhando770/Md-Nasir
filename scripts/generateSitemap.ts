import { generateDynamicSitemapXml, generateRobotsTxt } from '../src/utils/sitemapGenerator';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const publicDir = path.join(rootDir, 'public');

try {
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  const baseUrl = process.env.SITE_URL || 'https://www.nasirdigitalhub.com';

  const sitemapXml = generateDynamicSitemapXml(baseUrl);
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemapXml, 'utf8');

  const robotsTxt = generateRobotsTxt(baseUrl);
  fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt, 'utf8');

  console.log(`[SEO Build] Generated sitemap.xml and robots.txt in public/ for ${baseUrl}`);
} catch (err) {
  console.error('[SEO Build Error]:', err);
}
