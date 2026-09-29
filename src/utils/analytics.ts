import { logActivity } from '../firebase/services';
import { ActivityType, OrderItem, Product } from '../types';
import { metaPixel } from './metaPixel';

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
    // 1. Meta Pixel PageView (with duplicate prevention)
    metaPixel.trackPageView(path);

    // 2. Real-time Firebase Activity log
    logActivity({
      type: 'page_view',
      title: title || `পেজ ভিজিট: ${path}`,
      path,
      device: getDeviceInfo(),
    });
  },

  trackProductView: (product: { id: string; title: string; price?: number; slug?: string } | Product) => {
    // 1. Meta Pixel + CAPI ViewContent
    metaPixel.trackViewContent(product as Product);

    // 2. Real-time Firebase Activity log
    logActivity({
      type: 'product_view',
      title: `পণ্য দেখা হয়েছে: ${product.title}`,
      productId: product.id,
      productTitle: product.title,
      path: `/product/${product.slug || product.id}`,
      amount: product.price,
      device: getDeviceInfo(),
    });
  },

  trackAddToCart: (product: Product, quantity = 1) => {
    // 1. Meta Pixel + CAPI AddToCart
    metaPixel.trackAddToCart(product, quantity);

    // 2. Real-time Firebase Activity log
    logActivity({
      type: 'add_to_cart',
      title: `কার্টে যোগ করা হয়েছে: ${product.title}`,
      productTitle: product.title,
      productId: product.id,
      amount: (product.price || 0) * quantity,
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

  trackCheckoutStart: (
    items: { productId: string; price: number; quantity?: number; title?: string }[],
    totalAmount: number
  ) => {
    // 1. Meta Pixel + CAPI InitiateCheckout
    metaPixel.trackInitiateCheckout(items, totalAmount);

    // 2. Real-time Firebase Activity log
    logActivity({
      type: 'checkout_start',
      title: `চেকআউট শুরু হয়েছে (${items.length}টি পণ্য)`,
      amount: totalAmount,
      device: getDeviceInfo(),
    });
  },

  /**
   * Internal order placement logger.
   * NOTE: Does NOT fire Meta Purchase. Purchase is strictly reserved for verified payment success.
   */
  trackOrderPlaced: (orderId: string, customerName: string, customerPhone: string, amount: number) => {
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

  /**
   * CRITICAL: Track verified successful purchase.
   * Fired ONLY after backend or payment gateway confirms order status is PAID / COMPLETED.
   */
  trackOrderPaid: (orderData: {
    orderId: string;
    amount: number;
    items: OrderItem[];
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    paymentMethod?: string;
    transactionId?: string;
  }) => {
    // 1. Meta Pixel + CAPI Purchase (with strict deduplication and deterministic eventID)
    metaPixel.trackPurchase(orderData);

    // 2. Real-time Firebase Activity log
    logActivity({
      type: 'order_placed',
      title: `পেমেন্ট সম্পন্ন ও অর্ডার ডেলিভারি (#${orderData.orderId.slice(-6)})`,
      orderId: orderData.orderId,
      customerName: orderData.customerName,
      customerPhone: orderData.customerPhone,
      amount: orderData.amount,
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
        window.fbq('trackCustom', 'WhatsAppContact', {
          content_name: productTitle || 'General Support',
        });
      }
    } catch {
      // Ignore fbq errors
    }

    logActivity({
      type: 'whatsapp_click',
      title: `হোয়াটসঅ্যাপে যোগাযোগ: ${productTitle || 'সরাসরি হেল্পলাইন'}`,
      productTitle,
      device: getDeviceInfo(),
    });
  },

  trackDirectDownload: (productTitle: string, productId?: string) => {
    logActivity({
      type: 'direct_download',
      title: `সরাসরি ডাউনলোড শুরু: ${productTitle}`,
      productTitle,
      productId,
      device: getDeviceInfo(),
    });
  },
};
