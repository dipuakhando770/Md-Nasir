/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { StoreProvider, useStore } from './context/StoreContext';
import { CartProvider, useCart } from './context/CartContext';
import { Header } from './components/common/Header';
import { Footer } from './components/common/Footer';
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductPage } from './pages/ProductPage';
import { AdminLayout } from './admin/AdminLayout';
import { ProductDetailModal } from './components/common/ProductDetailModal';
import { CartDrawer } from './components/common/CartDrawer';
import { CheckoutModal } from './components/common/CheckoutModal';
import { PaymentStatusModal } from './components/common/PaymentStatusModal';
import { UserOrderHistoryModal } from './components/common/UserOrderHistoryModal';
import { FloatingWhatsApp } from './components/common/FloatingWhatsApp';
import { MobileBottomBar } from './components/common/MobileBottomBar';
import { PageLoader } from './components/common/PageLoader';
import { SeoMetaManager } from './components/common/SeoMetaManager';
import { Product } from './types';
import { findProductBySlugOrId, getProductPath, getProductFullUrl } from './utils/slugify';
import { analytics } from './utils/analytics';

function checkIsAdminUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const hash = (window.location.hash || '').toLowerCase();
  const path = (window.location.pathname || '').toLowerCase();
  const search = (window.location.search || '').toLowerCase();
  return (
    hash.includes('admin') ||
    path.includes('admin') ||
    search.includes('admin')
  );
}

function MainApp() {
  const [currentView, setCurrentView] = useState<'home' | 'shop' | 'admin' | 'product'>(() => {
    if (checkIsAdminUrl()) return 'admin';
    if (typeof window !== 'undefined') {
      const path = window.location.pathname || '';
      if (path.startsWith('/product/') || path.startsWith('/shop')) {
        return path.startsWith('/shop') ? 'shop' : 'product';
      }
    }
    return 'home';
  });

  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
  const [minReloadTimeElapsed, setMinReloadTimeElapsed] = useState(false);
  const [isOrderHistoryOpen, setIsOrderHistoryOpen] = useState(false);

  const { products, loading: storeLoading, setSelectedCategory } = useStore();
  const { selectedProductForModal, setSelectedProductForModal } = useCart();

  // Instant or ultra-brief loader transition
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinReloadTimeElapsed(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const showPageLoader = storeLoading && !minReloadTimeElapsed;

  // Track page visits automatically in live analytics
  useEffect(() => {
    if (currentView === 'home') {
      analytics.trackPageView('/', 'হোম পেজ ভিজিট');
    } else if (currentView === 'shop') {
      analytics.trackPageView('/shop', 'শপ পেজ ভিজিট');
    } else if (currentView === 'product' && activeProduct) {
      analytics.trackProductView(activeProduct);
    }
  }, [currentView, activeProduct?.id]);

  // Listen to clean URL path changes and popstate (No hashtags)
  useEffect(() => {
    const handleUrlChange = () => {
      if (checkIsAdminUrl()) {
        setCurrentView('admin');
        return;
      }

      const path = window.location.pathname || '';
      const hash = window.location.hash || '';

      // Check clean HTML5 path /product/:slug or legacy #product/:slug
      let candidateSlugOrId = '';
      if (path.startsWith('/product/')) {
        candidateSlugOrId = path.replace('/product/', '');
      } else if (hash.startsWith('#/product/')) {
        candidateSlugOrId = hash.replace('#/product/', '');
      } else if (hash.startsWith('#product/')) {
        candidateSlugOrId = hash.replace('#product/', '');
      } else if (hash.startsWith('#') && hash.length > 1 && !['#admin', '#shop', '#faq'].includes(hash.toLowerCase())) {
        candidateSlugOrId = hash.replace('#', '');
      }

      if (candidateSlugOrId) {
        const cleanCandidate = candidateSlugOrId.split('?')[0].split('&')[0];
        const found = findProductBySlugOrId(products, cleanCandidate);
        if (found) {
          setActiveProduct(found);
          setCurrentView('product');

          // If there was a hashtag in the URL, cleanly replace it with the pure HTML5 top-level URL
          if (hash) {
            window.history.replaceState(null, '', getProductPath(found));
          }
          return;
        }
      }

      if (path === '/shop' || hash === '#shop') {
        setCurrentView('shop');
        if (hash === '#shop') {
          window.history.replaceState(null, '', '/shop');
        }
        return;
      }

      if (currentView === 'admin') {
        setCurrentView('home');
      }
    };

    handleUrlChange();
    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);

    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [products, currentView]);

  // When modal product is selected or user clicks product card, switch to detailed product view with clean URL
  const handleOpenProduct = (product: Product) => {
    setActiveProduct(product);
    setCurrentView('product');
    window.history.pushState(null, '', getProductPath(product));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToShop = (categoryId?: string) => {
    if (categoryId) {
      setSelectedCategory(categoryId);
    }
    setCurrentView('shop');
    window.history.pushState(null, '', '/shop');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToHome = () => {
    setCurrentView('home');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToAdmin = () => {
    window.history.pushState(null, '', '/admin');
    setCurrentView('admin');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStore = () => {
    window.history.replaceState(null, '', '/');
    setCurrentView('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {/* Dynamic Google SEO, Meta Description, Keywords & Social Link Share Preview Tags */}
      <SeoMetaManager currentView={currentView} activeProduct={activeProduct} />

      {/* Page Reload / Initial Load Animation */}
      <PageLoader isVisible={showPageLoader} />

      {/* If URL contains admin, render Admin Layout */}
      {currentView === 'admin' ? (
        <AdminLayout onBackToStore={handleBackToStore} />
      ) : !storeLoading ? (
        <>
          {/* Main Store Header */}
          <Header
            currentView={currentView}
            setCurrentView={setCurrentView}
            onSelectCategory={handleNavigateToShop}
            onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
          />

          {/* Main View Body */}
          <main className="flex-1">
            {currentView === 'home' && (
              <HomePage
                onNavigateToShop={handleNavigateToShop}
                onNavigateToAdmin={handleNavigateToAdmin}
                onSelectProduct={handleOpenProduct}
              />
            )}
            {currentView === 'shop' && (
              <ShopPage onSelectProduct={handleOpenProduct} />
            )}
            {currentView === 'product' && activeProduct && (
              <ProductPage
                product={activeProduct}
                onNavigateToHome={handleNavigateToHome}
                onNavigateToShop={handleNavigateToShop}
                onSelectProduct={handleOpenProduct}
              />
            )}
          </main>

          {/* Main Store Footer */}
          <Footer setCurrentView={setCurrentView} />

          {/* RaduanBD Style High-Conversion Widgets */}
          <FloatingWhatsApp />
          <MobileBottomBar
            currentView={currentView === 'product' ? 'shop' : currentView}
            setCurrentView={setCurrentView}
            onOpenOrderHistory={() => setIsOrderHistoryOpen(true)}
          />
        </>
      ) : null}

      {/* Global Modals & Drawers */}
      <ProductDetailModal
        product={selectedProductForModal}
        onClose={() => setSelectedProductForModal(null)}
      />
      <CartDrawer />
      <CheckoutModal />
      <PaymentStatusModal />
      <UserOrderHistoryModal
        isOpen={isOrderHistoryOpen}
        onClose={() => setIsOrderHistoryOpen(false)}
        onNavigateToShop={() => {
          setIsOrderHistoryOpen(false);
          handleNavigateToShop();
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <StoreProvider>
        <CartProvider>
          <MainApp />
        </CartProvider>
      </StoreProvider>
    </AuthProvider>
  );
}
