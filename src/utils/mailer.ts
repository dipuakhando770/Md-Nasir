import nodemailer from 'nodemailer';
import { generateOrderDeliveryEmailHtml, OrderDeliveryEmailData } from './emailTemplate';

export interface SmtpConfig {
  host?: string;
  port?: number;
  user?: string;
  pass?: string;
  fromEmail?: string;
  fromName?: string;
  secure?: boolean;
}

const DEFAULT_API_TOKEN = '4ea22f7ead670187bbb994158af679a61877a6df5affcaf3a3d710f9fc11edba';
const DEFAULT_MAILBOX_RESOURCE_ID = 'ACad6a6d6e0ffdd8ca2529ff958aaf';

let cachedMailboxId: string = DEFAULT_MAILBOX_RESOURCE_ID;

/**
 * Automatically fetch mailbox resource ID from Hostinger Mail API using the Bearer token
 */
async function getHostingerMailboxResourceId(apiToken: string): Promise<string> {
  if (cachedMailboxId) return cachedMailboxId;
  try {
    const res = await fetch('https://api.mail.hostinger.com/api/v1/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${apiToken}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(6000),
    });
    const data: any = await res.json().catch(() => null);
    if (data?.data?.mailboxes?.[0]?.resourceId) {
      cachedMailboxId = data.data.mailboxes[0].resourceId;
      return cachedMailboxId;
    }
  } catch (err) {
    console.warn('[Hostinger API] Failed to fetch /api/v1/me mailbox ID, using default:', err);
  }
  return DEFAULT_MAILBOX_RESOURCE_ID;
}

/**
 * Send email using official Hostinger Mail REST API (https://api.mail.hostinger.com/api/v1/mailboxes/{mailboxId}/send)
 */
async function sendViaHostingerMailApi(
  payload: {
    fromName: string;
    toEmail: string;
    subject: string;
    html: string;
    apiToken: string;
  }
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const { fromName, toEmail, subject, html, apiToken } = payload;
    const mailboxId = await getHostingerMailboxResourceId(apiToken);

    const endpoint = `https://api.mail.hostinger.com/api/v1/mailboxes/${encodeURIComponent(mailboxId)}/send`;

    const requestBody = {
      to: [toEmail],
      displayName: fromName || 'Nasir Digital Hub',
      subject,
      html,
    };

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${apiToken}`,
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(12000),
    });

    if (response.status === 204 || response.ok) {
      console.log(`[Hostinger Mail API] Successfully dispatched email to ${toEmail} (status: ${response.status})`);
      return {
        success: true,
        messageId: `hostinger-api-${Date.now()}`,
      };
    }

    const data: any = await response.json().catch(() => null);
    const errorMsg =
      (data && (data.message || data.error || data.msg)) ||
      `Hostinger Mail API error (${response.status})`;
    console.warn('[Hostinger Mail API] Error response:', errorMsg);
    return { success: false, error: errorMsg };
  } catch (err: any) {
    console.warn('[Hostinger Mail API] Network exception:', err?.message);
    return { success: false, error: err?.message || 'Hostinger API connection failed' };
  }
}

export function createSmtpTransporter(config?: SmtpConfig) {
  const host = config?.host || process.env.HOSTINGER_SMTP_HOST || 'smtp.hostinger.com';
  const port = Number(config?.port || process.env.HOSTINGER_SMTP_PORT) || 465;
  const user = config?.user || process.env.HOSTINGER_SMTP_USER || 'nasirdigitalhub@pipilikhost.com';
  const pass =
    config?.pass ||
    process.env.HOSTINGER_SMTP_PASS ||
    process.env.SMTP_PASS ||
    DEFAULT_API_TOKEN;
  const secure = config?.secure !== undefined ? config.secure : port === 465;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
    tls: {
      rejectUnauthorized: false,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
}

export async function sendOrderDeliveryEmail(
  data: OrderDeliveryEmailData,
  customConfig?: SmtpConfig
): Promise<{ success: boolean; messageId?: string; error?: string }> {
  try {
    const fromName =
      customConfig?.fromName ||
      process.env.HOSTINGER_SENDER_NAME ||
      'Nasir Digital Hub';
    const token =
      customConfig?.pass ||
      process.env.HOSTINGER_SMTP_PASS ||
      process.env.SMTP_PASS ||
      DEFAULT_API_TOKEN;

    const customerEmail = data.customerEmail?.trim();
    if (!customerEmail || !customerEmail.includes('@') || customerEmail.endsWith('@example.com')) {
      return {
        success: false,
        error: `সঠিক গ্রাহক ইমেইল পাওয়া যায়নি: ${customerEmail || 'খালি'}`,
      };
    }

    const htmlContent = generateOrderDeliveryEmailHtml(data);
    const subject = `🎉 আপনার অর্ডার #${data.orderId} সফল হয়েছে — ডিজিটাল প্রোডাক্ট ডাউনলোড ও অ্যাক্সেস লিঙ্ক`;

    // 1. Primary Method: Official Hostinger Mail REST API (Fast & 100% Reliable)
    if (token) {
      const apiResult = await sendViaHostingerMailApi({
        fromName,
        toEmail: customerEmail,
        subject,
        html: htmlContent,
        apiToken: token,
      });

      if (apiResult.success) {
        return apiResult;
      }
    }

    // 2. Secondary Method: SMTP Fallback (if applicable)
    console.log('[Mailer] Attempting Hostinger SMTP fallback for', customerEmail);
    const fromEmail =
      customConfig?.fromEmail ||
      customConfig?.user ||
      process.env.HOSTINGER_SMTP_USER ||
      'nasirdigitalhub@pipilikhost.com';
    const transporter = createSmtpTransporter(customConfig);

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: customerEmail,
      bcc: fromEmail,
      subject,
      html: htmlContent,
      replyTo: fromEmail,
    };

    const info = await transporter.sendMail(mailOptions);
    return {
      success: true,
      messageId: info.messageId,
    };
  } catch (error: any) {
    console.error('[Mailer] Error sending order delivery email:', error);
    return {
      success: false,
      error: error?.message || 'ইমেইল পাঠাতে সমস্যা হয়েছে।',
    };
  }
}

