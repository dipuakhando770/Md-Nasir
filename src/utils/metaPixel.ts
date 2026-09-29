/**
 * Centralized Meta Pixel & Conversions API (CAPI) Client Tracking Engine
 * Pixel ID: 2547695409029693
 * Domain: https://www.nasirdigitalhub.com/
 * 
 * Features:
 * - Dynamic product information (no hardcoded prices)
 * - Currency: BDT
 * - Deterministic event_id deduplication between Browser Pixel & Server CAPI
 * - Strict Purchase idempotency (prevents duplicate Purchase events on refresh/back/tabs)
 * - Safe non-blocking execution (analytics never breaks payments or checkout)
 */

import { Product, OrderItem } from '../types';

export const META_PIXEL_ID = '2547695409029693';

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    _fbq?: any;
  }
}

// Track route path to avoid duplicate PageView on re-renders
let lastTrackedPageViewPath = '';
let lastTrackedPageViewTime = 0;

/**
 * Dispatches a server-side Conversions API (CAPI) event non-blockingly
 */
async function sendServerCapiEvent(payload: {
  eventName: string;
  eventId: string;
  eventSourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    name?: string;
  };
  customData?: Record<string, unknown>;
}): Promise<void> {
  try {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://www.nasirdigitalhub.com';
    const sourceUrl = payload.eventSourceUrl || (typeof window !== 'undefined' ? window.location.href : origin);

    await fetch('/api/meta-conversions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        eventName: payload.eventName,
        eventId: payload.eventId,
        eventSourceUrl: sourceUrl,
        userData: payload.userData || {},
        customData: payload.customData || {},
      }),
      // Keepalive allows the request to complete even if user navigates
      keepalive: true,
    }).catch((err) => {
      // Non-blocking CAPI notice
      if (process.env.NODE_ENV !== 'production') {
        console.warn('Meta CAPI client dispatch notice:', err);
      }
    });
  } catch (err) {
    // Non-blocking catch
  }
}

