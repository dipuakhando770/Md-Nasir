import heroSoftwareBanner from '../assets/images/hero_banner_software_1790487033171.jpg';
import heroTemplatesBanner from '../assets/images/hero_banner_templates_1790487051767.jpg';
import heroDealsBanner from '../assets/images/hero_banner_deals_1790487067772.jpg';
import { HeroSlide } from '../types';

export interface HDBannerPreset {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  targetLink: string;
}

export const HD_HERO_PRESETS: HDBannerPreset[] = [
  {
    id: 'hd-software-tools',
    title: 'প্রিমিয়াম সফটওয়্যার ও ডেভেলপমেন্ট টুলস মেগা সেল',
    subtitle: 'অফিসিয়াল লাইসেন্স ও লাইফটাইম এক্সেস — সর্বোচ্চ ৭০% পর্যন্ত ছাড়',
    imageUrl: heroSoftwareBanner,
    targetLink: '',
  },
  {
    id: 'hd-web-scripts-templates',
    title: 'ওয়েব স্ক্রিপ্ট, UI কিট ও প্রিমিয়াম সোর্স কোড বান্ডেল',
    subtitle: 'রেডিমেড প্রজেক্ট ও লাইভ প্রিভিউ সহ আধুনিক ডিজিটাল এসেটস',
    imageUrl: heroTemplatesBanner,
    targetLink: '#discount',
  },
  {
    id: 'hd-exclusive-deals',
    title: 'ডিজিটাল সাবস্ক্রিপশন ও ভিআইপি লাইসেন্স সুপার ডিল',
    subtitle: 'তাৎক্ষণিক অটো ডেলিভারি এবং ২৪/৭ ডেডিকেটেড সাপোর্ট',
    imageUrl: heroDealsBanner,
    targetLink: '',
  },
];

export const DEFAULT_HD_HERO_SLIDES: HeroSlide[] = [
  {
    id: 'default-hd-slide-1',
    imageUrl: heroSoftwareBanner,
    linkUrl: '',
    active: true,
    sortOrder: 1,
  },
  {
    id: 'default-hd-slide-2',
    imageUrl: heroTemplatesBanner,
    linkUrl: '#discount',
    active: true,
    sortOrder: 2,
  },
  {
    id: 'default-hd-slide-3',
    imageUrl: heroDealsBanner,
    linkUrl: '',
    active: true,
    sortOrder: 3,
  },
];
