export const handler = async (event: any) => {
  const query = event.queryStringParameters || {};
  let body = {};
  try {
    if (event.body) body = JSON.parse(event.body);
  } catch {}

  const params = { ...query, ...body };
  const invoiceId = params.invoice || params.invoiceId || params.order_id || '';
  const transactionId = params.transactionId || params.transaction_id || '';
  const paymentAmount = params.paymentAmount || params.amount || '';
  const status = (params.status || '').toLowerCase();

  const host = event.headers['host'] || 'netlify.app';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const origin = `${proto}://${host}`;

  const isVerified = status === 'completed' || status === 'success' || Boolean(transactionId);
  const redirectStatus = isVerified ? 'success' : 'cancel';
  const redirectUrl = `${origin}/?payment=${redirectStatus}&order_id=${encodeURIComponent(
    invoiceId
  )}&transactionId=${encodeURIComponent(transactionId)}&paymentAmount=${encodeURIComponent(
    paymentAmount
  )}&status=${isVerified ? 'COMPLETED' : 'FAILED'}`;

  return {
    statusCode: 302,
    headers: {
      Location: redirectUrl,
    },
    body: '',
  };
};
