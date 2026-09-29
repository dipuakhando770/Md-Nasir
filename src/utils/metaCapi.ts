/**
 * Server-Side Meta Conversions API (CAPI) Engine
 * Dataset / Pixel ID: 2547695409029693
 * Documentation: https://developers.facebook.com/docs/marketing-api/conversions-api
 * 
 * Features:
 * - Deterministic event_id deduplication matching browser pixel (e.g. purchase_ORD-12345)
 * - SHA-256 advanced matching for customer data (email, phone, name)
 * - Client IP and User Agent forwarding
 * - Non-blocking execution (errors never break transactions)
 * - Server-side idempotency cache to prevent duplicate CAPI calls
 * - Meta Test Events support via META_TEST_EVENT_CODE
 */

import crypto from 'crypto';

export interface MetaCapiEventPayload {
  eventName: string;
  eventId: string;
  eventTime?: number;
  eventSourceUrl?: string;
  userData?: {
    email?: string;
    phone?: string;
    name?: string;
    clientIp?: string;
    clientUserAgent?: string;
  };
  customData?: {
    value?: number;
    currency?: string;
    content_name?: string;
    content_type?: string;
    content_ids?: string[];
    num_items?: number;
    order_id?: string;
    [key: string]: unknown;
  };
}

// In-memory idempotency set for processed CAPI event IDs
const processedEventIds = new Set<string>();

/**
 * SHA-256 hashing utility conforming to Meta specification
 */
function sha256(value: string): string {
  return crypto.createHash('sha256').update(value.trim()).digest('hex');
}

function hashEmail(email?: string): string | undefined {
  if (!email || typeof email !== 'string') return undefined;
  const clean = email.trim().toLowerCase();
  return clean ? sha256(clean) : undefined;
}

function hashPhone(phone?: string): string | undefined {
  if (!phone || typeof phone !== 'string') return undefined;
  // Meta requires phone numbers to include country code without symbols or leading zeros
  let clean = phone.replace(/\D/g, '');
  if (!clean) return undefined;
  // If Bangladesh local number starting with 01
  if (clean.startsWith('01')) {
    clean = `88${clean}`;
  } else if (!clean.startsWith('880') && clean.length === 10) {
    clean = `880${clean}`;
  }
  return sha256(clean);
}

function hashName(name?: string): string | undefined {
  if (!name || typeof name !== 'string') return undefined;
  const clean = name.trim().toLowerCase();
  return clean ? sha256(clean) : undefined;
}

export async function sendMetaConversionsApiEvent(
  payload: MetaCapiEventPayload
): Promise<{ success: boolean; eventId: string; message?: string; raw?: unknown }> {
  const pixelId = process.env.META_PIXEL_ID || '2547695409029693';
  const accessToken = process.env.META_ACCESS_TOKEN?.trim();
  const testEventCode = process.env.META_TEST_EVENT_CODE?.trim();

  const {
    eventName,
    eventId,
    eventTime = Math.floor(Date.now() / 1000),
    eventSourceUrl = 'https://www.nasirdigitalhub.com/',
    userData = {},
    customData = {},
  } = payload;

  if (!eventId) {
    return { success: false, eventId: '', message: 'Missing eventId' };
  }

  // Idempotency check: if this event was already successfully sent via CAPI, skip it
  if (processedEventIds.has(eventId)) {
    console.log(`[Meta CAPI] Event ${eventId} (${eventName}) already dispatched. Skipping duplicate.`);
    return { success: true, eventId, message: 'Already processed (idempotent)' };
  }

  // Prepare normalized user_data for Meta Advanced Matching
  const metaUserData: Record<string, unknown> = {};

  const hashedEm = hashEmail(userData.email);
  if (hashedEm) metaUserData.em = [hashedEm];

  const hashedPh = hashPhone(userData.phone);
  if (hashedPh) metaUserData.ph = [hashedPh];

  const hashedFn = hashName(userData.name);
  if (hashedFn) metaUserData.fn = [hashedFn];

  if (userData.clientIp) metaUserData.client_ip_address = userData.clientIp;
  if (userData.clientUserAgent) metaUserData.client_user_agent = userData.clientUserAgent;

  // Prepare custom_data
  const metaCustomData: Record<string, unknown> = {
    currency: customData.currency || 'BDT',
    ...customData,
  };

  if (customData.value !== undefined) {
    metaCustomData.value = Math.max(0, Number(customData.value) || 0);
  }

  const eventBody: Record<string, unknown> = {
    event_name: eventName,
    event_time: eventTime,
    event_id: eventId,
    action_source: 'website',
    event_source_url: eventSourceUrl,
    user_data: metaUserData,
    custom_data: metaCustomData,
  };

  // If no META_ACCESS_TOKEN is configured yet, record readiness and return cleanly
  if (!accessToken) {
    processedEventIds.add(eventId);
    console.log(
      `[Meta CAPI] Prepared event: ${eventName} (ID: ${eventId}, Value: ${metaCustomData.value || 0} BDT). ` +
      `To transmit live to Facebook Graph API, add META_ACCESS_TOKEN in server environment.`
    );
    return {
      success: true,
      eventId,
      message: 'Event generated. Awaiting META_ACCESS_TOKEN in environment to dispatch live Graph API.',
    };
  }

  try {
    const apiUrl = `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(
      accessToken
    )}`;

    const requestPayload: Record<string, unknown> = {
      data: [eventBody],
    };

    if (testEventCode) {
      requestPayload.test_event_code = testEventCode;
    }

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestPayload),
      signal: AbortSignal.timeout(6000),
    });

    const responseData: any = await response.json().catch(() => null);

    if (response.ok && responseData?.events_received) {
      processedEventIds.add(eventId);
      console.log(`[Meta CAPI] Successfully sent ${eventName} event to Meta Graph API! (eventId: ${eventId})`);
      return { success: true, eventId, raw: responseData };
    } else {
      console.warn(`[Meta CAPI] Meta Graph API returned error:`, responseData);
      return { success: false, eventId, message: responseData?.error?.message || 'Meta API error', raw: responseData };
    }
  } catch (err: any) {
    console.warn(`[Meta CAPI] Network error sending event:`, err?.message);
    return { success: false, eventId, message: err?.message };
  }
}