export async function testSmtpConnection(
  testRecipient: string,
  customConfig?: SmtpConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const fromEmail =
      customConfig?.fromEmail ||
      customConfig?.user ||
      process.env.HOSTINGER_SMTP_USER ||
      'nasirdigitalhub@pipilikhost.com';
    const fromName = customConfig?.fromName || 'Nasir Digital Hub';
    const token =
      customConfig?.pass ||
      process.env.HOSTINGER_SMTP_PASS ||
      process.env.SMTP_PASS ||
      DEFAULT_API_TOKEN;

    const testHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 24px; color: #1e293b; max-width: 520px; border: 1px solid #e2e8f0; border-radius: 16px; background: #ffffff; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 16px; border-radius: 12px; text-align: center; color: #ffffff; margin-bottom: 20px;">
          <h2 style="color: #ffffff; margin: 0; font-size: 18px; font-weight: 800;">নাসির ডিজিটাল হাব</h2>
          <p style="margin: 4px 0 0 0; font-size: 12px; color: #a7f3d0;">হোস্টইঙ্গার বিজনেস ইমেইল API টেস্ট</p>
        </div>
        <h3 style="color: #059669; margin-top: 0; font-size: 18px;">🎉 হোস্টইঙ্গার ইমেইল API টেস্ট সফল হয়েছে!</h3>
        <p style="font-size: 14px; line-height: 1.6; color: #334155;">
          আপনার হোস্টইঙ্গার বিজনেস ইমেইল <strong>${fromEmail}</strong> সফলভাবে নাসির ডিজিটাল হাব এর সাথে যুক্ত হয়েছে।
        </p>
        <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 12px 16px; border-radius: 10px; font-size: 13px; color: #065f46; margin: 16px 0;">
          ⚡ <strong>অটোমেশন স্ট্যাটাস:</strong> এখন থেকে যেকোনো কাস্টমার পেমেন্ট সম্পন্ন করলেই এই ইমেইল থেকে স্বয়ংক্রিয়ভাবে তার ইনবক্সে ডিজিটাল প্রোডাক্ট ডাউনলোড ও লাইসেন্স লিঙ্ক পৌঁছে যাবে।
        </div>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 16px 0;" />
        <div style="font-size: 12px; color: #94a3b8; text-align: center;">Nasir Digital Hub • Hostinger Mail API Integration</div>
      </div>
    `;

    // 1. Try Hostinger Mail REST API
    const apiResult = await sendViaHostingerMailApi({
      fromName,
      toEmail: testRecipient,
      subject: '✅ নাসির ডিজিটাল হাব — হোস্টইঙ্গার ইমেইল API টেস্ট সফল',
      html: testHtml,
      apiToken: token,
    });

    if (apiResult.success) {
      return {
        success: true,
        message: `হোস্টইঙ্গার Mail API দিয়ে টেস্ট ইমেইল সফলভাবে ${testRecipient} এ পাঠানো হয়েছে!`,
      };
    }

    // 2. Try SMTP Fallback
    const transporter = createSmtpTransporter(customConfig);
    await transporter.verify();

    await transporter.sendMail({
      from: `"${fromName}" <${fromEmail}>`,
      to: testRecipient,
      subject: '✅ নাসির ডিজিটাল হাব — হোস্টইঙ্গার SMTP টেস্ট সফল',
      html: testHtml,
    });

    return {
      success: true,
      message: `হোস্টইঙ্গার SMTP দিয়ে টেস্ট ইমেইল সফলভাবে ${testRecipient} এ পাঠানো হয়েছে!`,
    };
  } catch (error: any) {
    console.error('[Mailer] Verification/Test Error:', error);
    return {
      success: false,
      message: error?.message || 'হোস্টইঙ্গার সার্ভারের সাথে সংযোগ করা যায়নি। API টোকেন বা পাসওয়ার্ড চেক করুন।',
    };
  }
}
