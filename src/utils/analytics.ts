import { logActivity } from '../firebase/services';
import { ActivityType } from '../types';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

function getDeviceInfo(): string {
  if (typeof window === 'undefined') return 'Unknown';
  const width = window.innerWidth;
  const isMobile = width < 768;
  const ua = navigator.userAgent;
  let browser = 'Browser';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Edge')) browser = 'Edge';

  return `${isMobile ? '📱 Mobile' : '💻 Desktop'} (${browser})`;
}

export const analytics = {
  trackPageView: (path: string, title?: string) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'page_view',
      title: title || `পেজ ভিজিট: ${path}`,
      path,
      device: getDeviceInfo(),
    });
  },

  trackProductView: (productId: string, productTitle: string, price?: number) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'ViewContent', {
          content_name: productTitle,
          content_ids: [productId],
          content_type: 'product',
          value: price || 0,
          currency: 'BDT',
        });
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'product_view',
      title: `পণ্য দেখা হয়েছে: ${productTitle}`,
      productId,
      productTitle,
      path: `/product/${productId}`,
      device: getDeviceInfo(),
    });
  },

  trackAddToCart: (productTitle: string, productId?: string, price?: number) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'AddToCart', {
          content_name: productTitle,
          content_ids: productId ? [productId] : [],
          content_type: 'product',
          value: price || 0,
          currency: 'BDT',
        });
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'add_to_cart',
      title: `কার্টে যোগ করা হয়েছে: ${productTitle}`,
      productTitle,
      productId,
      amount: price,
      device: getDeviceInfo(),
    });
  },

  trackRemoveFromCart: (productTitle: string, productId?: string) => {
    logActivity({
      type: 'remove_from_cart',
      title: `কার্ট থেকে রিমুভ: ${productTitle}`,
      productTitle,
      productId,
      device: getDeviceInfo(),
    });
  },

  trackCheckoutStart: (amount: number, itemCount: number) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'InitiateCheckout', {
          num_items: itemCount,
          value: amount,
          currency: 'BDT',
        });
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'checkout_start',
      title: `চেকআউট শুরু হয়েছে (${itemCount}টি পণ্য)`,
      amount,
      device: getDeviceInfo(),
    });
  },

  trackOrderPlaced: (orderId: string, customerName: string, customerPhone: string, amount: number) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Purchase', {
          value: amount,
          currency: 'BDT',
          order_id: orderId,
        });
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'order_placed',
      title: `নতুন অর্ডার প্লেস হয়েছে (#${orderId.slice(-6)})`,
      orderId,
      customerName,
      customerPhone,
      amount,
      device: getDeviceInfo(),
    });
  },

  trackOrderCancelled: (orderId: string, customerName?: string) => {
    logActivity({
      type: 'order_cancelled',
      title: `অর্ডার বাতিল করা হয়েছে (#${orderId.slice(-6)})`,
      orderId,
      customerName,
      device: getDeviceInfo(),
    });
  },

  trackWhatsAppClick: (productTitle?: string) => {
    try {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'Contact', {
          content_name: productTitle || 'General Support',
        });
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'whatsapp_click',
      title: productTitle ? `হোয়াটসঅ্যাপে অর্ডার অনুসন্ধান: ${productTitle}` : 'হোয়াটসঅ্যাপে চ্যাট শুরু',
      productTitle,
      device: getDeviceInfo(),
    });
  },

  trackDownload: (productTitle: string, productId?: string) => {
    logActivity({
      type: 'direct_download',
      title: `ফ্রি প্রোডাক্ট ডাউনলোড: ${productTitle}`,
      productTitle,
      productId,
      device: getDeviceInfo(),
    });
  },
};
