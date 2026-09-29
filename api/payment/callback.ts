export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    const query = req.query || {};
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body || {};
    const params = { ...query, ...body };

    const invoiceId = params.invoice || params.invoiceId || params.order_id || params.orderId || params.id || '';
    const transactionId = params.transactionId || params.transaction_id || params.trx_id || params.trxId || '';
    const paymentAmount = params.paymentAmount || params.amount || '';
    const paymentFee = params.paymentFee || params.fee || '0';
    const paymentMethod = params.paymentMethod || params.method || 'paybd';
    const status = (params.status || '').toLowerCase();
    const apiKey = params.api || params.apiKey || process.env.PAYBD_BRAND_KEY || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ';
    const secretKey = params.secret || params.secretKey || process.env.PAYBD_DEVICE_KEY || 'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg';

    const hostHeader = req.headers['x-forwarded-host'] || req.headers.host;
    const protoHeader = req.headers['x-forwarded-proto'] || 'https';
    const defaultOrigin = hostHeader ? `${protoHeader}://${hostHeader}` : 'https://vercel.app';
    const origin = req.headers.origin || defaultOrigin;

    let isVerified = status === 'completed' || status === 'success';

    if (transactionId) {
      try {
        const verifyRes = await fetch('https://app-paybd.pipilikhost.com/api/payment/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'API-KEY': apiKey,
            'BRAND-KEY': apiKey,
            'SECRET-KEY': secretKey,
            'DEVICE-KEY': secretKey,
          },
          body: JSON.stringify({ transaction_id: transactionId }),
          signal: AbortSignal.timeout(4000),
        });
        const verifyData: any = await verifyRes.json().catch(() => null);
        if (
          verifyData &&
          (verifyData.status === 'COMPLETED' ||
            verifyData.status === 'completed' ||
            verifyData.status === 1 ||
            verifyData.status === true)
        ) {
          isVerified = true;
        }
      } catch (err) {
        console.warn('Callback verification notice:', err);
      }
    }

    const redirectStatus = isVerified ? 'success' : 'cancel';
    const redirectUrl = `${origin}/?payment=${redirectStatus}&order_id=${encodeURIComponent(
      invoiceId
    )}&transactionId=${encodeURIComponent(transactionId)}&paymentAmount=${encodeURIComponent(
      paymentAmount
    )}&paymentFee=${encodeURIComponent(paymentFee)}&paymentMethod=${encodeURIComponent(
      paymentMethod
    )}&status=${isVerified ? 'COMPLETED' : 'FAILED'}`;

    const acceptsHtml = req.headers.accept && req.headers.accept.includes('text/html');
    if (req.method === 'GET' || acceptsHtml) {
      res.writeHead(302, { Location: redirectUrl });
      res.end();
      return;
    }

    return res.status(200).json({
      status: isVerified ? 'COMPLETED' : 'PENDING',
      invoiceId,
      transactionId,
      paymentAmount,
      redirectUrl,
    });
  } catch (error: any) {
    console.error('Vercel callback error:', error);
    return res.status(500).json({ success: false, message: error?.message });
  }
}
