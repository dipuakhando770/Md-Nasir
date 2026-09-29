import { OrderItem } from '../types';
import { db } from '../firebase/config';
import { doc, getDoc, collection, query, where, getDocs, limit } from 'firebase/firestore';

export interface LocalUserOrder {
  orderId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'completed' | 'paid' | 'failed';
  status: 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';
  createdAt: number;
  transactionId?: string;
  lastSyncedAt?: number;
}

export interface LocalCartActivity {
  id: string;
  productId: string;
  title: string;
  price: number;
  imageUrl?: string;
  downloadUrl?: string;
  livePreviewUrl?: string;
  quantity: number;
  timestamp: number;
  action: 'added_to_cart' | 'checked_out' | 'viewed';
}

const USER_ORDERS_STORAGE_KEY = 'ndh_user_order_history_v1';
const USER_CART_HISTORY_STORAGE_KEY = 'ndh_user_cart_activity_v1';

// ==================== USER ORDER HISTORY ====================

export function getUserLocalOrders(): LocalUserOrder[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(USER_ORDERS_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Failed to parse local user orders:', err);
    return [];
  }
}

export function saveUserLocalOrder(order: LocalUserOrder): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getUserLocalOrders();
    const filtered = existing.filter((o) => o.orderId !== order.orderId);
    const updated = [order, ...filtered].slice(0, 50); // keep last 50 orders
    localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ndh_user_orders_updated'));
  } catch (err) {
    console.warn('Failed to save local user order:', err);
  }
}

export function updateUserLocalOrderStatus(
  orderId: string,
  updates: Partial<LocalUserOrder>
): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getUserLocalOrders();
    const updated = existing.map((o) => (o.orderId === orderId ? { ...o, ...updates } : o));
    localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ndh_user_orders_updated'));
  } catch (err) {
    console.warn('Failed to update local user order status:', err);
  }
}

export function clearUserLocalOrders(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_ORDERS_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ndh_user_orders_updated'));
  } catch (err) {
    console.warn('Failed to clear local user orders:', err);
  }
}

// ==================== CART & BROWSING ACTIVITY HISTORY ====================

export function getUserCartHistory(): LocalCartActivity[] {
  if (typeof window === 'undefined') return [];
  try {
    const data = localStorage.getItem(USER_CART_HISTORY_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.warn('Failed to parse local cart history:', err);
    return [];
  }
}

export function saveUserCartActivity(activity: Omit<LocalCartActivity, 'id' | 'timestamp'>): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getUserCartHistory();
    const newActivity: LocalCartActivity = {
      id: `act_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      ...activity,
    };
    // Keep unique recent products or prioritize newest
    const filtered = existing.filter((a) => a.productId !== activity.productId);
    const updated = [newActivity, ...filtered].slice(0, 30);
    localStorage.setItem(USER_CART_HISTORY_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new CustomEvent('ndh_user_cart_history_updated'));
  } catch (err) {
    console.warn('Failed to save cart activity:', err);
  }
}

export function clearUserCartHistory(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(USER_CART_HISTORY_STORAGE_KEY);
    window.dispatchEvent(new CustomEvent('ndh_user_cart_history_updated'));
  } catch (err) {
    console.warn('Failed to clear cart history:', err);
  }
}

// ==================== FIRESTORE REAL-TIME SYNC & LOOKUP ====================

/**
 * Synchronizes all locally stored orders with Firestore in the background.
 * If admin approved, completed, or updated an order in Firestore,
 * this function automatically updates localStorage so user sees live "Approved" status & files!
 */
export async function syncUserOrdersWithFirestore(): Promise<LocalUserOrder[]> {
  const localOrders = getUserLocalOrders();
  if (localOrders.length === 0) return [];

  let hasUpdates = false;
  const updatedOrders: LocalUserOrder[] = [...localOrders];

  for (let i = 0; i < updatedOrders.length; i++) {
    const local = updatedOrders[i];
    try {
      const orderRef = doc(db, 'orders', local.orderId);
      const snap = await getDoc(orderRef);
      if (snap.exists()) {
        const remote = snap.data();
        const remoteStatus = remote.status || local.status;
        const remotePaymentStatus = remote.paymentStatus || local.paymentStatus;
        const remoteTrxId = remote.paymentTrxId || remote.transactionId || local.transactionId;
        const remoteItems = remote.items || local.items;

        if (
          remoteStatus !== local.status ||
          remotePaymentStatus !== local.paymentStatus ||
          remoteTrxId !== local.transactionId
        ) {
          updatedOrders[i] = {
            ...local,
            status: remoteStatus,
            paymentStatus: remotePaymentStatus,
            transactionId: remoteTrxId,
            items: remoteItems,
            lastSyncedAt: Date.now(),
          };
          hasUpdates = true;
        }
      }
    } catch (err) {
      console.warn(`Order sync notice for #${local.orderId}:`, err);
    }
  }

  if (hasUpdates && typeof window !== 'undefined') {
    try {
      localStorage.setItem(USER_ORDERS_STORAGE_KEY, JSON.stringify(updatedOrders));
      window.dispatchEvent(new CustomEvent('ndh_user_orders_updated'));
    } catch {}
  }

  return updatedOrders;
}

