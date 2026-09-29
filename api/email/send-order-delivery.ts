import { sendOrderDeliveryEmail } from '../../src/utils/mailer';

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
    const {
      orderId,
      transactionId,
      customerName,
      customerEmail,
      customerPhone,
      amount,
      paymentMethod,
      items,
      websiteUrl,
      logoUrl,
      whatsappNumber,
      smtpConfig,
    } = body;

    if (!orderId || !customerEmail) {
      return res.status(400).json({
        success: false,
        message: 'orderId এবং customerEmail ফিল্ডটি প্রদান করা আবশ্যক।',
      });
    }

    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    const protoHeader = req.headers['x-forwarded-proto'] || 'https';
    const autoOrigin = hostHeader ? `${protoHeader}://${hostHeader}` : undefined;

    const result = await sendOrderDeliveryEmail(
      {
        orderId,
        transactionId,
        customerName: customerName || 'Valued Customer',
        customerEmail: customerEmail.trim(),
        customerPhone,
        amount: Number(amount) || 0,
        paymentMethod: paymentMethod || 'Online Payment',
        items: Array.isArray(items) ? items : [],
        websiteUrl: websiteUrl || autoOrigin,
        logoUrl,
        whatsappNumber: whatsappNumber || '01962780922',
      },
      smtpConfig
    );

    return res.status(200).json(result);
  } catch (error: any) {
    console.error('Vercel API email send error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'ইমেইল ডেলিভারি সার্ভারে সমস্যা হয়েছে।',
    });
  }
}
