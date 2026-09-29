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

  // Default fallback image if product image is missing
  const defaultProductBanner =
    'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80';

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

      const itemBannerUrl = (item.imageUrl && item.imageUrl.trim()) || defaultProductBanner;

      return `
      <!-- Product Item Card ${index + 1} -->
      <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin-bottom: 20px; background-color: #ffffff; border: 1.5px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
        <!-- Product Banner Image Row -->
        <tr>
          <td style="padding: 0; background-color: #0f172a; text-align: center;">
            <img src="${itemBannerUrl}" alt="${item.title}" width="100%" style="width: 100%; max-height: 180px; object-fit: cover; display: block; border-bottom: 2px solid #10b981;" />
          </td>
        </tr>
        <!-- Product Content Body -->
        <tr>
          <td style="padding: 20px 22px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;">
            
            <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px;">
              <h4 style="margin: 0; font-size: 16px; font-weight: 800; color: #0f172a; line-height: 1.4;">
                ${index + 1}. ${item.title}
              </h4>
            </div>

            <div style="font-size: 13px; color: #64748b; margin-bottom: 14px; background: #f8fafc; padding: 6px 12px; border-radius: 8px; display: inline-block; border: 1px solid #e2e8f0;">
              পরিমাণ: <strong style="color: #0f172a;">${item.quantity || 1} টি</strong> &nbsp;|&nbsp; 
              মূল্য: <strong style="color: #059669;">${item.price} ৳</strong>
            </div>

            <!-- Download & Access Link Box -->
            <div style="background-color: #f0fdf4; border: 1.5px solid #86efac; border-radius: 12px; padding: 16px; margin-top: 6px;">
              <div style="font-size: 12px; font-weight: 700; color: #166534; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 8px;">
                🔑 ডিজিটাল অ্যাক্সেস ও ডাউনলোড লিঙ্ক:
              </div>

              ${
                finalDownloadUrl
                  ? `
                <div style="margin-bottom: 12px;">
                  <a href="${finalDownloadUrl}" target="_blank" style="display: inline-block; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 800; font-size: 14px; box-shadow: 0 4px 10px rgba(5,150,105,0.3); text-align: center;">
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
                <div style="margin-top: 10px; font-size: 12px;">
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
          
          <!-- Top Header with Website Main Brand Logo -->
          <tr>
            <td style="background: linear-gradient(135deg, #022c22 0%, #064e3b 50%, #0f172a 100%); padding: 36px 24px; text-align: center; color: #ffffff;">
              
              <!-- Brand Logo Rendering -->
              <div style="text-align: center; margin-bottom: 14px;">
                ${
                  logoUrl
                    ? `<img src="${logoUrl}" alt="Nasir Digital Hub" height="52" style="height: 52px; max-width: 220px; object-fit: contain; display: inline-block;" />`
                    : `
                    <!-- Vector Logo Lockup for High Quality Rendering -->
                    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 0 auto;">
                      <tr>
                        <td style="vertical-align: middle; padding-right: 12px;">
                          <div style="width: 44px; height: 44px; background: #059669; border-radius: 12px; text-align: center; line-height: 44px; font-size: 22px; font-weight: 900; color: #ffffff; box-shadow: 0 4px 12px rgba(5,150,105,0.4); border: 1.5px solid rgba(255,255,255,0.3);">
                            N
                          </div>
                        </td>
                        <td style="vertical-align: middle; text-align: left;">
                          <div style="font-size: 22px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px; line-height: 1.1;">
                            Nasir Digital Hub
                          </div>
                          <div style="font-size: 10px; font-weight: 700; color: #34d399; letter-spacing: 1px; text-transform: uppercase; margin-top: 3px;">
                            Premium Digital Marketplace
                          </div>
                        </td>
                      </tr>
                    </table>
                    `
                }
              </div>

              <div style="display: inline-block; background: rgba(16, 185, 129, 0.2); border: 1px solid rgba(52, 211, 153, 0.4); border-radius: 9999px; padding: 6px 18px; font-size: 12px; font-weight: 800; color: #a7f3d0; margin-top: 6px; text-transform: uppercase; letter-spacing: 0.5px;">
                ✅ অর্ডার কনফার্মড ও পণ্য ডেলিভারি
              </div>
              <h2 style="margin: 12px 0 0 0; font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;">
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
