export const handler = async (event: any) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
    };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const body = event.body ? JSON.parse(event.body) : {};
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

    const host = event.headers['host'] || event.headers['x-forwarded-host'] || 'netlify.app';
    const proto = event.headers['x-forwarded-proto'] || 'https';
    const origin = `${proto}://${host}`;

    const cleanOrderId = orderId || `ORD-${Date.now()}`;
    const finalSuccessUrl = successUrl || `${origin}/?payment=success&order_id=${cleanOrderId}`;
    const finalCancelUrl = cancelUrl || `${origin}/?payment=cancel&order_id=${cleanOrderId}`;
    const cleanAmount = Math.max(1, Math.round(Number(amount) || 10));

    const cusName = customerName?.trim() || 'Nasir Customer';
    const cusPhone = customerPhone?.trim() || '01800000000';
    const cusEmail = customerEmail?.trim() || `${cusPhone.replace(/\D/g, '') || 'client'}@gmail.com`;

    const finalWebhookUrl = `${origin}/api/payment/callback?api=${encodeURIComponent(finalBrandKey)}&invoice=${encodeURIComponent(cleanOrderId)}`;

    const response = await fetch(targetGatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'API-KEY': finalBrandKey,
        'BRAND-KEY': finalBrandKey,
        'DEVICE-KEY': finalDeviceKey,
        'SECRET-KEY': finalDeviceKey,
      },
      body: JSON.stringify({
        cus_name: cusName,
        cus_email: cusEmail,
        amount: String(cleanAmount),
        webhook_url: finalWebhookUrl,
        success_url: finalSuccessUrl,
        cancel_url: finalCancelUrl,
        metadata: { phone: cusPhone, name: cusName, email: cusEmail, orderId: cleanOrderId },
        meta_data: { phone: cusPhone, name: cusName, email: cusEmail, orderId: cleanOrderId },
      }),
    });

    const responseData: any = await response.json().catch(() => null);

    if (!response.ok || !responseData) {
      return {
        statusCode: response.status || 500,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          success: false,
          message: responseData?.message || 'Gateway Error',
          raw: responseData,
        }),
      };
    }

    const paymentUrl =
      responseData.payment_url ||
      responseData.paymentUrl ||
      responseData.url ||
      responseData.payment_link ||
      (responseData.data && (responseData.data.payment_url || responseData.data.url));

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        success: true,
        paymentUrl,
        orderId: cleanOrderId,
        raw: responseData,
      }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, message: err?.message }),
    };
  }
};
