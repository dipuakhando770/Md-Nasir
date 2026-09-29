export interface EmailOrderItem {
  productId?: string;
  title: string;
  price: number;
  quantity?: number;
  imageUrl?: string;
  downloadUrl?: string;
  livePreviewUrl?: string;
}

export interface OrderDeliveryEmailData {
  orderId: string;
  transactionId?: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  amount: number;
  paymentMethod?: string;
  items: EmailOrderItem[];
  websiteUrl?: string;
  logoUrl?: string;
  whatsappNumber?: string;
}

/**
 * Normalizes an image/logo URL for 100% email client compatibility (Gmail, Outlook, Yahoo, Apple Mail).
 * Strips data URIs and resolves relative paths to absolute HTTPS URLs.
 */
function resolveEmailImageUrl(url: string | undefined, baseUrl: string, fallbackUrl: string): string {
  if (!url || typeof url !== 'string') return fallbackUrl;
  const trimmed = url.trim();
  if (!trimmed || trimmed.startsWith('data:image/')) return fallbackUrl;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanPath = trimmed.replace(/^\/+/, '');
  return `${cleanBase}/${cleanPath}`;
}

export function generateOrderDeliveryEmailHtml(data: OrderDeliveryEmailData): string {
  const {
    orderId,
    transactionId,
    customerName,
    amount,
    paymentMethod = 'Online Payment',
    items = [],
    logoUrl,
    websiteUrl = 'https://nasirdigitalhub.pipilikhost.com',
    whatsappNumber = '01962780922',
  } = data;

  const cleanPhone = (whatsappNumber || '01962780922').replace(/\D/g, '');
  const targetWhatsApp = cleanPhone.startsWith('880')
    ? cleanPhone
    : cleanPhone.startsWith('0')
    ? `88${cleanPhone}`
    : `880${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(
    `আসসালামু আলাইকুম! আমার অর্ডার #${orderId} সংক্রান্ত সহযোগিতা প্রয়োজন।`
  )}`;

  // Guaranteed public HTTPS hosted brand logo & category banners
  const fallbackBrandLogo =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=240&auto=format&fit=crop&q=80';
  const defaultProductBanner =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80';

  const validLogoUrl = resolveEmailImageUrl(logoUrl, websiteUrl, '');

  const itemsHtml = items
    .map((item, index) => {
      const rawDownload = item.downloadUrl && item.downloadUrl.trim();
      const finalDownloadUrl = rawDownload
        ? /^https?:\/\//i.test(rawDownload)
          ? rawDownload
          : `https://${rawDownload}`
        : '';

      const rawPreview = item.livePreviewUrl && item.livePreviewUrl.trim();
      const finalPreviewUrl = rawPreview
        ? /^https?:\/\//i.test(rawPreview)
          ? rawPreview
          : `https://${rawPreview}`
        : '';

      const itemBannerUrl = resolveEmailImageUrl(item.imageUrl, websiteUrl, defaultProductBanner);

      return `
      <!-- Product Item Card ${index + 1} -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 22px; background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 18px; overflow: hidden; box-shadow: 0 4px 8px -2px rgba(0, 0, 0, 0.06);">
        <!-- Product Banner Image Row -->
        <tr>
          <td style="padding: 0; background-color: #0f172a; text-align: center;">
            <img src="${itemBannerUrl}" alt="${item.title}" width="100%" style="width: 100%; max-height: 200px; object-fit: cover; display: block; border-bottom: 3px solid #10b981;" />
          </td>
        </tr>
        <!-- Product Content Body -->
        <tr>
          <td style="padding: 22px 24px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <div style="margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 17px; font-weight: 800; color: #0f172a; line-height: 1.4;">
                ${index + 1}. ${item.title}
              </h4>
            </div>

            <div style="font-size: 13px; color: #64748b; margin-bottom: 16px; background: #f8fafc; padding: 6px 14px; border-radius: 8px; display: inline-block; border: 1px solid #e2e8f0;">
              পরিমাণ: <strong style="color: #0f172a;">${item.quantity || 1} টি</strong> &nbsp;|&nbsp; 
              মূল্য: <strong style="color: #059669;">${item.price} ৳</strong>
            </div>

            <!-- Download & Access Link Box -->
            <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 14px; padding: 18px; margin-top: 6px;">
              <div style="font-size: 12px; font-weight: 800; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 10px;">
                🔑 ডিজিটাল অ্যাক্সেস ও ডাউনলোড লিঙ্ক:
              </div>

              ${
                finalDownloadUrl
                  ? `
                <div style="margin-bottom: 12px;">
                  <a href="${finalDownloadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; padding: 13px 26px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 12px rgba(5,150,105,0.35); text-align: center;">
                    📥 এক্সেস লিংক / ফাইল ডাউনলোড করুন
                  </a>
                </div>
                <div style="font-size: 12px; color: #15803d; word-break: break-all; background: #ffffff; padding: 10px 14px; border-radius: 8px; border: 1px dashed #4ade80; line-height: 1.5;">
                  <strong>সরাসরি লিঙ্ক:</strong> <a href="${finalDownloadUrl}" target="_blank" style="color: #047857; font-weight: 700; text-decoration: underline;">${finalDownloadUrl}</a>
                </div>
                `
                  : `
                <div style="font-size: 13px; color: #b45309; background: #fef3c7; padding: 10px 14px; border-radius: 8px; font-weight: 600; line-height: 1.5;">
                  ⚡ এটি একটি প্রিমিয়াম লাইসেন্স / অ্যাকাউন্ট অ্যাক্টিভেশন প্যাকেজ। নিচের WhatsApp বাটনে যোগাযোগ করলে আমাদের প্রতিনিধি আপনার অ্যাকাউন্টে সরাসরি অ্যাক্টিভেশন নিশ্চিত করবেন।
                </div>
                `
              }

              ${
                finalPreviewUrl
                  ? `
                <div style="margin-top: 12px; font-size: 12px;">
                  <a href="${finalPreviewUrl}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 700;">
                    🔗 লাইভ ডেমো / প্রিভিউ পেজ দেখুন &rarr;
                  </a>
                </div>
                `
                  : ''
              }
            </div>

          </td>
        </tr>
      </table>
      `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Digital Product Delivery — Nasir Digital Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 12px 30px -5px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
          
          <!-- Top Header with Website Main Brand Favicon & Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #022c22 0%, #064e3b 45%, #0f172a 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
              
              <!-- 1. Official Favicon Emblem (100% Email Client Compatible Table Badge) -->
              <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto 16px auto;">
                <tr>
                  <td align="center">
                    <table border="0" cellspacing="0" cellpadding="0" style="margin: 0 auto;">
                      <tr>
                        ${
                          validLogoUrl
                            ? `
                          <td align="center" style="padding-bottom: 8px;">
                            <img src="${validLogoUrl}" alt="Nasir Digital Hub Logo" height="56" style="height: 56px; max-width: 240px; object-fit: contain; display: block; margin: 0 auto;" />
                          </td>
                            `
                            : `
                          <!-- Visual 3D Cyber Emblem Favicon -->
                          <td style="background: #0f172a; border-radius: 18px; border: 2px solid #34d399; box-shadow: 0 8px 24px rgba(5,150,105,0.4); padding: 10px 18px; text-align: center;">
                            <table border="0" cellspacing="0" cellpadding="0" align="center">
                              <tr>
                                <td style="vertical-align: middle; padding-right: 12px;">
                                  <div style="width: 44px; height: 44px; background: linear-gradient(135deg, #0ea5e9 0%, #059669 100%); border-radius: 12px; text-align: center; line-height: 44px; font-size: 24px; font-weight: 900; color: #ffffff; box-shadow: 0 4px 10px rgba(14,165,233,0.4); border: 1.5px solid rgba(255,255,255,0.4);">
                                    N
                                  </div>
                                </td>
                                <td style="vertical-align: middle; text-align: left;">
                                  <div style="font-size: 20px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1.1;">
                                    Nasir Digital Hub
                                  </div>
                                  <div style="font-size: 10px; font-weight: 800; color: #34d399; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">
                                    Official Store
                                  </div>
                                </td>
                              </tr>
                            </table>
                          </td>
                            `
                        }
                      </tr>
                    </table>

                    <div style="margin-top: 10px;">
                      <span style="display: inline-block; background: rgba(52, 211, 153, 0.18); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 9999px; padding: 4px 14px; font-size: 10px; font-weight: 800; color: #a7f3d0; letter-spacing: 0.6px; text-transform: uppercase;">
                        🛡️ Verified Official Digital Product Delivery
                      </span>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- 2. Headline Title -->
              <h2 style="margin: 14px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px; line-height: 1.4;">
                আপনার ক্রয়কৃত ডিজিটাল প্রোডাক্ট ও অ্যাক্সেস লিঙ্ক
              </h2>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <h3 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a; font-weight: 800;">
                আসসালামু আলাইকুম, ${customerName || 'সম্মানিত গ্রাহক'}! 👋
              </h3>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                <strong>Nasir Digital Hub</strong> থেকে কেনাকাটা করার জন্য আপনাকে ধন্যবাদ। আপনার অর্ডারটি সফলভাবে অনুমোদন (Approved & Completed) করা হয়েছে। নিচে আপনার ক্রয়কৃত পণ্যের ব্যানার, বিস্তারিত এবং <strong>সরাসরি ডাউনলোড ও এক্সেস লিংক</strong> দেওয়া হলো।
              </p>
            </td>
          </tr>

          <!-- Order Summary Badge Grid -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; border-radius: 14px; padding: 16px; border: 1.5px solid #e2e8f0;">
                <tr>
                  <td style="font-size: 13px; color: #64748b; padding-bottom: 8px;">
                    <strong>📦 অর্ডার আইডি:</strong> <span style="font-family: monospace; color: #0f172a; font-weight: 800; font-size: 14px;">#${orderId}</span>
                  </td>
                  <td style="font-size: 13px; color: #64748b; padding-bottom: 8px; text-align: right;">
                    <strong>💳 ট্রানজেকশন ID:</strong> <span style="font-family: monospace; color: #0f172a; font-weight: 700;">${transactionId || 'MANUAL-APPROVED'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #64748b;">
                    <strong>💰 মোট পরিশোধিত:</strong> <span style="color: #059669; font-weight: 800; font-size: 16px;">${amount} ৳</span>
                  </td>
                  <td style="font-size: 13px; color: #64748b; text-align: right;">
                    <strong>⚡ পেমেন্ট মেথড:</strong> <span style="color: #0f172a; font-weight: 700;">${paymentMethod}</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Digital Products Section -->
          <tr>
            <td style="padding: 0 24px 8px 24px;">
              <div style="font-size: 14px; font-weight: 800; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 14px; border-left: 4px solid #059669; padding-left: 10px;">
                🛍️ অর্ডারকৃত প্রোডাক্ট ও এক্সেস লিঙ্কসমূহ
              </div>

              ${itemsHtml}
            </td>
          </tr>

          <!-- Important Guidelines Card -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border-radius: 14px; padding: 16px; border: 1.5px solid #a7f3d0;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #065f46; font-weight: 800;">
                      💡 জরুরি ব্যবহারবিধি ও সহায়তা:
                    </h4>
                    <ul style="margin: 0; padding-left: 20px; font-size: 12px; color: #047857; line-height: 1.7;">
                      <li>প্রোডাক্টের নিচে থাকা <strong>"এক্সেস লিংক / ফাইল ডাউনলোড করুন"</strong> বাটনে ক্লিক করে ফাইল ও লাইসেন্স সংগ্রহ করুন।</li>
                      <li>Canva Pro বা সফটওয়্যারের ক্ষেত্রে প্রদত্ত অ্যাক্টিভেশন লিঙ্ক ওপেন করে ইনভাইটেশন গ্রহণ করুন।</li>
                      <li>ভবিষ্যতে যেকোনো সময় সহজে ডাউনলোডের জন্য এই ইমেইলটি <strong>Star / Save</strong> করে রাখুন।</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 24/7 WhatsApp Support CTA -->
          <tr>
            <td style="padding: 0 24px 28px 24px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b; font-weight: 600;">
                যেকোনো কারিগরি সমস্যায় আমাদের সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন:
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 13px 28px; border-radius: 12px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 14px rgba(37, 211, 102, 0.35);">
                      💬 WhatsApp এ সাপোর্ট নিন (${whatsappNumber || '01962780922'})
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Email Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 24px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #1e293b;">
              <p style="margin: 0 0 6px 0; font-weight: 700; color: #cbd5e1; font-size: 13px;">
                Nasir Digital Hub — প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস
              </p>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 11px;">
                ইমেইল সাপোর্ট: nasirdigitalhub@pipilikhost.com | হেল্পলাইন: ${whatsappNumber || '01962780922'}
              </p>
              <p style="margin: 0; color: #475569; font-size: 10px;">
                &copy; ${new Date().getFullYear()} Nasir Digital Hub. All Rights Reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
