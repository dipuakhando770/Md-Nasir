export type ProductType = 'physical' | 'digital';

export interface Product {
  id: string;
  title: string;
  slug: string;
  categoryId: string;
  description: string;
  shortDescription?: string;
  imageUrl: string;
  gallery?: string[];
  price: number;
  oldPrice?: number;
  available: boolean;
  featured: boolean;
  newArrival?: boolean;
  rating?: number;
  reviewCount?: number;
  type: ProductType;
  isFree?: boolean;
  downloadUrl?: string;
  livePreviewEnabled?: boolean;
  livePreviewUrl?: string;
  tags?: string[];
  createdAt: number;
  updatedAt?: number;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  icon?: string;
  sortOrder?: number;
  active: boolean;
  createdAt: number;
}

export interface HeroSlide {
  id: string;
  imageUrl: string;
  title?: string;
  subtitle?: string;
  badge?: string;
  linkUrl?: string; // target link or category ID
  buttonText?: string;
  active: boolean;
  sortOrder: number;
  overlayTheme?: 'dark' | 'gradient' | 'minimal' | 'none';
  contentAlignment?: 'left' | 'center' | 'right';
}

export interface PayBdGatewaySettings {
  enabled: boolean;
  apiKey?: string;
  secretKey?: string;
  brandKey?: string;
  gatewayUrl?: string;
}

export interface EmailSmtpSettings {
  enabled: boolean;
  senderEmail: string;
  senderName?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPassword?: string;
  secure?: boolean;
  notifyAdmin?: boolean;
  adminNotificationEmail?: string;
}

export interface StoreSettings {
  websiteName: string;
  description: string;
  tagline?: string;
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  ogImageUrl?: string;
  hideHeaderTitle?: boolean;
  whatsappNumber: string;
  deliveryCharge?: number;
  paybd?: PayBdGatewaySettings;
  smtp?: EmailSmtpSettings;
  logoUrl?: string;
  loadingLogoUrl?: string;
  faviconUrl?: string;
  heroMediaUrl?: string;
  heroMediaType?: 'video' | 'image';
  heroHeadline?: string;
  heroSubtitle?: string;
  heroBadge?: string;
  heroPrimaryCtaText?: string;
  heroPrimaryCtaLink?: string;
  heroSecondaryCtaText?: string;
  heroSecondaryCtaLink?: string;
  heroSlides?: HeroSlide[];
  heroAutoSlide?: boolean;
  heroSlideInterval?: number; // in seconds
  announcement?: {
    enabled: boolean;
    text: string;
    link?: string;
  };
  heroProductIds?: {
    leftTop?: string;
    leftBottom?: string;
    rightTop?: string;
    rightBottom?: string;
  };
  primaryColor?: string;
  secondaryColor?: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  telegramUrl?: string;
  email?: string;
  address?: string;
  updatedAt?: number;
}

export interface HomepageSection {
  id: string;
  type: string; // e.g. 'hero' | 'discount' | 'categories' | 'featured' | 'category_sections' | 'weekly' | 'banner' | 'benefits' | 'top_rated' | 'latest' | 'faq' | 'cta'
  title?: string;
  subtitle?: string;
  enabled: boolean;
  sortOrder: number;
  productIds?: string[];
  categoryIds?: string[];
}

export interface Benefit {
  id: string;
  icon: string;
  title: string;
  description: string;
  active: boolean;
  sortOrder: number;
}

export interface Campaign {
  id: string;
  title: string;
  subtitle?: string;
  productIds: string[];
  startAt: number;
  endAt: number;
  active: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

export interface OrderItem {
  productId: string;
  title: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  downloadUrl?: string;
  livePreviewUrl?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  customerEmail?: string;
  note?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus?: 'pending' | 'paid' | 'completed' | 'failed' | 'cancelled';
  paymentTrxId?: string;
  paymentSessionId?: string;
  createdAt: number;
  updatedAt?: number;
}

export type ActivityType =
  | 'page_view'
  | 'product_view'
  | 'add_to_cart'
  | 'remove_from_cart'
  | 'checkout_start'
  | 'order_placed'
  | 'order_cancelled'
  | 'whatsapp_click'
  | 'direct_download';

export interface ActivityLog {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  path?: string;
  productId?: string;
  productTitle?: string;
  orderId?: string;
  amount?: number;
  customerName?: string;
  customerPhone?: string;
  device?: string;
  timestamp: number;
}
