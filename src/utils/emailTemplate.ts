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
    whatsappNumber = '01962780922',
  } = data;

  const cleanPhone = (whatsappNumber || '01962780922').replace(/\D/g, '');
  const targetWhatsApp = cleanPhone.startsWith('880') ? cleanPhone : cleanPhone.startsWith('0') ? `88${cleanPhone}` : `880${cleanPhone}`;
  const whatsappUrl = `https://wa.me/${targetWhatsApp}?text=${encodeURIComponent(`আসসালামু আলাইকুম! আমার অর্ডার #${orderId} সংক্রান্ত সহযোগিতা প্রয়োজন।`)}`;

  const itemsHtml = items
    .map((item, index) => {
      const downloadLink = item.downloadUrl && item.downloadUrl.trim();
      const previewLink = item.livePreviewUrl && item.livePreviewUrl.trim();

      return `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 16px 12px; vertical-align: top; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          <div style="font-weight: 700; font-size: 15px; color: #0f172a; margin-bottom: 4px;">
            ${index + 1}. ${item.title}
          </div>
          <div style="font-size: 12px; color: #64748b; margin-bottom: 8px;">
            পরিমাণ: ${item.quantity || 1} | মূল্য: ${item.price} ৳
          </div>
          ${
            downloadLink
              ? `<div style="margin-top: 8px;">
                  <a href="${downloadLink}" target="_blank" style="display: inline-block; background: #059669; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 700; font-size: 13px; box-shadow: 0 2px 5px rgba(5,150,105,0.25);">
                    📥 ফাইল / লাইসেন্স ডাউনলোড করুন
                  </a>
                 </div>
                 <div style="margin-top: 6px; font-size: 11px; color: #059669; word-break: break-all;">
                   সরাসরি ডাউনলোড লিঙ্ক: <a href="${downloadLink}" style="color: #059669; font-weight: 600;">${downloadLink}</a>
                 </div>`
              : `<div style="font-size: 12px; color: #d97706; background: #fef3c7; padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 4px; font-weight: 600;">
                  ⚡ এটি একটি প্রিমিয়াম অ্যাক্টিভেশন সার্ভিস। আমাদের প্রতিনিধি খুব শীঘ্রই আপনার ইমেইল/হোয়াটসঅ্যাপে অ্যাক্টিভেশন সম্পন্ন করবেন।
                 </div>`
          }
          ${
            previewLink
              ? `<div style="margin-top: 8px; font-size: 12px;">
                  <a href="${previewLink}" target="_blank" style="color: #2563eb; text-decoration: underline; font-weight: 600;">
                    🔗 লাইভ প্রিভিউ / ডেমো দেখুন
                  </a>
                 </div>`
              : ''
          }
        </td>
        <td style="padding: 16px 12px; vertical-align: top; text-align: right; font-weight: 700; color: #0f172a; font-size: 15px; white-space: nowrap;">
          ${(item.price || 0) * (item.quantity || 1)} ৳
        </td>
      </tr>
    `;
    })
    .join('');

  return `
<!DOCTYPE html>
<html lang="bn">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmation & Digital Product Delivery — Nasir Digital Hub</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #1e293b;">
  <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f8fafc; padding: 24px 12px;">
    <tr>
      <td align="center">
        <!-- Main Card Container -->
        <table width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08); border: 1px solid #e2e8f0;">
          
          <!-- Gradient Header with English Brand Name -->
          <tr>
            <td style="background: linear-gradient(135deg, #0f172a 0%, #064e3b 100%); padding: 32px 24px; text-align: center; color: #ffffff;">
              <div style="display: inline-block; background: rgba(255, 255, 255, 0.15); border: 1px solid rgba(255, 255, 255, 0.25); border-radius: 9999px; padding: 6px 16px; font-size: 12px; font-weight: 700; color: #a7f3d0; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 0.5px;">
                ✅ Order Delivery & Instant Access
              </div>
              <h1 style="margin: 0; font-size: 26px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">
                Nasir Digital Hub
              </h1>
              <p style="margin: 6px 0 0 0; font-size: 13px; color: #cbd5e1;">
                আপনার অর্ডারকৃত ডিজিটাল পণ্য সফলভাবে ডেলিভার করা হয়েছে
              </p>
            </td>
          </tr>

          <!-- Welcome Body -->
          <tr>
            <td style="padding: 24px 24px 16px 24px;">
              <h2 style="margin: 0 0 8px 0; font-size: 18px; color: #0f172a; font-weight: 700;">
                আসসালামু আলাইকুম, ${customerName || 'সম্মানিত গ্রাহক'}! 👋
              </h2>
              <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #475569;">
                <strong>Nasir Digital Hub</strong> থেকে কেনাকাটা করার জন্য ধন্যবাদ। আপনার অর্ডার সফলভাবে কনফার্ম ও অ্যাপ্রুভ করা হয়েছে। নিচে আপনার ক্রয়কৃত ডিজিটাল প্রোডাক্ট ও অ্যাক্সেস ডাউনলোড লিঙ্ক দেওয়া হলো।
              </p>
            </td>
          </tr>

          <!-- Order Overview Box -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #f1f5f9; border-radius: 12px; padding: 16px; border: 1px solid #e2e8f0;">
                <tr>
                  <td style="font-size: 13px; color: #475569; padding-bottom: 6px;">
                    <strong>📦 অর্ডার আইডি:</strong> <span style="font-family: monospace; color: #0f172a; font-weight: 700;">#${orderId}</span>
                  </td>
                  <td style="font-size: 13px; color: #475569; padding-bottom: 6px; text-align: right;">
                    <strong>💳 ট্রানজেকশন ID:</strong> <span style="font-family: monospace; color: #0f172a;">${transactionId || 'Verified'}</span>
                  </td>
                </tr>
                <tr>
                  <td style="font-size: 13px; color: #475569;">
                    <strong>💰 পরিশোধিত মূল্য:</strong> <span style="color: #059669; font-weight: 700; font-size: 15px;">${amount} ৳</span>
                  </td>
                  <td style="font-size: 13px; color: #475569; text-align: right;">
                    <strong>⚡ পেমেন্ট মেথড:</strong> ${paymentMethod}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Digital Items Table -->
          <tr>
            <td style="padding: 0 24px 16px 24px;">
              <h3 style="margin: 0 0 12px 0; font-size: 15px; color: #0f172a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; border-left: 4px solid #059669; padding-left: 8px;">
                আপনার ডিজিটাল প্রোডাক্টসমূহ
              </h3>
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
                <thead>
                  <tr style="border-bottom: 2px solid #cbd5e1; background-color: #f8fafc;">
                    <th align="left" style="padding: 8px 12px; font-size: 12px; color: #64748b; font-weight: 700;">প্রোডাক্ট বিবরণ ও লিঙ্ক</th>
                    <th align="right" style="padding: 8px 12px; font-size: 12px; color: #64748b; font-weight: 700;">মূল্য</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                </tbody>
              </table>
            </td>
          </tr>

          <!-- Instructions Card -->
          <tr>
            <td style="padding: 0 24px 20px 24px;">
              <table width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color: #ecfdf5; border-radius: 12px; padding: 16px; border: 1px solid #a7f3d0;">
                <tr>
                  <td>
                    <h4 style="margin: 0 0 6px 0; font-size: 14px; color: #065f46; font-weight: 700;">
                      💡 ব্যবহারবিধি ও জরুরি নির্দেশনা:
                    </h4>
                    <ul style="margin: 0; padding-left: 18px; font-size: 12px; color: #047857; line-height: 1.7;">
                      <li>প্রোডাক্টের পাশে থাকা <strong>"ফাইল / লাইসেন্স ডাউনলোড করুন"</strong> বাটনে ক্লিক করে ফাইল সেভ বা অ্যাক্সেস নিন।</li>
                      <li>Canva Pro বা সফটওয়্যার সাবস্ক্রিপশনের ক্ষেত্রে প্রদত্ত ইমেইল লিঙ্ক/ইনভাইটেশন গ্রহণ করুন।</li>
                      <li>ভবিষ্যতে যেকোনো সময় ব্যবহারের সুবিধার্থে এই ইমেইলটি স্টার (Star) বা সেভ করে রাখুন।</li>
                    </ul>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Support & WhatsApp CTA -->
          <tr>
            <td style="padding: 0 24px 24px 24px; text-align: center;">
              <p style="margin: 0 0 12px 0; font-size: 13px; color: #64748b;">
                যেকোনো প্রয়োজনে আমাদের সাথে সরাসরি হোয়াটসঅ্যাপে যোগাযোগ করুন:
              </p>
              <table width="100%" border="0" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center">
                    <a href="${whatsappUrl}" target="_blank" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 10px; font-weight: 700; font-size: 14px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3);">
                      💬 WhatsApp Support (${whatsappNumber})
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #0f172a; padding: 20px 24px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 4px 0; font-weight: 800; color: #f8fafc; font-size: 14px;">
                Nasir Digital Hub
              </p>
              <p style="margin: 0 0 8px 0; color: #64748b; font-size: 12px;">
                Official Support: <a href="mailto:nasirdigitalhub@pipilikhost.com" style="color: #38bdf8; text-decoration: none;">nasirdigitalhub@pipilikhost.com</a>
              </p>
              <p style="margin: 0; color: #475569; font-size: 11px;">
                © ${new Date().getFullYear()} Nasir Digital Hub. All rights reserved.
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
