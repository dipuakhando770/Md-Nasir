import { generateDynamicSitemapXml } from '../../src/utils/sitemapGenerator';

export const handler = async (event: any) => {
  const host = event.headers['host'] || 'www.nasirdigitalhub.com';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const baseUrl = `${proto}://${host}`;

  try {
    const xml = generateDynamicSitemapXml(baseUrl);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400',
        'Access-Control-Allow-Origin': '*',
      },
      body: xml,
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Error generating sitemap',
    };
  }
};
