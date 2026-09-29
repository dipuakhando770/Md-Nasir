export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const { transactionId, brandKey, apiKey, secretKey } = body;

    const finalBrandKey =
      brandKey?.trim() ||
      apiKey?.trim() ||
      process.env.PAYBD_BRAND_KEY ||
      'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ';
    const finalDeviceKey =
      secretKey?.trim() ||
      process.env.PAYBD_DEVICE_KEY ||
      'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg';

    const response = await fetch('https://app-paybd.pipilikhost.com/api/payment/verify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': finalBrandKey,
        'BRAND-KEY': finalBrandKey,
        'SECRET-KEY': finalDeviceKey,
        'DEVICE-KEY': finalDeviceKey,
      },
      body: JSON.stringify({ transaction_id: transactionId }),
    });

    const data: any = await response.json().catch(() => null);
    return res.status(response.status).json(data || { success: false });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error?.message });
  }
}
