import { testSmtpConnection } from '../../src/utils/mailer';

export default async function handler(req: any, res: any) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { testRecipient, smtpConfig } = body;
    const recipient = testRecipient?.trim() || 'nasirdigitalhub@pipilikhost.com';

    const result = await testSmtpConnection(recipient, smtpConfig);
    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel API email test error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'ইমেইল টেস্ট সার্ভারে সমস্যা হয়েছে।',
    });
  }
}
