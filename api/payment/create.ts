import type { IncomingMessage, ServerResponse } from 'http';

export default async function handler(req: any, res: any) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const {
      amount,
      customerPhone,
      customerName,
      customerEmail,
      orderId,
      successUrl,
      cancelUrl,
      brandKey,
      secretKey,
      apiKey,
      gatewayUrl,
    } = body;

    const finalBrandKey =
      brandKey?.trim() ||
      process.env.PAYBD_BRAND_KEY ||
      'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ';
    const finalDeviceKey =
      secretKey?.trim() ||
      process.env.PAYBD_DEVICE_KEY ||
      'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg';

    const targetGatewayUrl =
      gatewayUrl?.trim() ||
      process.env.PAYBD_GATEWAY_URL ||
      'https://app-paybd.pipilikhost.com/api/payment/create';

    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    const protoHeader = req.headers['x-forwarded-proto'] || 'https';
    const defaultOrigin = hostHeader ? `${protoHeader}://${hostHeader}` : 'https://vercel.app';
    const origin = req.headers.origin || defaultOrigin;

    const cleanOrderId = orderId || `ORD-${Date.now()}`;
    const finalSuccessUrl = successUrl || `${origin}/?payment=success&order_id=${cleanOrderId}`;
    const finalCancelUrl = cancelUrl || `${origin}/?payment=cancel&order_id=${cleanOrderId}`;
    const cleanAmount = Math.max(1, Math.round(Number(amount) || 10));

    const cusName = customerName?.trim() || 'Nasir Customer';
    const cusPhone = customerPhone?.trim() || '01800000000';
    const cusEmail = customerEmail?.trim() || `${cusPhone.replace(/\D/g, '') || 'client'}@gmail.com`;

    const finalWebhookUrl = `${origin}/api/payment/callback?api=${encodeURIComponent(finalBrandKey)}&invoice=${encodeURIComponent(cleanOrderId)}`;

    const requestPayload = {
      cus_name: cusName,
      cus_email: cusEmail,
      amount: String(cleanAmount),
      webhook_url: finalWebhookUrl,
      success_url: finalSuccessUrl,
      cancel_url: finalCancelUrl,
      metadata: {
        phone: cusPhone,
        name: cusName,
        email: cusEmail,
        orderId: cleanOrderId,
      },
      meta_data: {
        phone: cusPhone,
        name: cusName,
        email: cusEmail,
        orderId: cleanOrderId,
      },
    };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'API-KEY': finalBrandKey,
      'BRAND-KEY': finalBrandKey,
      'DEVICE-KEY': finalDeviceKey,
      'SECRET-KEY': finalDeviceKey,
    };

    const response = await fetch(targetGatewayUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload),
    });

    const responseData: any = await response.json().catch(() => null);

    if (!response.ok || !responseData) {
      const errorMsg =
        (responseData && (responseData.message || responseData.error || responseData.msg)) ||
        `Gateway Server Error (${response.status})`;
      return res.status(response.status || 500).json({
        success: false,
        message: errorMsg,
        raw: responseData,
      });
    }

    if (responseData.status === false || responseData.status === 'error') {
      return res.status(400).json({
        success: false,
        message: responseData.message || 'PayBD গেটওয়ে থেকে এরর পাওয়া গেছে।',
        raw: responseData,
      });
    }

    const paymentUrl =
      responseData.payment_url ||
      responseData.paymentUrl ||
      responseData.url ||
      responseData.payment_link ||
      responseData.link ||
      (responseData.data &&
        (responseData.data.payment_url ||
          responseData.data.url ||
          responseData.data.payment_link ||
          responseData.data.link));

    if (!paymentUrl) {
      return res.status(400).json({
        success: false,
        message:
          (responseData && responseData.message) ||
          'গেটওয়ে থেকে পেমেন্ট লিংক তৈরি করা যায়নি। বিস্তারিত চেক করুন।',
        raw: responseData,
      });
    }

    return res.status(200).json({
      success: true,
      paymentUrl,
      orderId: cleanOrderId,
      raw: responseData,
    });
  } catch (error: any) {
    console.error('Vercel API create error:', error);
    return res.status(500).json({
      success: false,
      message: error?.message || 'সার্ভারলেস ফাংশনে সমস্যা হয়েছে।',
    });
  }
}