/**
 * Live search Firestore by Order ID, Phone number, or Transaction ID.
 * Allows user to track orders made across devices or incognito sessions.
 */
export async function trackRemoteOrder(searchQuery: string): Promise<LocalUserOrder | null> {
  const cleanQuery = searchQuery.trim();
  if (!cleanQuery) return null;

  try {
    // 1. Try direct ID lookup
    const directRef = doc(db, 'orders', cleanQuery);
    const directSnap = await getDoc(directRef);
    if (directSnap.exists()) {
      const data = directSnap.data();
      const mapped: LocalUserOrder = {
        orderId: directSnap.id,
        customerName: data.customerName || 'সম্মানিত গ্রাহক',
        customerPhone: data.customerPhone || '',
        customerEmail: data.customerEmail || data.customerAddress || '',
        customerAddress: data.customerAddress || '',
        note: data.note || '',
        items: data.items || [],
        subtotal: Number(data.subtotal || data.total) || 0,
        deliveryCharge: Number(data.deliveryCharge) || 0,
        total: Number(data.total) || 0,
        paymentMethod: data.paymentMethod || 'Online Payment',
        paymentStatus: data.paymentStatus || 'pending',
        status: data.status || 'pending',
        createdAt: data.createdAt || Date.now(),
        transactionId: data.paymentTrxId || data.transactionId || '',
        lastSyncedAt: Date.now(),
      };
      // Auto-save to local order history
      saveUserLocalOrder(mapped);
      return mapped;
    }

    // 2. Try phone number search
    const cleanPhone = cleanQuery.replace(/[^0-9]/g, '');
    if (cleanPhone.length >= 8) {
      const q = query(collection(db, 'orders'), where('customerPhone', '==', cleanQuery), limit(1));
      const qSnap = await getDocs(q);
      if (!qSnap.empty) {
        const foundDoc = qSnap.docs[0];
        const data = foundDoc.data();
        const mapped: LocalUserOrder = {
          orderId: foundDoc.id,
          customerName: data.customerName || 'সম্মানিত গ্রাহক',
          customerPhone: data.customerPhone || '',
          customerEmail: data.customerEmail || data.customerAddress || '',
          customerAddress: data.customerAddress || '',
          note: data.note || '',
          items: data.items || [],
          subtotal: Number(data.subtotal || data.total) || 0,
          deliveryCharge: Number(data.deliveryCharge) || 0,
          total: Number(data.total) || 0,
          paymentMethod: data.paymentMethod || 'Online Payment',
          paymentStatus: data.paymentStatus || 'pending',
          status: data.status || 'pending',
          createdAt: data.createdAt || Date.now(),
          transactionId: data.paymentTrxId || data.transactionId || '',
          lastSyncedAt: Date.now(),
        };
        saveUserLocalOrder(mapped);
        return mapped;
      }
    }
  } catch (err) {
    console.error('Failed to track remote order:', err);
  }

  return null;
}
