import React from 'react';
import { motion } from 'motion/react';
import { HeroSection } from '../sections/HeroSection';
import { QuickCategoryBar } from '../components/common/QuickCategoryBar';
import { DiscountSection } from '../sections/DiscountSection';
import { PopularCategoriesSection } from '../sections/PopularCategoriesSection';
import { FeaturedProductsSection } from '../sections/FeaturedProductsSection';
import { DynamicCategorySections } from '../sections/DynamicCategorySections';
import { WeeklyHighlightsSection } from '../sections/WeeklyHighlightsSection';
import { PromotionalBannerSection } from '../sections/PromotionalBannerSection';
import { TrustPaymentBanner } from '../sections/TrustPaymentBanner';
import { WhyChooseUsSection } from '../sections/WhyChooseUsSection';
import { TopRatedSection } from '../sections/TopRatedSection';
import { LatestProductsSection } from '../sections/LatestProductsSection';
import { FaqSection } from '../sections/FaqSection';
import { WhatsAppCtaSection } from '../sections/WhatsAppCtaSection';
import { useStore } from '../context/StoreContext';
import { Category, Product } from '../types';
import { EmptyState } from '../components/common/EmptyState';
import { PackageOpen } from 'lucide-react';

interface HomePageProps {
  onNavigateToShop: (categoryId?: string) => void;
  onNavigateToAdmin: () => void;
  onSelectProduct?: (product: Product) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  onNavigateToShop,
  onSelectProduct,
}) => {
  const { products, loading, setSelectedCategory } = useStore();

  const handleSelectCategory = (category: Category) => {
    setSelectedCategory(category.id);
    onNavigateToShop(category.id);
  };

  const hasAnyProducts = products.length > 0;

  return (
    <div className="relative space-y-4 pb-20 md:pb-8 overflow-hidden">
      {/* Ambient Background Bouncing Products Effect on Reload */}
      {hasAnyProducts && (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden opacity-[0.055]">
          {products.slice(0, 6).map((p, idx) => (
            <motion.div
              key={p.id}
              animate={{
                y: [0, -28, 0],
                x: idx % 2 === 0 ? [0, 10, 0] : [0, -10, 0],
                rotate: idx % 2 === 0 ? [-6, 6, -6] : [6, -6, 6],
              }}
              transition={{
                duration: 3 + (idx % 3) * 0.6,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
              style={{
                top: `${15 + idx * 14}%`,
                left: idx % 2 === 0 ? '2%' : undefined,
                right: idx % 2 !== 0 ? '2%' : undefined,
              }}
              className="absolute w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-emerald-500/40"
            >
              {p.imageUrl && (
                <img src={p.imageUrl} alt="" className="w-full h-full object-cover" />
              )}
            </motion.div>
          ))}
        </div>
      )}

      <div className="relative z-10 space-y-4">
        {/* 1. Hero Section (Auto-Sliding Banner) */}
        <HeroSection onShopClick={(categoryId) => onNavigateToShop(categoryId)} />

        {/* 2. Directly Below Slider: Discountable Products Auto-Scrolling Left */}
        {hasAnyProducts && (
          <DiscountSection
            onViewAll={() => onNavigateToShop()}
            onSelectProduct={onSelectProduct}
          />
        )}

        {/* 3. Quick Category Bar */}
        <QuickCategoryBar
          onSelectCategory={handleSelectCategory}
          onViewAll={() => onNavigateToShop()}
        />

        {/* If products exist, render all rich sections */}
        {hasAnyProducts ? (
          <>
            {/* 4. Popular Categories */}
            <PopularCategoriesSection onSelectCategory={handleSelectCategory} />

            {/* 5. Featured Products Spotlight */}
            <FeaturedProductsSection onViewAll={() => onNavigateToShop()} />

            {/* 6. Dynamic Category Product Sections */}
            <DynamicCategorySections onSelectCategory={handleSelectCategory} />

            {/* 7. Weekly Highlights / Flash Campaigns */}
            <WeeklyHighlightsSection />

            {/* 8. Promotional Banner */}
            <PromotionalBannerSection onCtaClick={() => onNavigateToShop()} />

            {/* 9. Payment Methods & Guarantee Trust Banner */}
            <TrustPaymentBanner />

            {/* 10. Why Choose Us / Service Benefits */}
            <WhyChooseUsSection />

            {/* 11. Top Rated Products */}
            <TopRatedSection />

            {/* 12. Latest Products */}
            <LatestProductsSection onViewAll={() => onNavigateToShop()} />

            {/* 13. FAQ Section */}
            <FaqSection />

            {/* 14. WhatsApp CTA */}
            <WhatsAppCtaSection />
          </>
        ) : !loading ? (
          <div className="max-w-4xl mx-auto py-12 px-4 space-y-12">
            <EmptyState
              icon={PackageOpen}
              title="নতুন পণ্য আপলোড করা হচ্ছে"
              description="বর্তমানে নতুন ডিজিটাল রিসোর্স ও সফটওয়্যার লাইসেন্স ক্যাটালগে যুক্ত করা হচ্ছে। যেকোনো তথ্যের জন্য আমাদের সাথে যোগাযোগ করুন।"
              actionText="হোয়াটসঅ্যাপে যোগাযোগ"
              onAction={() => {
                const whatsappUrl = `https://wa.me/8801962780922?text=${encodeURIComponent('আসসালামু আলাইকুম! আমি ডিজিটাল প্রোডাক্ট সম্পর্কে জানতে চাই।')}`;
                window.open(whatsappUrl, '_blank');
              }}
            />
            <TrustPaymentBanner />
            <WhyChooseUsSection />
            <FaqSection />
            <WhatsAppCtaSection />
          </div>
        ) : null}
      </div>
    </div>
  );
};