export const metaPixel = {
  /**
   * Track PageView
   * Prevents duplicate firing on the same route within 1.5 seconds
   */
  trackPageView: (pathname?: string) => {
    try {
      const currentPath =
        pathname || (typeof window !== 'undefined' ? window.location.pathname : '/');
      const now = Date.now();

      // Deduplicate rapid re-render PageViews for the exact same path
      if (currentPath === lastTrackedPageViewPath && now - lastTrackedPageViewTime < 1500) {
        return;
      }

      lastTrackedPageViewPath = currentPath;
      lastTrackedPageViewTime = now;

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq('track', 'PageView');
      }
    } catch (e) {
      // Safe non-blocking error handler
    }
  },

  /**
   * Track ViewContent on Product Page
   * Uses real dynamic product data from database/catalog
   */
  trackViewContent: (product: Product) => {
    try {
      if (!product || !product.id) return;

      const price = Math.max(0, Number(product.price) || 0);
      const eventId = `view_${product.id}_${Date.now()}`;

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'ViewContent',
          {
            content_ids: [product.id],
            content_name: product.title,
            content_type: 'product',
            value: price,
            currency: 'BDT',
          },
          { eventID: eventId }
        );
      }

      // Optional Server CAPI for ViewContent
      sendServerCapiEvent({
        eventName: 'ViewContent',
        eventId,
        customData: {
          content_ids: [product.id],
          content_name: product.title,
          content_type: 'product',
          value: price,
          currency: 'BDT',
        },
      });
    } catch (e) {
      // Safe non-blocking error handler
    }
  },

  /**
   * Track AddToCart
   * Triggered ONLY when customer actually adds a product to cart
   */
  trackAddToCart: (product: Product, quantity = 1) => {
    try {
      if (!product || !product.id) return;

      const qty = Math.max(1, Number(quantity) || 1);
      const unitPrice = Math.max(0, Number(product.price) || 0);
      const totalValue = unitPrice * qty;
      const eventId = `cart_${product.id}_${Date.now()}`;

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'AddToCart',
          {
            content_ids: [product.id],
            content_name: product.title,
            content_type: 'product',
            value: totalValue,
            currency: 'BDT',
            quantity: qty,
          },
          { eventID: eventId }
        );
      }

      sendServerCapiEvent({
        eventName: 'AddToCart',
        eventId,
        customData: {
          content_ids: [product.id],
          content_name: product.title,
          content_type: 'product',
          value: totalValue,
          currency: 'BDT',
          quantity: qty,
        },
      });
    } catch (e) {
      // Safe non-blocking error handler
    }
  },

  /**
   * Track InitiateCheckout
   * Triggered when customer starts checkout process with dynamic items and total
   */
  trackInitiateCheckout: (
    items: { productId: string; price: number; quantity?: number; title?: string }[],
    totalAmount: number
  ) => {
    try {
      const cleanAmount = Math.max(0, Number(totalAmount) || 0);
      const contentIds = items.map((i) => i.productId).filter(Boolean);
      const numItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
      const eventId = `checkout_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'InitiateCheckout',
          {
            content_ids: contentIds,
            content_type: 'product',
            value: cleanAmount,
            currency: 'BDT',
            num_items: numItems,
          },
          { eventID: eventId }
        );
      }

      sendServerCapiEvent({
        eventName: 'InitiateCheckout',
        eventId,
        customData: {
          content_ids: contentIds,
          content_type: 'product',
          value: cleanAmount,
          currency: 'BDT',
          num_items: numItems,
        },
      });
    } catch (e) {
      // Safe non-blocking error handler
    }
  },

  /**
   * Track Purchase — CRITICAL
   * Conditions:
   * 1. ONLY fired after backend confirms payment is completed/verified.
   * 2. NEVER fired on click, pending, failed, or cancelled states.
   * 3. Uses actual customer-paid amount dynamically (never hardcoded 299).
   * 4. Deduplication: deterministic unique eventID `purchase_${orderId}`.
   * 5. Multi-layer deduplication guard prevents duplicate events on refresh, tab reopens, back/forward.
   */
  trackPurchase: (orderData: {
    orderId: string;
    amount: number;
    items: OrderItem[];
    customerEmail?: string;
    customerPhone?: string;
    customerName?: string;
    paymentMethod?: string;
    transactionId?: string;
  }) => {
    try {
      const {
        orderId,
        amount,
        items = [],
        customerEmail,
        customerPhone,
        customerName,
      } = orderData;

      if (!orderId) {
        console.warn('Meta Pixel: Cannot track Purchase without a valid orderId.');
        return;
      }

      // Check local deduplication storage
      const dedupKey = `meta_purchase_tracked_${orderId}`;
      if (typeof window !== 'undefined') {
        try {
          const alreadyTrackedLocal = localStorage.getItem(dedupKey);
          const alreadyTrackedSession = sessionStorage.getItem(dedupKey);
          if (alreadyTrackedLocal || alreadyTrackedSession) {
            console.log(`[Meta Pixel] Purchase for order #${orderId} already tracked. Skipping duplicate.`);
            return;
          }

          // Mark as tracked immediately before firing to avoid race conditions
          localStorage.setItem(dedupKey, String(Date.now()));
          sessionStorage.setItem(dedupKey, String(Date.now()));
        } catch {
          // Ignore storage quota limits
        }
      }

      const deterministicEventId = `purchase_${orderId}`;
      const actualPaidAmount = Math.max(0, Number(amount) || 0);
      const contentIds = items.map((item) => item.productId).filter(Boolean);
      const numItems = items.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);

      // 1. Browser Pixel Purchase Event
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        window.fbq(
          'track',
          'Purchase',
          {
            value: actualPaidAmount,
            currency: 'BDT',
            content_ids: contentIds,
            content_type: 'product',
            num_items: numItems,
            order_id: orderId,
          },
          {
            eventID: deterministicEventId,
          }
        );
      }

      // 2. Server-Side Conversions API (CAPI) Purchase Event
      // Uses the EXACT SAME deterministicEventId for Meta event deduplication
      sendServerCapiEvent({
        eventName: 'Purchase',
        eventId: deterministicEventId,
        userData: {
          email: customerEmail,
          phone: customerPhone,
          name: customerName,
        },
        customData: {
          value: actualPaidAmount,
          currency: 'BDT',
          content_ids: contentIds,
          content_type: 'product',
          num_items: numItems,
          order_id: orderId,
        },
      });

      console.log(`[Meta Pixel + CAPI] Purchase tracked successfully for order #${orderId} (Amount: ${actualPaidAmount} BDT, eventID: ${deterministicEventId})`);
    } catch (err) {
      console.warn('Meta Pixel Purchase tracking error:', err);
    }
  },
};
