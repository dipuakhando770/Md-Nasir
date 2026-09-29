import { generateOrderDeliveryEmailHtml, OrderDeliveryEmailData } from './emailTemplate';

const DEFAULT_API_TOKEN = '4ea22f7ead670187bbb994158af679a61877a6df5affcaf3a3d710f9fc11edba';
const DEFAULT_MAILBOX_ID = 'ACad6a6d6e0ffdd8ca2529ff958aaf';

export interface EmailDeliveryResponse {
  success: boolean;
  messageId?: string;
  message?: string;
  error?: string;
}

/**
 * Universal Delivery Dispatcher:
 * 1. Tries local/serverless API (/api/email/send-order-delivery)
 * 2. If running on Netlify/Vercel static or server returns 404/500, directly calls Hostinger Mail REST API
 * This ensures 100% reliability on Vercel, Netlify, Cloud Run, Localhost, or any static host.
 */
export async function dispatchOrderDeliveryEmail(
  data: OrderDeliveryEmailData,
  customToken?: string
): Promise<EmailDeliveryResponse> {
  const customerEmail = data.customerEmail?.trim();
  if (!customerEmail || !customerEmail.includes('@') || customerEmail.endsWith('@example.com')) {
    return {
      success: false,
      error: `সঠিক গ্রাহক ইমেইল পাওয়া যায়নি: ${customerEmail || 'খালি'}`,
    };
  }

  const token = customToken?.trim() || DEFAULT_API_TOKEN;
  const subject = `🎉 Order Confirmation & Product Access - Order #${data.orderId} | Nasir Digital Hub`;
  const htmlContent = generateOrderDeliveryEmailHtml(data);

  // 1. Try Backend / Serverless Proxy Route first
  try {
    const res = await fetch('/api/email/send-order-delivery', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const result = await res.json().catch(() => null);
      if (result && result.success) {
        return result;
      }
    }
  } catch (backendErr) {
    console.warn('[Email] Backend proxy route unavailable, using direct Hostinger Mail API:', backendErr);
  }

  // 2. Direct Hostinger Mail REST API (Works on Netlify, Vercel, Static SPA with CORS)
  try {
    const directRes = await fetch(
      `https://api.mail.hostinger.com/api/v1/mailboxes/${DEFAULT_MAILBOX_ID}/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: [customerEmail],
          displayName: 'Nasir Digital Hub',
          subject,
          html: htmlContent,
        }),
        signal: AbortSignal.timeout(12000),
      }
    );

    if (directRes.status === 204 || directRes.ok) {
      console.log(`[Hostinger API] Delivered successfully to ${customerEmail}`);
      return {
        success: true,
        messageId: `hostinger-direct-${Date.now()}`,
        message: `হোস্টইঙ্গার Mail API দিয়ে সফলভাবে ${customerEmail} এ ডেলিভারি করা হয়েছে!`,
      };
    }

    const errData: any = await directRes.json().catch(() => null);
    const errText = errData?.message || `Hostinger API status ${directRes.status}`;
    return {
      success: false,
      error: errText,
    };
  } catch (directErr: any) {
    console.error('[Hostinger Direct API] Error:', directErr);
    return {
      success: false,
      error: directErr?.message || 'হোস্টইঙ্গার ইমেইল সার্ভারে সংযোগ করা যায়নি।',
    };
  }
}

/**
 * Universal Test Email Dispatcher
 */
export async function dispatchTestEmail(
  recipient: string,
  customToken?: string
): Promise<EmailDeliveryResponse> {
  const token = customToken?.trim() || DEFAULT_API_TOKEN;
  const testRecipient = recipient.trim();

  const testHtml = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
      <div style="background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
        <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 800;">Nasir Digital Hub</h2>
        <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0;">Hostinger Business Email API Live Test</p>
      </div>
      <h3 style="color: #059669; margin-top: 0; font-size: 18px;">🎉 Hostinger Email API Connected Successfully!</h3>
      <p style="font-size: 14px; line-height: 1.6; color: #334155;">
        Your Hostinger business email <strong>nasirdigitalhub@pipilikhost.com</strong> is active and connected to Nasir Digital Hub.
      </p>
      <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 10px; font-size: 13px; color: #065f46; margin: 16px 0;">
        ⚡ <strong>Platform Compatibility:</strong> Netlify, Vercel, and Cloud deployments will automatically deliver digital products to your customers instantly upon order approval!
      </div>
      <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
      <div style="font-size: 12px; color: #94a3b8; text-align: center;">Nasir Digital Hub • Hostinger Mail API</div>
    </div>
  `;

  // 1. Try Backend Proxy
  try {
    const res = await fetch('/api/email/test', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ testRecipient }),
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json().catch(() => null);
      if (data && data.success) return data;
    }
  } catch {}

  // 2. Direct Fallback
  try {
    const directRes = await fetch(
      `https://api.mail.hostinger.com/api/v1/mailboxes/${DEFAULT_MAILBOX_ID}/send`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          to: [testRecipient],
          displayName: 'Nasir Digital Hub',
          subject: '✅ Hostinger Mail API Test - Nasir Digital Hub',
          html: testHtml,
        }),
        signal: AbortSignal.timeout(10000),
      }
    );

    if (directRes.status === 204 || directRes.ok) {
      return {
        success: true,
        message: `হোস্টইঙ্গার Mail API দিয়ে টেস্ট ইমেইল সফলভাবে ${testRecipient} এ পাঠানো হয়েছে!`,
      };
    }

    const errData: any = await directRes.json().catch(() => null);
    return {
      success: false,
      message: errData?.message || `Hostinger API error (${directRes.status})`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: err?.message || 'হোস্টইঙ্গার ইমেইল সার্ভারে সংযোগ করা যায়নি।',
    };
  }
}
