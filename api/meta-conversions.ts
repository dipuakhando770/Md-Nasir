import { sendMetaConversionsApiEvent } from '../src/utils/metaCapi';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { eventName, eventId, eventSourceUrl, userData, customData } = body;

    if (!eventName || !eventId) {
      return res.status(400).json({ success: false, message: 'eventName and eventId are required' });
    }

    const clientIp =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      req.socket?.remoteAddress ||
      '';
    const clientUserAgent = req.headers['user-agent'] || '';

    const enrichedUserData = {
      ...userData,
      clientIp,
      clientUserAgent,
    };

    const result = await sendMetaConversionsApiEvent({
      eventName,
      eventId,
      eventSourceUrl,
      userData: enrichedUserData,
      customData,
    });

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel Meta CAPI error:', error);
    return res.status(500).json({ success: false, message: error?.message });
  }
}
