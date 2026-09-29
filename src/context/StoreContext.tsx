import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, Category, StoreSettings, HomepageSection, Benefit, Campaign } from '../types';
import {
  getInitialStoreSettings,
  subscribeToStoreSettings,
  subscribeToProducts,
  subscribeToCategories,
  subscribeToHomepageSections,
  subscribeToBenefits,
  subscribeToCampaigns,
} from '../firebase/services';

interface StoreContextType {
  settings: StoreSettings;
  products: Product[];
  categories: Category[];
  homepageSections: HomepageSection[];
  benefits: Benefit[];
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  selectedCategory: string | null;
  setSelectedCategory: (catId: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  getCategoryName: (categoryId: string) => string;
  getCategoryById: (categoryId: string) => Category | undefined;
  getProductById: (productId: string) => Product | undefined;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

// Helper for fast local caching of catalog data
function loadCachedData<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(`ndh_cache_${key}`);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveCachedData<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(`ndh_cache_${key}`, JSON.stringify(data));
  } catch {
    // Ignore storage quota limits
  }
}

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<StoreSettings>(() =>
    loadCachedData<StoreSettings>('settings', getInitialStoreSettings())
  );
  const [products, setProducts] = useState<Product[]>(() =>
    loadCachedData<Product[]>('products', [])
  );
  const [categories, setCategories] = useState<Category[]>(() =>
    loadCachedData<Category[]>('categories', [])
  );
  const [homepageSections, setHomepageSections] = useState<HomepageSection[]>(() =>
    loadCachedData<HomepageSection[]>('sections', [])
  );
  const [benefits, setBenefits] = useState<Benefit[]>(() =>
    loadCachedData<Benefit[]>('benefits', [])
  );
  const [campaigns, setCampaigns] = useState<Campaign[]>(() =>
    loadCachedData<Campaign[]>('campaigns', [])
  );

  // If cached data is already present, we can show the UI immediately without blocking
  const hasCachedCatalog = products.length > 0 && categories.length > 0;
  const [loading, setLoading] = useState(!hasCachedCatalog);
  const [error, setError] = useState<string | null>(null);

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Dynamically sync browser title and favicon with website logo/name
  useEffect(() => {
    if (settings.websiteName) {
      document.title = `${settings.websiteName} — ${settings.tagline || 'প্রিমিয়াম ডিজিটাল মার্কেটপ্লেস'}`;
    }
    const iconHref = settings.faviconUrl || settings.logoUrl;
    if (iconHref) {
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = iconHref;
    }
  }, [settings.websiteName, settings.tagline, settings.logoUrl, settings.faviconUrl]);

  useEffect(() => {
    let isMounted = true;
    let settingsLoaded = false;
    let productsLoaded = false;
    let categoriesLoaded = false;

    const checkAllLoaded = () => {
      if (settingsLoaded && productsLoaded && categoriesLoaded) {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const unsubSettings = subscribeToStoreSettings(
      (newSettings) => {
        setSettings(newSettings);
        saveCachedData('settings', newSettings);
        settingsLoaded = true;
        checkAllLoaded();
      },
      () => {
        settingsLoaded = true;
        checkAllLoaded();
      }
    );

    const unsubProducts = subscribeToProducts(
      (newProducts) => {
        setProducts(newProducts);
        saveCachedData('products', newProducts);
        productsLoaded = true;
        checkAllLoaded();
      },
      (err) => {
        console.error('Products listener error:', err);
        productsLoaded = true;
        checkAllLoaded();
      }
    );

    const unsubCategories = subscribeToCategories(
      (newCats) => {
        setCategories(newCats);
        saveCachedData('categories', newCats);
        categoriesLoaded = true;
        checkAllLoaded();
      },
      (err) => {
        console.error('Categories listener error:', err);
        categoriesLoaded = true;
        checkAllLoaded();
      }
    );

    const unsubSections = subscribeToHomepageSections(
      (sections) => {
        setHomepageSections(sections);
        saveCachedData('sections', sections);
      },
      () => {}
    );

    const unsubBenefits = subscribeToBenefits(
      (newBenefits) => {
        setBenefits(newBenefits);
        saveCachedData('benefits', newBenefits);
      },
      () => {}
    );

    const unsubCampaigns = subscribeToCampaigns(
      (newCampaigns) => {
        setCampaigns(newCampaigns);
        saveCachedData('campaigns', newCampaigns);
      },
      () => {}
    );

    // Ultra-fast timeout fallback: release loader within 1.5s max
    const timer = setTimeout(() => {
      if (isMounted) {
        setLoading(false);
      }
    }, 1500);

    return () => {
      isMounted = false;
      unsubSettings();
      unsubProducts();
      unsubCategories();
      unsubSections();
      unsubBenefits();
      unsubCampaigns();
      clearTimeout(timer);
    };
  }, []);

  const getCategoryName = (categoryId: string): string => {
    const found = categories.find((c) => c.id === categoryId);
    return found ? found.name : 'সাধারণ';
  };

  const getCategoryById = (categoryId: string): Category | undefined => {
    return categories.find((c) => c.id === categoryId);
  };

  const getProductById = (productId: string): Product | undefined => {
    return products.find((p) => p.id === productId);
  };

  return (
    <StoreContext.Provider
      value={{
        settings,
        products,
        categories,
        homepageSections,
        benefits,
        campaigns,
        loading,
        error,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        getCategoryName,
        getCategoryById,
        getProductById,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within an StoreProvider');
  }
  return context;
};
