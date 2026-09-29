import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  Unsubscribe,
  limit,
} from 'firebase/firestore';
import { ref, set, update, remove, onValue, off } from 'firebase/database';
import { db, rtdb } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import { Product, Category, StoreSettings, HomepageSection, Benefit, Campaign, Order } from '../types';
import { DEFAULT_HD_HERO_SLIDES } from '../constants/defaultBanners';

// ==================== STORE SETTINGS ====================
export const defaultStoreSettings: StoreSettings = {
  websiteName: 'Nasir Digital Hub',
  description: 'বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, প্রিমিয়াম সাবস্ক্রিপশন, ডিজাইন ও ভিডিও টেমপ্লেট এবং অনলাইন টুলস এর বিশ্বস্ত প্রতিষ্ঠান।',
  tagline: 'প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস',
  metaTitle: 'Nasir Digital Hub — প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস',
  metaDescription:
    'Nasir Digital Hub — বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, Canva Pro, প্রিমিয়াম সাবস্ক্রিপশন, ডিজাইন টেমপ্লেট ও অনলাইন টুলস এর বিশ্বস্ত মার্কেটপ্লেস। ইন্সট্যান্ট ডেলিভারি ও ২৪/৭ সাপোর্ট।',
  metaKeywords:
    'Nasir Digital Hub, ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, প্রিমিয়াম সাবস্ক্রিপশন, Canva Pro Bangladesh, Digital Product Shop BD, গ্রাফিক টেমপ্লেট, ভিডিও এডিটিং বান্ডেল, পিসি সফটওয়্যার, মোবাইল অ্যাপ',
  ogImageUrl: '',
  hideHeaderTitle: true,
  whatsappNumber: '01962780922',
  deliveryCharge: 0,
  paybd: {
    enabled: true,
    apiKey: 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ',
    secretKey: 'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg',
    brandKey: 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ',
    gatewayUrl: 'https://app-paybd.pipilikhost.com/api/payment/create',
  },
  smtp: {
    enabled: true,
    senderEmail: 'nasirdigitalhub@pipilikhost.com',
    senderName: 'Nasir Digital Hub',
    smtpHost: 'smtp.hostinger.com',
    smtpPort: 465,
    smtpUser: 'nasirdigitalhub@pipilikhost.com',
    secure: true,
    notifyAdmin: true,
    adminNotificationEmail: 'nasirdigitalhub@pipilikhost.com',
  },
  logoUrl: '',
  loadingLogoUrl: '',
  faviconUrl: '',
  heroMediaUrl: '',
  heroMediaType: 'image',
  heroHeadline: 'আপনার প্রয়োজনীয় ডিজিটাল সম্পদ এক জায়গায়',
  heroSubtitle: 'জেনুইন লাইসেন্স, লাইফটাইম অ্যাক্সেস ও ইন্সট্যান্ট ডেলিভারির প্রিমিয়াম কালেকশন। সম্পূর্ণ নিরাপদ এবং বিশ্বস্ত সেবা।',
  heroBadge: '🔥 বাংলাদেশের বিশ্বস্ত ডিজিটাল হাব',
  heroPrimaryCtaText: 'এখনই শপ করুন',
  heroPrimaryCtaLink: '#shop',
  heroSecondaryCtaText: 'অফারগুলো দেখুন',
  heroSecondaryCtaLink: '#discount',
  heroAutoSlide: true,
  heroSlideInterval: 4,
  heroSlides: DEFAULT_HD_HERO_SLIDES,
  announcement: {
    enabled: true,
    text: '🔥 আজকের বিশেষ অফার — সীমিত সময়ের জন্য বিশেষ ছাড়!',
    link: '#discount',
  },
  heroProductIds: {
    leftTop: '',
    leftBottom: '',
    rightTop: '',
    rightBottom: '',
  },
  primaryColor: '#6366f1',
  secondaryColor: '#ec4899',
  facebookUrl: 'https://facebook.com',
  youtubeUrl: 'https://youtube.com',
  telegramUrl: 'https://t.me',
  email: 'info@nasirdigitalhub.com',
  address: 'ঢাকা, বাংলাদেশ',
};

const LOCAL_SETTINGS_CACHE_KEY = 'nasir_store_settings_v2';

function cleanFirestoreData<T>(input: T): T {
  if (Array.isArray(input)) {
    return input.map((item) => cleanFirestoreData(item)) as unknown as T;
  }
  if (input !== null && typeof input === 'object') {
    const cleaned: Record<string, unknown> = {};
    Object.entries(input as Record<string, unknown>).forEach(([key, val]) => {
      if (val !== undefined) {
        cleaned[key] = cleanFirestoreData(val);
      }
    });
    return cleaned as T;
  }
  return input;
}

