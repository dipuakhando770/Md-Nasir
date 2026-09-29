import React, { useState, useEffect } from 'react';
import { Home, ShoppingBag, Layers, MessageCircle, Package } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useStore } from '../../context/StoreContext';

interface MobileBottomBarProps {
  currentView: 'home' | 'shop' | 'admin' | 'product';
  setCurrentView: (view: 'home' | 'shop' | 'admin' | 'product') => void;
  onOpenOrderHistory?: () => void;
}

export const MobileBottomBar: React.FC<MobileBottomBarProps> = ({
  currentView,
  setCurrentView,
  onOpenOrderHistory,
}) => {
  const { cartCount, setIsCartOpen } = useCart();
  const { settings } = useStore();
  const [userOrdersCount, setUserOrdersCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const data = localStorage.getItem('ndh_user_order_history_v1');
      return data ? JSON.parse(data).length : 0;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    const handleUpdate = () => {
      try {
        const data = localStorage.getItem('ndh_user_order_history_v1');
        setUserOrdersCount(data ? JSON.parse(data).length : 0);
      } catch {
        setUserOrdersCount(0);
      }
    };
    window.addEventListener('ndh_user_orders_updated', handleUpdate);
    return () => window.removeEventListener('ndh_user_orders_updated', handleUpdate);
  }, []);

  const whatsappNumber = settings.whatsappNumber || '01962780922';
  const whatsappUrl = `https://wa.me/88${whatsappNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি ডিজিটাল প্রোডাক্ট কিনতে চাচ্ছি।')}`;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 px-2 py-1.5 shadow-xl">
      <div className="flex items-center justify-around">
        {/* Home */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('home');
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            currentView === 'home' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Home</span>
        </button>

        {/* Shop */}
        <button
          type="button"
          onClick={() => {
            setCurrentView('shop');
            window.location.hash = '';
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-colors ${
            currentView === 'shop' ? 'text-emerald-600 font-bold' : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-medium mt-0.5">Shop</span>
        </button>

        {/* My Orders */}
        {onOpenOrderHistory && (
          <button
            type="button"
            onClick={onOpenOrderHistory}
            className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-emerald-600 transition-colors"
          >
            <Package className="w-5 h-5" />
            {userOrdersCount > 0 && (
              <span className="absolute top-0 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
                {userOrdersCount}
              </span>
            )}
            <span className="text-[10px] font-medium mt-0.5">অর্ডার</span>
          </button>
        )}

        {/* Cart */}
        <button
          type="button"
          onClick={() => setIsCartOpen(true)}
          className="relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ShoppingBag className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute top-0 right-1.5 w-4 h-4 rounded-full bg-emerald-600 text-white font-bold text-[9px] flex items-center justify-center">
              {cartCount}
            </span>
          )}
          <span className="text-[10px] font-medium mt-0.5">Cart</span>
        </button>

        {/* WhatsApp */}
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center py-1 px-2.5 rounded-xl text-[#25D366] hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-5 h-5 fill-[#25D366]" />
          <span className="text-[10px] font-medium mt-0.5">Chat</span>
        </a>
      </div>
    </div>
  );
};
