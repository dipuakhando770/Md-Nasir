import { generateDynamicSitemapXml } from '../src/utils/sitemapGenerator';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400');

  try {
    const host = req.headers['x-forwarded-host'] || req.headers.host || 'www.nasirdigitalhub.com';
    const proto = req.headers['x-forwarded-proto'] || 'https';
    const baseUrl = `${proto}://${host}`;

    const xml = generateDynamicSitemapXml(baseUrl);
    return res.status(200).send(xml);
  } catch (error: any) {
    console.error('Sitemap Serverless Error:', error);
    return res.status(500).send('Error generating sitemap');
  }
}