function getCachedStoreSettings(): Partial<StoreSettings> {
  try {
    const raw = localStorage.getItem(LOCAL_SETTINGS_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore storage errors
  }
  return {};
}

function saveCachedStoreSettings(data: Partial<StoreSettings>) {
  try {
    const existing = getCachedStoreSettings();
    localStorage.setItem(LOCAL_SETTINGS_CACHE_KEY, JSON.stringify({ ...existing, ...data }));
  } catch {
    // ignore storage errors
  }
}

export function getInitialStoreSettings(): StoreSettings {
  const cached = getCachedStoreSettings();
  return { ...defaultStoreSettings, ...cached };
}

function removeOuterBlackBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number
) {
  try {
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const isDark = (idx: number, threshold = 20) =>
      data[idx] <= threshold && data[idx + 1] <= threshold && data[idx + 2] <= threshold;

    // Check 4 corners to see if logo has a solid black background
    const corners = [
      0,
      (width - 1) * 4,
      (height - 1) * width * 4,
      ((height - 1) * width + (width - 1)) * 4,
    ];
    const darkCorners = corners.filter((c) => isDark(c, 18) && data[c + 3] > 200).length;
    if (darkCorners < 3) return;

    const visited = new Uint8Array(width * height);
    const queue = new Int32Array(width * height);
    let head = 0;
    let tail = 0;

    const pushIfDark = (x: number, y: number) => {
      const pos = y * width + x;
      if (visited[pos]) return;
      const idx = pos * 4;
      if (isDark(idx, 24)) {
        visited[pos] = 1;
        queue[tail++] = pos;
      }
    };

    for (let x = 0; x < width; x++) {
      pushIfDark(x, 0);
      pushIfDark(x, height - 1);
    }
    for (let y = 0; y < height; y++) {
      pushIfDark(0, y);
      pushIfDark(width - 1, y);
    }

    while (head < tail) {
      const pos = queue[head++];
      const idx = pos * 4;
      data[idx + 3] = 0; // Make background transparent

      const x = pos % width;
      const y = (pos - x) / width;

      if (x > 0) pushIfDark(x - 1, y);
      if (x + 1 < width) pushIfDark(x + 1, y);
      if (y > 0) pushIfDark(x, y - 1);
      if (y + 1 < height) pushIfDark(x, y + 1);
    }

    // Smooth anti-aliased edge pixels adjacent to transparent background
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const pos = y * width + x;
        if (visited[pos]) continue;
        if (
          visited[pos - 1] ||
          visited[pos + 1] ||
          visited[pos - width] ||
          visited[pos + width]
        ) {
          const idx = pos * 4;
          const maxChannel = Math.max(data[idx], data[idx + 1], data[idx + 2]);
          if (maxChannel < 50) {
            data[idx + 3] = Math.min(data[idx + 3], maxChannel * 5);
          }
        }
      }
    }

    ctx.putImageData(imgData, 0, 0);
  } catch {
    // ignore canvas pixel errors
  }
}

export async function compactDataUrl(
  dataUrl: string,
  maxChars: number,
  maxDim: number,
  preserveAlpha = true
): Promise<string> {
  if (!dataUrl || !dataUrl.startsWith('data:image/')) {
    return dataUrl || '';
  }
  const needsAlphaCleanup = preserveAlpha && dataUrl.startsWith('data:image/jpeg');
  if (dataUrl.length <= maxChars && !needsAlphaCleanup) {
    return dataUrl;
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        let width = img.width || 300;
        let height = img.height || 300;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const encodeAtSize = (w: number, h: number): string => {
          const canvas = document.createElement('canvas');
          canvas.width = Math.max(16, Math.round(w));
          canvas.height = Math.max(16, Math.round(h));
          const ctx = canvas.getContext('2d');
          if (!ctx) return dataUrl;

          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

          if (preserveAlpha) {
            removeOuterBlackBackground(ctx, canvas.width, canvas.height);
          }

          const mime = preserveAlpha ? 'image/webp' : 'image/jpeg';
          let q = 0.8;
          let out = canvas.toDataURL(mime, q);

          // Fallback if browser does not encode image/webp
          if (preserveAlpha && !out.startsWith('data:image/webp')) {
            out = canvas.toDataURL('image/png');
            if (out.length > maxChars) {
              // Convert to white-backed JPEG if PNG exceeds maxChars
              const jpgCanvas = document.createElement('canvas');
              jpgCanvas.width = canvas.width;
              jpgCanvas.height = canvas.height;
              const jCtx = jpgCanvas.getContext('2d');
              if (jCtx) {
                jCtx.fillStyle = '#0f172a';
                jCtx.fillRect(0, 0, jpgCanvas.width, jpgCanvas.height);
                jCtx.drawImage(canvas, 0, 0);
                out = jpgCanvas.toDataURL('image/jpeg', 0.75);
              }
            }
          } else {
            while (out.length > maxChars && q > 0.35) {
              q -= 0.12;
              out = canvas.toDataURL(mime, q);
            }
          }
          return out;
        };

        let result = encodeAtSize(width, height);
        let scaleAttempt = 0;
        while (result.length > maxChars && scaleAttempt < 5) {
          width = Math.max(32, Math.round(width * 0.75));
          height = Math.max(32, Math.round(height * 0.75));
          result = encodeAtSize(width, height);
          scaleAttempt++;
        }

        resolve(result.length <= maxChars ? result : '');
      } catch {
        resolve(dataUrl.length <= maxChars ? dataUrl : '');
      }
    };
    img.onerror = () => resolve(dataUrl.length <= maxChars ? dataUrl : '');
    img.src = dataUrl;
  });
}

function normalizeSettingsFromFirestore(raw: Record<string, unknown>): StoreSettings {
  const ann = (raw.announcement as Record<string, unknown>) || {};
  const restoredLogo =
    (typeof ann._logoData === 'string' && ann._logoData) ||
    (typeof raw.logoUrl === 'string' && raw.logoUrl) ||
    '';
  const restoredLoadingLogo =
    (typeof ann._loadingLogoData === 'string' && ann._loadingLogoData) ||
    (typeof raw.loadingLogoUrl === 'string' && raw.loadingLogoUrl) ||
    '';
  const restoredFavicon =
    (typeof ann._faviconData === 'string' && ann._faviconData) ||
    (typeof raw.faviconUrl === 'string' && raw.faviconUrl) ||
    '';
  const restoredOgImage =
    (typeof ann._ogImageData === 'string' && ann._ogImageData) ||
    (typeof raw.ogImageUrl === 'string' && raw.ogImageUrl) ||
    '';
  const restoredMetaTitle =
    (typeof ann._metaTitle === 'string' && ann._metaTitle) ||
    (typeof raw.metaTitle === 'string' && raw.metaTitle) ||
    defaultStoreSettings.metaTitle;
  const restoredMetaDescription =
    (typeof ann._metaDescription === 'string' && ann._metaDescription) ||
    (typeof raw.metaDescription === 'string' && raw.metaDescription) ||
    defaultStoreSettings.metaDescription;
  const restoredMetaKeywords =
    (typeof ann._metaKeywords === 'string' && ann._metaKeywords) ||
    (typeof raw.metaKeywords === 'string' && raw.metaKeywords) ||
    defaultStoreSettings.metaKeywords;
  const restoredHideHeaderTitle =
    typeof ann._hideHeaderTitle === 'boolean'
      ? ann._hideHeaderTitle
      : typeof raw.hideHeaderTitle === 'boolean'
        ? raw.hideHeaderTitle
        : true;

  const cleanAnn = {
    enabled: typeof ann.enabled === 'boolean' ? ann.enabled : true,
    text: typeof ann.text === 'string' ? ann.text : '',
    link: typeof ann.link === 'string' ? ann.link : '#discount',
  };

  return {
    ...defaultStoreSettings,
    ...(raw as unknown as StoreSettings),
    announcement: cleanAnn,
    logoUrl: restoredLogo,
    loadingLogoUrl: restoredLoadingLogo,
    faviconUrl: restoredFavicon,
    heroMediaUrl: '',
    ogImageUrl: restoredOgImage,
    metaTitle: restoredMetaTitle,
    metaDescription: restoredMetaDescription,
    metaKeywords: restoredMetaKeywords,
    hideHeaderTitle: restoredHideHeaderTitle,
  };
}

