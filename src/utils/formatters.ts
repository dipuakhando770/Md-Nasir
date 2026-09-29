import { CartItem, Product } from '../types';

/**
 * Transforms any Google Drive share/view/edit URL or Dropbox URL into a direct, high-speed, CORS-friendly image URL
 */
export function formatGoogleDriveImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';

  // Already a Google Drive direct CDN image URL
  if (/^https?:\/\/lh3\.googleusercontent\.com\/d\/[a-zA-Z0-9_-]+/i.test(trimmed)) {
    return trimmed;
  }

  // Google Drive standard links: /file/d/..., ?id=..., /d/...
  if (/drive\.google\.com|docs\.google\.com/i.test(trimmed)) {
    let fileId = '';

    // Match /file/d/{FILE_ID}
    const matchFileD = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]{15,})/i);
    if (matchFileD && matchFileD[1]) {
      fileId = matchFileD[1];
    } else {
      // Match id={FILE_ID}
      const matchId = trimmed.match(/[?&]id=([a-zA-Z0-9_-]{15,})/i);
      if (matchId && matchId[1]) {
        fileId = matchId[1];
      } else {
        // Match /d/{FILE_ID}
        const matchD = trimmed.match(/\/d\/([a-zA-Z0-9_-]{15,})/i);
        if (matchD && matchD[1]) {
          fileId = matchD[1];
        }
      }
    }

    if (fileId) {
      // Direct high-resolution Google Drive CDN image endpoint
      return `https://lh3.googleusercontent.com/d/${fileId}`;
    }
  }

  // Dropbox direct link transformation (?dl=0 -> ?raw=1)
  if (/dropbox\.com/i.test(trimmed)) {
    return trimmed.replace(/[?&]dl=0/i, '?raw=1').replace(/[?&]dl=1/i, '?raw=1');
  }

  return trimmed;
}

/**
 * Normalizes all image URLs across the application
 */
export function normalizeImageUrl(url: string | undefined | null): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('data:') || trimmed.startsWith('blob:')) return trimmed;
  return formatGoogleDriveImageUrl(trimmed);
}

export function formatPrice(price: number | undefined | null): string {
  if (price === undefined || price === null || isNaN(Number(price))) return '৳০';
  const validPrice = Math.max(0, Number(price));
  return `৳${validPrice.toLocaleString('en-US')}`;
}

export function isProductFree(product: Pick<Product, 'isFree' | 'price'>): boolean {
  return Boolean(product.isFree);
}

export function triggerFreeProductDownload(product: Product): void {
  const rawUrl = (product.downloadUrl || '').trim();
  if (rawUrl) {
    const normalizedUrl = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    const link = document.createElement('a');
    link.href = normalizedUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('download', `${product.slug || 'free-product'}`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return;
  }

  // Fallback instant digital access file download if no external URL was entered
  const content = [
    `====================================================`,
    `Nasir Digital Hub — Free Product Instant Download`,
    `====================================================`,
    `Product: ${product.title}`,
    `Product ID: ${product.id}`,
    `Price: FREE (100% Free Download - No Payment Required)`,
    product.livePreviewUrl ? `Live Preview / Demo URL: ${product.livePreviewUrl}` : '',
    `----------------------------------------------------`,
    `Description / Access Details:`,
    product.description || product.shortDescription || 'Thank you for downloading this free product!',
    `====================================================`,
  ]
    .filter(Boolean)
    .join('\n');

  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const blobUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = blobUrl;
  link.download = `${product.slug || 'free-product'}-access.txt`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(blobUrl), 3000);
}

export function calculateDiscount(price: number, oldPrice?: number): number {
  if (!oldPrice || isNaN(Number(oldPrice)) || oldPrice <= price || oldPrice <= 0) return 0;
  const validPrice = Math.max(0, Number(price));
  const validOld = Math.max(0, Number(oldPrice));
  if (validOld <= validPrice) return 0;
  return Math.min(100, Math.max(0, Math.round(((validOld - validPrice) / validOld) * 100)));
}

export function formatDate(timestamp: number): string {
  if (!timestamp || isNaN(Number(timestamp))) return '';
  try {
    const d = new Date(Number(timestamp));
    return d.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return '';
  }
}

/**
 * Validates and standardizes a Bangladeshi / International WhatsApp phone number
 */