export function subscribeToStoreSettings(
  onSuccess: (settings: StoreSettings) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'settings/store';
  const docRef = doc(db, 'settings', 'store');
  return onSnapshot(
    docRef,
    (snapshot) => {
      const cached = getCachedStoreSettings();
      if (snapshot.exists()) {
        const normalized = normalizeSettingsFromFirestore(snapshot.data() as Record<string, unknown>);
        const merged = {
          ...defaultStoreSettings,
          ...cached,
          ...normalized,
        };
        saveCachedStoreSettings(merged);
        onSuccess(merged);
      } else {
        onSuccess({ ...defaultStoreSettings, ...cached });
      }
    },
    (error) => {
      const cached = getCachedStoreSettings();
      onSuccess({ ...defaultStoreSettings, ...cached });
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, path);
    }
  );
}

export async function updateStoreSettings(settings: Partial<StoreSettings>): Promise<void> {
  const path = 'settings/store';
  const cached = getCachedStoreSettings();
  const mergedLocal: StoreSettings = {
    ...defaultStoreSettings,
    ...cached,
    ...settings,
    heroMediaUrl: '',
    websiteName:
      (settings.websiteName || cached.websiteName || defaultStoreSettings.websiteName || 'Nasir Digital Hub').slice(0, 150),
    whatsappNumber:
      (settings.whatsappNumber || cached.whatsappNumber || defaultStoreSettings.whatsappNumber || '01962780922').slice(0, 50),
  };

  // Strictly compact all branding images so total document size is guaranteed < 450KB
  const currentLogo = await compactDataUrl(mergedLocal.logoUrl || '', 42000, 360, true);
  const currentLoadingLogo = await compactDataUrl(mergedLocal.loadingLogoUrl || '', 42000, 360, true);
  const currentFavicon = await compactDataUrl(mergedLocal.faviconUrl || '', 12000, 96, true);
  const currentOgImage = await compactDataUrl(mergedLocal.ogImageUrl || '', 50000, 600, false);

  // Strictly compact heroSlides so total slides stay <= 320KB
  const rawSlides = Array.isArray(mergedLocal.heroSlides) ? mergedLocal.heroSlides.slice(0, 12) : [];
  const maxPerSlide = Math.min(75000, Math.floor(320000 / Math.max(1, rawSlides.length)));
  const compactedSlides = await Promise.all(
    rawSlides.map(async (slide, idx) => ({
      ...slide,
      id: String(slide.id || `slide-${idx + 1}`),
      imageUrl: await compactDataUrl(slide.imageUrl || '', maxPerSlide, 820, false),
      sortOrder: typeof slide.sortOrder === 'number' ? slide.sortOrder : idx + 1,
      active: slide.active !== false,
    }))
  );

  mergedLocal.logoUrl = currentLogo;
  mergedLocal.loadingLogoUrl = currentLoadingLogo;
  mergedLocal.faviconUrl = currentFavicon;
  mergedLocal.ogImageUrl = currentOgImage;
  mergedLocal.heroSlides = compactedSlides;

  // Save clean settings to local cache immediately
  saveCachedStoreSettings(mergedLocal);

  // Live firestore.rules isValidUrl() only allows https?:// URLs <= 1900 chars at top-level.
  // Any data:image/... URI MUST be stored inside announcement map and top-level set to ''.
  const isShortHttpUrl = (u: string) => /^https?:\/\/.+/i.test(u) && u.length <= 1900;

  const announcementPayload: Record<string, unknown> = {
    enabled: Boolean(mergedLocal.announcement?.enabled ?? true),
    text: String(mergedLocal.announcement?.text || '').slice(0, 500),
    link: String(mergedLocal.announcement?.link || '#discount').slice(0, 500),
    _logoData: isShortHttpUrl(currentLogo) ? '' : currentLogo,
    _loadingLogoData: currentLoadingLogo,
    _faviconData: isShortHttpUrl(currentFavicon) ? '' : currentFavicon,
    _heroMediaData: '',
    _ogImageData: currentOgImage,
    _metaTitle: String(mergedLocal.metaTitle || '').slice(0, 300),
    _metaDescription: String(mergedLocal.metaDescription || '').slice(0, 2000),
    _metaKeywords: String(mergedLocal.metaKeywords || '').slice(0, 2000),
    _hideHeaderTitle: Boolean(mergedLocal.hideHeaderTitle ?? true),
  };

  // Only include blueprint-sanctioned top-level fields so both legacy and updated firestore.rules pass 100%
  const strictBlueprintPayload = cleanFirestoreData({
    websiteName: mergedLocal.websiteName.slice(0, 150),
    tagline: String(mergedLocal.tagline || '').slice(0, 300),
    description: String(mergedLocal.description || '').slice(0, 5000),
    whatsappNumber: mergedLocal.whatsappNumber.slice(0, 50),
    deliveryCharge: Math.max(0, Number(mergedLocal.deliveryCharge) || 0),
    logoUrl: isShortHttpUrl(currentLogo) ? currentLogo : '',
    faviconUrl: isShortHttpUrl(currentFavicon) ? currentFavicon : '',
    heroMediaUrl: '',
    heroMediaType: mergedLocal.heroMediaType === 'video' ? 'video' : 'image',
    heroHeadline: String(mergedLocal.heroHeadline || '').slice(0, 300),
    heroSubtitle: String(mergedLocal.heroSubtitle || '').slice(0, 1000),
    heroBadge: String(mergedLocal.heroBadge || '').slice(0, 100),
    heroPrimaryCtaText: String(mergedLocal.heroPrimaryCtaText || '').slice(0, 100),
    heroPrimaryCtaLink: String(mergedLocal.heroPrimaryCtaLink || '#shop').slice(0, 200),
    heroSecondaryCtaText: String(mergedLocal.heroSecondaryCtaText || '').slice(0, 100),
    heroSecondaryCtaLink: String(mergedLocal.heroSecondaryCtaLink || '#discount').slice(0, 200),
    heroAutoSlide: Boolean(mergedLocal.heroAutoSlide ?? true),
    heroSlideInterval: Math.max(1, Number(mergedLocal.heroSlideInterval) || 3),
    heroSlides: compactedSlides,
    heroProductIds: mergedLocal.heroProductIds || {
      leftTop: '',
      leftBottom: '',
      rightTop: '',
      rightBottom: '',
    },
    announcement: announcementPayload,
    primaryColor: String(mergedLocal.primaryColor || '#6366f1').slice(0, 50),
    secondaryColor: String(mergedLocal.secondaryColor || '#ec4899').slice(0, 50),
    facebookUrl: String(mergedLocal.facebookUrl || '').slice(0, 500),
    youtubeUrl: String(mergedLocal.youtubeUrl || '').slice(0, 500),
    telegramUrl: String(mergedLocal.telegramUrl || '').slice(0, 500),
    email: String(mergedLocal.email || '').slice(0, 200),
    address: String(mergedLocal.address || '').slice(0, 500),
    updatedAt: Date.now(),
  });

  const docRef = doc(db, 'settings', 'store');
  try {
    // Full document write (without merge: true) so stale 380KB _heroMediaData is completely purged
    await setDoc(docRef, strictBlueprintPayload);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

// ==================== PRODUCTS ====================
const LIVE_PREVIEW_ON_PREFIX = '__live_preview_on__::';
const LIVE_PREVIEW_OFF_PREFIX = '__live_preview_off__::';
const FREE_PRODUCT_ON_TOKEN = '__free_product_on__';
const FREE_PRODUCT_OFF_TOKEN = '__free_product_off__';

function isLivePreviewToken(item: unknown): item is string {
  return (
    typeof item === 'string' &&
    (item.startsWith(LIVE_PREVIEW_ON_PREFIX) || item.startsWith(LIVE_PREVIEW_OFF_PREFIX))
  );
}

function isFreeProductToken(item: unknown): item is string {
  return (
    typeof item === 'string' &&
    (item === FREE_PRODUCT_ON_TOKEN || item === FREE_PRODUCT_OFF_TOKEN)
  );
}

function isMetaGalleryToken(item: unknown): item is string {
  return isLivePreviewToken(item) || isFreeProductToken(item);
}

function normalizeProductFromFirestore(id: string, raw: Record<string, unknown>): Product {
  const rawGallery = Array.isArray(raw.gallery) ? (raw.gallery as string[]) : [];
  const previewToken = rawGallery.find((item) => isLivePreviewToken(item));
  const freeToken = rawGallery.find((item) => isFreeProductToken(item));
  const cleanGallery = rawGallery.filter((item) => typeof item === 'string' && !isMetaGalleryToken(item));

  const restoredImg =
    (typeof raw.imageUrl === 'string' && raw.imageUrl) ||
    (typeof cleanGallery[0] === 'string' && cleanGallery[0]) ||
    '';

  let livePreviewEnabled =
    typeof raw.livePreviewEnabled === 'boolean' ? raw.livePreviewEnabled : undefined;
  let livePreviewUrl =
    typeof raw.livePreviewUrl === 'string' ? raw.livePreviewUrl.trim() : undefined;

  if (previewToken) {
    if (previewToken.startsWith(LIVE_PREVIEW_ON_PREFIX)) {
      if (livePreviewEnabled === undefined) livePreviewEnabled = true;
      if (!livePreviewUrl) {
        livePreviewUrl = previewToken.slice(LIVE_PREVIEW_ON_PREFIX.length).trim();
      }
    } else if (previewToken.startsWith(LIVE_PREVIEW_OFF_PREFIX)) {
      if (livePreviewEnabled === undefined) livePreviewEnabled = false;
      if (!livePreviewUrl) {
        livePreviewUrl = previewToken.slice(LIVE_PREVIEW_OFF_PREFIX.length).trim();
      }
    }
  }

  let isFree = typeof raw.isFree === 'boolean' ? raw.isFree : undefined;
  if (freeToken === FREE_PRODUCT_ON_TOKEN && isFree === undefined) {
    isFree = true;
  } else if (freeToken === FREE_PRODUCT_OFF_TOKEN && isFree === undefined) {
    isFree = false;
  }

  return {
    id,
    ...(raw as unknown as Omit<Product, 'id'>),
    imageUrl: restoredImg,
    gallery: cleanGallery.filter((g) => g !== restoredImg),
    isFree: Boolean(isFree),
    livePreviewEnabled: Boolean(livePreviewEnabled),
    livePreviewUrl: livePreviewUrl || '',
  };
}

export function subscribeToProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'products';
  const q = query(collection(db, 'products'), orderBy('createdAt', 'desc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const products: Product[] = [];
      snapshot.forEach((docSnap) => {
        products.push(
          normalizeProductFromFirestore(docSnap.id, docSnap.data() as Record<string, unknown>)
        );
      });
      onSuccess(products);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function getProductById(id: string): Promise<Product | null> {
  const path = `products/${id}`;
  try {
    const docSnap = await getDoc(doc(db, 'products', id));
    if (docSnap.exists()) {
      return normalizeProductFromFirestore(docSnap.id, docSnap.data() as Record<string, unknown>);
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function createProduct(productData: Omit<Product, 'id'>, customId?: string): Promise<string> {
  const path = 'products';
  try {
    const id = customId || doc(collection(db, 'products')).id;
    const docRef = doc(db, 'products', id);
    const rawImg = await compactDataUrl(productData.imageUrl || '', 160000, 900, false);
    const isLongImg = rawImg.length > 1900;
    const existingGallery = Array.isArray(productData.gallery)
      ? productData.gallery.filter((g) => !isMetaGalleryToken(g))
      : [];

    const cleanPreviewUrl = (productData.livePreviewUrl || '').trim().slice(0, 1900);
    const isPreviewOn = Boolean(productData.livePreviewEnabled && cleanPreviewUrl);
    const previewMetaItem = cleanPreviewUrl
      ? `${isPreviewOn ? LIVE_PREVIEW_ON_PREFIX : LIVE_PREVIEW_OFF_PREFIX}${cleanPreviewUrl}`
      : '';
    const freeMetaItem = productData.isFree ? FREE_PRODUCT_ON_TOKEN : FREE_PRODUCT_OFF_TOKEN;

    const combinedGallery = [
      ...(isLongImg ? [rawImg] : []),
      ...existingGallery.filter((g) => g !== rawImg),
      ...(previewMetaItem ? [previewMetaItem] : []),
      freeMetaItem,
    ].slice(0, 20);

    const {
      isFree: _isFree,
      livePreviewEnabled: _lpe,
      livePreviewUrl: _lpu,
      ...restProductData
    } = productData;

    const payload = cleanFirestoreData({
      ...restProductData,
      imageUrl: isLongImg ? '' : rawImg,
      gallery: combinedGallery,
      createdAt: productData.createdAt || Date.now(),
      updatedAt: Date.now(),
    });

    await setDoc(docRef, payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateProduct(id: string, productData: Partial<Product>): Promise<void> {
  const path = `products/${id}`;
  try {
    const docRef = doc(db, 'products', id);
    const rawImg =
      typeof productData.imageUrl === 'string'
        ? await compactDataUrl(productData.imageUrl, 160000, 900, false)
        : undefined;
    const extraFields: Record<string, unknown> = {};

    const existingGallery = Array.isArray(productData.gallery)
      ? productData.gallery.filter((g) => !isMetaGalleryToken(g))
      : [];

    const cleanPreviewUrl = (productData.livePreviewUrl || '').trim().slice(0, 1900);
    const isPreviewOn = Boolean(productData.livePreviewEnabled && cleanPreviewUrl);
    const previewMetaItem = cleanPreviewUrl
      ? `${isPreviewOn ? LIVE_PREVIEW_ON_PREFIX : LIVE_PREVIEW_OFF_PREFIX}${cleanPreviewUrl}`
      : '';
    const freeMetaItem = productData.isFree ? FREE_PRODUCT_ON_TOKEN : FREE_PRODUCT_OFF_TOKEN;

    if (typeof rawImg === 'string') {
      const isLongImg = rawImg.length > 1900;
      extraFields.imageUrl = isLongImg ? '' : rawImg;
      extraFields.gallery = [
        ...(isLongImg ? [rawImg] : []),
        ...existingGallery.filter((g) => g !== rawImg),
        ...(previewMetaItem ? [previewMetaItem] : []),
        freeMetaItem,
      ].slice(0, 20);
    } else if (
      productData.livePreviewEnabled !== undefined ||
      productData.livePreviewUrl !== undefined ||
      productData.isFree !== undefined
    ) {
      extraFields.gallery = [
        ...existingGallery,
        ...(previewMetaItem ? [previewMetaItem] : []),
        freeMetaItem,
      ].slice(0, 20);
    }

    const {
      isFree: _isFree,
      livePreviewEnabled: _lpe,
      livePreviewUrl: _lpu,
      ...restProductData
    } = productData;

    const payload = cleanFirestoreData({
      ...restProductData,
      ...extraFields,
      updatedAt: Date.now(),
    });

    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const path = `products/${id}`;
  try {
    await deleteDoc(doc(db, 'products', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== CATEGORIES ====================
async function compactCategoryIcon(url?: string): Promise<string> {
  if (!url || !url.startsWith('data:image/') || url.length <= 1900) {
    return url || '';
  }
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 40;
        canvas.height = 40;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve('');
          return;
        }
        ctx.drawImage(img, 0, 0, 40, 40);
        let q = 0.5;
        let out = canvas.toDataURL('image/jpeg', q);
        while (out.length > 1900 && q > 0.2) {
          q -= 0.1;
          out = canvas.toDataURL('image/jpeg', q);
        }
        resolve(out.length <= 1950 ? out : '');
      } catch {
        resolve('');
      }
    };
    img.onerror = () => resolve('');
    img.src = url;
  });
}

export function subscribeToCategories(
  onSuccess: (categories: Category[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'categories';
  const q = query(collection(db, 'categories'), orderBy('sortOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const categories: Category[] = [];
      snapshot.forEach((docSnap) => {
        categories.push({ id: docSnap.id, ...(docSnap.data() as Omit<Category, 'id'>) });
      });
      onSuccess(categories);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createCategory(catData: Omit<Category, 'id'>, customId?: string): Promise<string> {
  const path = 'categories';
  try {
    const id = customId || doc(collection(db, 'categories')).id;
    const docRef = doc(db, 'categories', id);
    const safeImg = await compactCategoryIcon(catData.imageUrl);
    const payload = cleanFirestoreData({
      ...catData,
      imageUrl: safeImg,
      createdAt: catData.createdAt || Date.now(),
    });
    await setDoc(docRef, payload);
    return id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCategory(id: string, catData: Partial<Category>): Promise<void> {
  const path = `categories/${id}`;
  try {
    const docRef = doc(db, 'categories', id);
    const safeImg =
      catData.imageUrl !== undefined ? await compactCategoryIcon(catData.imageUrl) : undefined;
    const payload = cleanFirestoreData({
      ...catData,
      ...(safeImg !== undefined ? { imageUrl: safeImg } : {}),
    });
    await updateDoc(docRef, payload);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const path = `categories/${id}`;
  try {
    await deleteDoc(doc(db, 'categories', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== HOMEPAGE SECTIONS ====================
export function subscribeToHomepageSections(
  onSuccess: (sections: HomepageSection[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'homepage';
  const q = query(collection(db, 'homepage'), orderBy('sortOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const sections: HomepageSection[] = [];
      snapshot.forEach((docSnap) => {
        sections.push({ id: docSnap.id, ...(docSnap.data() as Omit<HomepageSection, 'id'>) });
      });
      onSuccess(sections);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function saveHomepageSection(section: HomepageSection): Promise<void> {
  const path = `homepage/${section.id}`;
  try {
    await setDoc(doc(db, 'homepage', section.id), section, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// ==================== BENEFITS / WHY CHOOSE US ====================
export function subscribeToBenefits(
  onSuccess: (benefits: Benefit[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'benefits';
  const q = query(collection(db, 'benefits'), orderBy('sortOrder', 'asc'));
  return onSnapshot(
    q,
    (snapshot) => {
      const benefits: Benefit[] = [];
      snapshot.forEach((docSnap) => {
        benefits.push({ id: docSnap.id, ...(docSnap.data() as Omit<Benefit, 'id'>) });
      });
      onSuccess(benefits);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createBenefit(data: Omit<Benefit, 'id'>): Promise<string> {
  const path = 'benefits';
  try {
    const docRef = doc(collection(db, 'benefits'));
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateBenefit(id: string, data: Partial<Benefit>): Promise<void> {
  const path = `benefits/${id}`;
  try {
    await updateDoc(doc(db, 'benefits', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteBenefit(id: string): Promise<void> {
  const path = `benefits/${id}`;
  try {
    await deleteDoc(doc(db, 'benefits', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== CAMPAIGNS (WEEKLY HIGHLIGHTS) ====================
export function subscribeToCampaigns(
  onSuccess: (campaigns: Campaign[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  const path = 'campaigns';
  const q = query(collection(db, 'campaigns'), where('active', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const campaigns: Campaign[] = [];
      snapshot.forEach((docSnap) => {
        campaigns.push({ id: docSnap.id, ...(docSnap.data() as Omit<Campaign, 'id'>) });
      });
      onSuccess(campaigns);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

export async function createCampaign(data: Omit<Campaign, 'id'>): Promise<string> {
  const path = 'campaigns';
  try {
    const docRef = doc(collection(db, 'campaigns'));
    await setDoc(docRef, data);
    return docRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function updateCampaign(id: string, data: Partial<Campaign>): Promise<void> {
  const path = `campaigns/${id}`;
  try {
    await updateDoc(doc(db, 'campaigns', id), data);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function deleteCampaign(id: string): Promise<void> {
  const path = `campaigns/${id}`;
  try {
    await deleteDoc(doc(db, 'campaigns', id));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// ==================== ORDERS (DUAL REALTIME DATABASE & FIRESTORE ENGINE) ====================
export async function createOrder(
  orderData: Partial<Order> & { customerPhone: string; total: number }
): Promise<string> {
  const orderId = orderData.id || `ORD-${Date.now().toString().slice(-6)}`;
  const cleanPayload = cleanFirestoreData({
    ...orderData,
    id: orderId,
    status: orderData.status || 'pending',
    paymentStatus: orderData.paymentStatus || 'pending',
    createdAt: orderData.createdAt || Date.now(),
  });

  // 1. Persist to Local Storage & Event Dispatch
  try {
    const { saveUserLocalOrder } = await import('../utils/userOrderHistory');
    saveUserLocalOrder({
      orderId,
      customerName: cleanPayload.customerName || 'গ্রাহক',
      customerPhone: cleanPayload.customerPhone || '',
      customerEmail: cleanPayload.customerEmail || undefined,
      customerAddress: cleanPayload.customerAddress || undefined,
      note: cleanPayload.note || undefined,
      items: cleanPayload.items || [],
      subtotal: Number(cleanPayload.subtotal) || 0,
      deliveryCharge: Number(cleanPayload.deliveryCharge) || 0,
      total: Number(cleanPayload.total) || 0,
      paymentMethod: cleanPayload.paymentMethod || 'Online Payment',
      paymentStatus: (cleanPayload.paymentStatus as any) || 'pending',
      status: (cleanPayload.status as any) || 'pending',
      createdAt: cleanPayload.createdAt || Date.now(),
      transactionId: cleanPayload.paymentTrxId || undefined,
    });
  } catch (localErr) {
    console.warn('Local order storage note:', localErr);
  }

  // 2. Persist to Firebase Realtime Database
  try {
    const rtdbOrderRef = ref(rtdb, `orders/${orderId}`);
    await set(rtdbOrderRef, cleanPayload);
  } catch (rtdbErr) {
    console.warn('Realtime Database order create notice:', rtdbErr);
  }

  // 3. Persist to Firestore
  try {
    const docRef = doc(db, 'orders', orderId);
    await setDoc(docRef, cleanPayload, { merge: true });
  } catch (error) {
    console.warn('Firestore order create notice:', error);
  }

  return orderId;
}

export function subscribeToOrders(
  onSuccess: (orders: Order[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  let isSubscribed = true;
  const rtdbOrdersMap = new Map<string, Order>();
  const firestoreOrdersMap = new Map<string, Order>();
  const localOrdersMap = new Map<string, Order>();

  const getLocalOrders = (): Order[] => {
    try {
      const raw = localStorage.getItem('ndh_user_order_history_v1');
      if (!raw) return [];
      const parsed: any[] = JSON.parse(raw);
      return (parsed || []).map((o) => ({
        id: o.orderId || o.id || `ORD-${Date.now()}`,
        customerName: o.customerName || 'গ্রাহক',
        customerPhone: o.customerPhone || '',
        customerEmail: o.customerEmail,
        customerAddress: o.customerAddress || 'ডিজিটাল ডেলিভারি',
        note: o.note,
        items: o.items || [],
        subtotal: o.subtotal || 0,
        deliveryCharge: o.deliveryCharge || 0,
        total: o.total || 0,
        status: o.status || 'pending',
        paymentStatus: o.paymentStatus || 'pending',
        paymentMethod: o.paymentMethod || 'Online',
        paymentTrxId: o.transactionId,
        createdAt: o.createdAt || Date.now(),
      }));
    } catch {
      return [];
    }
  };

  const emitMergedOrders = () => {
    if (!isSubscribed) return;
    const mergedMap = new Map<string, Order>();

    // 1. Local storage orders (as baseline)
    localOrdersMap.forEach((ord, id) => mergedMap.set(id, ord));

    // 2. Firestore orders
    firestoreOrdersMap.forEach((ord, id) => mergedMap.set(id, ord));

    // 3. Realtime Database orders
    rtdbOrdersMap.forEach((ord, id) => {
      const existing = mergedMap.get(id);
      if (!existing || (ord.updatedAt || ord.createdAt || 0) >= (existing.updatedAt || existing.createdAt || 0)) {
        mergedMap.set(id, ord);
      }
    });

    const ordersList = Array.from(mergedMap.values()).sort(
      (a, b) => (b.createdAt || 0) - (a.createdAt || 0)
    );

    onSuccess(ordersList);
  };

  // Preload local orders immediately
  const initialLocal = getLocalOrders();
  initialLocal.forEach((ord) => localOrdersMap.set(ord.id, ord));
  if (initialLocal.length > 0) {
    emitMergedOrders();
  }

  // 1. Listen to Local storage & window events
  const handleLocalUpdate = () => {
    if (!isSubscribed) return;
    localOrdersMap.clear();
    const updatedLocal = getLocalOrders();
    updatedLocal.forEach((ord) => localOrdersMap.set(ord.id, ord));
    emitMergedOrders();
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('ndh_user_orders_updated', handleLocalUpdate);
    window.addEventListener('storage', handleLocalUpdate);
  }

  // 2. Listen to Firebase Realtime Database
  const rtdbOrdersRef = ref(rtdb, 'orders');
  const handleRtdbValue = (snapshot: any) => {
    try {
      const data = snapshot.val();
      rtdbOrdersMap.clear();
      if (data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const ord = data[key];
          if (ord) {
            rtdbOrdersMap.set(key, { id: key, ...ord });
          }
        });
      }
      emitMergedOrders();
    } catch (err) {
      console.warn('Realtime Database orders parse notice:', err);
    }
  };

  try {
    onValue(rtdbOrdersRef, handleRtdbValue, (err) => {
      console.warn('Realtime Database orders subscription note:', err);
    });
  } catch (rtdbSubErr) {
    console.warn('RTDB onValue listener init note:', rtdbSubErr);
  }

  // 3. Listen to Firestore Database collection (safe resilient query)
  const q = collection(db, 'orders');
  const unsubFirestore = onSnapshot(
    q,
    (snapshot) => {
      firestoreOrdersMap.clear();
      snapshot.forEach((docSnap) => {
        const d = docSnap.data();
        firestoreOrdersMap.set(docSnap.id, {
          id: docSnap.id,
          ...(d as Omit<Order, 'id'>),
          createdAt: typeof d.createdAt === 'number' ? d.createdAt : Date.now(),
        });
      });
      emitMergedOrders();
    },
    (error) => {
      console.warn('Firestore orders live query note:', error);
      if (onError) onError(error);
      emitMergedOrders();
    }
  );

  return () => {
    isSubscribed = false;
    if (typeof window !== 'undefined') {
      window.removeEventListener('ndh_user_orders_updated', handleLocalUpdate);
      window.removeEventListener('storage', handleLocalUpdate);
    }
    try {
      off(rtdbOrdersRef, 'value', handleRtdbValue);
    } catch {}
    unsubFirestore();
  };
}

export async function updateOrderStatus(
  orderId: string,
  status: Order['status'],
  paymentStatus?: Order['paymentStatus'],
  additionalData?: Record<string, any>
): Promise<void> {
  const updateData: any = { status, updatedAt: Date.now() };
  if (paymentStatus) {
    updateData.paymentStatus = paymentStatus;
  }
  if (additionalData) {
    Object.assign(updateData, cleanFirestoreData(additionalData));
  }

  // 1. Update local storage
  try {
    const { updateUserLocalOrderStatus } = await import('../utils/userOrderHistory');
    updateUserLocalOrderStatus(orderId, {
      status: status as any,
      paymentStatus: (paymentStatus as any) || (status === 'completed' ? 'paid' : 'pending'),
      transactionId: additionalData?.paymentTrxId || additionalData?.transactionId || undefined,
      customerEmail: additionalData?.customerEmail || undefined,
    });
  } catch (e) {
    console.warn('Local order status update note:', e);
  }

  // 2. Update Firebase Realtime Database
  try {
    const rtdbOrderRef = ref(rtdb, `orders/${orderId}`);
    await update(rtdbOrderRef, updateData);
  } catch (rtdbErr) {
    console.warn('Realtime Database order status update notice:', rtdbErr);
  }

  // 3. Update Firestore Database
  try {
    const docRef = doc(db, 'orders', orderId);
    await setDoc(docRef, updateData, { merge: true });
  } catch (error) {
    console.warn('Firestore order status update notice:', error);
  }
}

export async function deleteOrder(orderId: string): Promise<void> {
  // 1. Delete from local storage
  try {
    const raw = localStorage.getItem('ndh_user_order_history_v1');
    if (raw) {
      const parsed: any[] = JSON.parse(raw);
      const filtered = parsed.filter((o) => (o.orderId || o.id) !== orderId);
      localStorage.setItem('ndh_user_order_history_v1', JSON.stringify(filtered));
      window.dispatchEvent(new CustomEvent('ndh_user_orders_updated'));
    }
  } catch (e) {
    console.warn('Local delete order notice:', e);
  }

  // 2. Delete from Realtime Database
  try {
    const rtdbOrderRef = ref(rtdb, `orders/${orderId}`);
    await remove(rtdbOrderRef);
  } catch (rtdbErr) {
    console.warn('Realtime Database order delete notice:', rtdbErr);
  }

  // 3. Delete from Firestore
  try {
    await deleteDoc(doc(db, 'orders', orderId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `orders/${orderId}`);
  }
}

/* ==========================================================================
   Activity & Analytics Log Services (Dual Realtime Database & Firestore)
   ========================================================================== */

export async function logActivity(
  activity: Omit<import('../types').ActivityLog, 'id' | 'timestamp'>
): Promise<void> {
  const timestamp = Date.now();
  const rawId = 'act_' + Math.random().toString(36).substring(2, 9) + '_' + timestamp;

  // Clean undefined values
  const cleaned: Record<string, any> = {
    id: rawId,
    type: activity.type || 'page_view',
    title: activity.title || 'অ্যাক্টিভিটি',
    timestamp,
  };
  if (activity.description) cleaned.description = activity.description;
  if (activity.path) cleaned.path = activity.path;
  if (activity.productId) cleaned.productId = activity.productId;
  if (activity.productTitle) cleaned.productTitle = activity.productTitle;
  if (activity.orderId) cleaned.orderId = activity.orderId;
  if (typeof activity.amount === 'number') cleaned.amount = activity.amount;
  if (activity.customerName) cleaned.customerName = activity.customerName;
  if (activity.customerPhone) cleaned.customerPhone = activity.customerPhone;
  if (activity.device) cleaned.device = activity.device;

  const fullLog = cleaned as import('../types').ActivityLog;

  // 1. Local Storage for instant feedback
  try {
    const existing: import('../types').ActivityLog[] = JSON.parse(
      localStorage.getItem('ndh_activity_logs') || '[]'
    );
    const updated = [fullLog, ...existing.filter((l) => l.id !== rawId)].slice(0, 200);
    localStorage.setItem('ndh_activity_logs', JSON.stringify(updated));

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('ndh_activity_event', { detail: fullLog }));
      if ('BroadcastChannel' in window) {
        const bc = new BroadcastChannel('ndh_activity_channel');
        bc.postMessage(fullLog);
        bc.close();
      }
    }
  } catch (e) {
    console.warn('Local log dispatch error:', e);
  }

  // 2. Persist to Firebase Realtime Database
  try {
    const rtdbLogRef = ref(rtdb, `activity_logs/${rawId}`);
    set(rtdbLogRef, cleaned).catch(() => {});
  } catch (e) {
    console.warn('Realtime Database log write notice:', e);
  }

  // 3. Persist to Firestore
  try {
    const docRef = doc(db, 'activity_logs', rawId);
    setDoc(docRef, cleaned).catch(() => {});
  } catch (error) {
    console.warn('Firestore activity log write notice:', error);
  }
}

export function subscribeToActivityLogs(
  onSuccess: (logs: import('../types').ActivityLog[]) => void,
  onError?: (err: unknown) => void
): Unsubscribe {
  let isSubscribed = true;
  let rtdbLogsMap = new Map<string, import('../types').ActivityLog>();
  let fsLogsMap = new Map<string, import('../types').ActivityLog>();

  const getMergedLogs = () => {
    try {
      const localLogs: import('../types').ActivityLog[] = JSON.parse(
        localStorage.getItem('ndh_activity_logs') || '[]'
      );
      const map = new Map<string, import('../types').ActivityLog>();

      // 1. Firestore logs
      fsLogsMap.forEach((l) => map.set(l.id, l));

      // 2. Realtime Database logs
      rtdbLogsMap.forEach((l) => map.set(l.id, l));

      // 3. Local logs fallback
      localLogs.forEach((l) => {
        if (!map.has(l.id)) map.set(l.id, l);
      });

      const list = Array.from(map.values()).sort((a, b) => b.timestamp - a.timestamp);
      return list.slice(0, 150);
    } catch {
      return Array.from(fsLogsMap.values());
    }
  };

  // Immediate emission from localStorage so dashboard isn't blank
  const initial = getMergedLogs();
  if (initial.length > 0) {
    onSuccess(initial);
  }

  // Listen to custom window events
  const handleLocalEvent = () => {
    if (!isSubscribed) return;
    onSuccess(getMergedLogs());
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('ndh_activity_event', handleLocalEvent);
    window.addEventListener('storage', handleLocalEvent);
  }

  // 1. Realtime Database Listener
  const rtdbLogsRef = ref(rtdb, 'activity_logs');
  const handleRtdbLogs = (snapshot: any) => {
    try {
      const data = snapshot.val();
      rtdbLogsMap.clear();
      if (data && typeof data === 'object') {
        Object.keys(data).forEach((key) => {
          const l = data[key];
          if (l) rtdbLogsMap.set(key, { id: key, ...l });
        });
      }
      if (isSubscribed) {
        onSuccess(getMergedLogs());
      }
    } catch (e) {
      console.warn('Realtime Database logs parse notice:', e);
    }
  };
  onValue(rtdbLogsRef, handleRtdbLogs);

  // 2. Firestore Listener
  const q = query(collection(db, 'activity_logs'), orderBy('timestamp', 'desc'), limit(150));
  const unsubFirestore = onSnapshot(
    q,
    (snapshot) => {
      fsLogsMap.clear();
      snapshot.forEach((docSnap) => {
        fsLogsMap.set(docSnap.id, { id: docSnap.id, ...(docSnap.data() as Omit<import('../types').ActivityLog, 'id'>) });
      });
      if (isSubscribed) {
        onSuccess(getMergedLogs());
      }
    },
    (error) => {
      if (onError) onError(error);
      if (isSubscribed) {
        onSuccess(getMergedLogs());
      }
    }
  );

  return () => {
    isSubscribed = false;
    off(rtdbLogsRef, 'value', handleRtdbLogs);
    unsubFirestore();
    if (typeof window !== 'undefined') {
      window.removeEventListener('ndh_activity_event', handleLocalEvent);
      window.removeEventListener('storage', handleLocalEvent);
    }
  };
}

export async function clearOldActivityLogs(): Promise<void> {
  localStorage.removeItem('ndh_activity_logs');
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('ndh_activity_event'));
  }

  // 1. Clear Realtime Database
  try {
    const rtdbLogsRef = ref(rtdb, 'activity_logs');
    await remove(rtdbLogsRef);
  } catch (e) {
    console.warn('Realtime Database clear logs notice:', e);
  }

  // 2. Clear Firestore
  try {
    const q = query(collection(db, 'activity_logs'), limit(100));
    const snapshot = await getDocs(q);
    const batchOps = snapshot.docs.map((d) => deleteDoc(d.ref));
    await Promise.all(batchOps);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, 'activity_logs');
  }
}