export function sanitizeWhatsAppNumber(rawNumber: string, defaultNumber = '01864368912'): string {
  if (!rawNumber || typeof rawNumber !== 'string') return defaultNumber.replace(/[^0-9]/g, '');
  const digits = rawNumber.replace(/[^0-9]/g, '');
  
  // Must have a reasonable length (8 to 15 digits)
  if (digits.length < 8 || digits.length > 15) {
    const cleanDefault = defaultNumber.replace(/[^0-9]/g, '');
    return cleanDefault.startsWith('88') ? cleanDefault : `88${cleanDefault}`;
  }

  return digits.startsWith('88') ? digits : `88${digits}`;
}

/**
 * Strips dangerous control characters and truncates string safely
 */
function sanitizeText(input: string | undefined | null, maxLength = 300): string {
  if (!input || typeof input !== 'string') return '';
  return input
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // remove control chars
    .trim()
    .slice(0, maxLength);
}

export function generateWhatsAppOrderUrl(
  whatsappNumber: string,
  customer: {
    name: string;
    phone: string;
    address?: string;
    note?: string;
    paymentMethod?: string;
  },
  items: CartItem[],
  subtotal: number,
  deliveryCharge: number,
  total: number
): string {
  const targetNumber = sanitizeWhatsAppNumber(whatsappNumber);

  let itemsList = '';
  items.slice(0, 50).forEach((item, index) => {
    const cleanTitle = sanitizeText(item.product.title, 100);
    const qty = Math.max(1, Math.min(999, Number(item.quantity) || 1));
    const price = Math.max(0, Number(item.product.price) || 0);
    const itemTotal = price * qty;
    itemsList += `${index + 1}. *${cleanTitle}*\n   পরিমাণ: ${qty}টি | মূল্য: ${formatPrice(price)} (মোট: ${formatPrice(itemTotal)})\n`;
  });

  const safeName = sanitizeText(customer.name, 100) || 'সম্মানিত ক্রেতা';
  const safePhone = sanitizeText(customer.phone, 30) || 'N/A';
  const safeAddress = sanitizeText(customer.address, 200) || 'ডিজিটাল ডেলিভারি (Online)';
  const safePaymentMethod = sanitizeText(customer.paymentMethod, 50) || 'bKash / Nagad';
  const safeNote = sanitizeText(customer.note, 300) || 'অনলাইন ডেলিভারি প্রয়োজন';

  const message = `🛍️ *নতুন অর্ডার রিকোয়েস্ট (Nasir Digital Hub)*
-----------------------------------
👤 *কাস্টমার তথ্য:*
• নাম: ${safeName}
• ফোন: ${safePhone}
• ঠিকানা: ${safeAddress}
• পেমেন্ট মেথড: ${safePaymentMethod}

📦 *অর্ডারকৃত পণ্যসমূহ:*
${itemsList || 'কোনো পণ্য নেই'}
-----------------------------------
💰 *হিসাব:*
• সাবটোটাল: ${formatPrice(subtotal)}
• ডেলিভারি চার্জ: ${formatPrice(deliveryCharge)}
• *সর্বমোট প্রদেয়:* ${formatPrice(total)}

📝 *বিশেষ নোট:* ${safeNote}
-----------------------------------
ধন্যবাদ! অনুগ্রহ করে আমার অর্ডারটি কনফার্ম করুন।`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}

export function generateDirectWhatsAppProductUrl(
  whatsappNumber: string,
  product: Product,
  quantity = 1
): string {
  const targetNumber = sanitizeWhatsAppNumber(whatsappNumber);
  const qty = Math.max(1, Math.min(999, Number(quantity) || 1));
  const price = Math.max(0, Number(product.price) || 0);
  const total = price * qty;
  const cleanTitle = sanitizeText(product.title, 120);

  const message = `👋 *আসসালামু আলাইকুম!*
আমি Nasir Digital Hub থেকে এই পণ্যটি কিনতে আগ্রহী:

🛍️ *পণ্য:* ${cleanTitle}
💰 *মূল্য:* ${formatPrice(price)}
🔢 *পরিমাণ:* ${qty}টি
💵 *মোট:* ${formatPrice(total)}
🔗 *টাইপ:* ${product.type === 'digital' ? 'ডিজিটাল প্রোডাক্ট (Instant Access)' : 'ফিজিক্যাল প্রোডাক্ট'}

অনুগ্রহ করে আমাকে বিস্তারিত ও পেমেন্ট প্রসেস জানান। ধন্যবাদ!`;

  return `https://wa.me/${targetNumber}?text=${encodeURIComponent(message)}`;
}
