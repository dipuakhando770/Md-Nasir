import React, { useState, useEffect } from 'react';
import {
  Save,
  CheckCircle2,
  Store,
  Bell,
  Phone,
  Globe,
  AlertCircle,
  RefreshCw,
  Search,
  Share2,
  Tag,
  Sparkles,
  EyeOff,
  Plus,
  X,
  CreditCard,
  Key,
  ShieldCheck,
  Mail,
  Send,
  Check,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { updateStoreSettings, compactDataUrl } from '../firebase/services';
import { ImageUploader, isSafeImageUrl } from '../components/common/ImageUploader';
import { BrandLogo } from '../components/common/BrandLogo';

const RECOMMENDED_SEO_KEYWORDS = [
  'Nasir Digital Hub',
  'ডিজিটাল প্রোডাক্ট',
  'সফটওয়্যার লাইসেন্স',
  'প্রিমিয়াম সাবস্ক্রিপশন',
  'Canva Pro Bangladesh',
  'Digital Product Shop BD',
  'গ্রাফিক টেমপ্লেট',
  'ভিডিও এডিটিং বান্ডেল',
  'পিসি সফটওয়্যার',
  'অনলাইন টুলস বাংলাদেশ',
];

export const StoreSettingsManager: React.FC = () => {
  const { settings } = useStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Brand & Logo States
  const [websiteName, setWebsiteName] = useState(settings.websiteName || 'Nasir Digital Hub');
  const [tagline, setTagline] = useState(
    settings.tagline || 'প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস'
  );
  const [description, setDescription] = useState(settings.description || '');
  const [hideHeaderTitle, setHideHeaderTitle] = useState<boolean>(
    settings.hideHeaderTitle !== false
  );
  const [logoUrl, setLogoUrl] = useState(settings.logoUrl || '');
  const [loadingLogoUrl, setLoadingLogoUrl] = useState(settings.loadingLogoUrl || '');
  const [faviconUrl, setFaviconUrl] = useState(settings.faviconUrl || '');

  // Google SEO & Social Share Meta States
  const [metaTitle, setMetaTitle] = useState(
    settings.metaTitle ||
      'Nasir Digital Hub — প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস'
  );
  const [metaDescription, setMetaDescription] = useState(
    settings.metaDescription ||
      settings.description ||
      'Nasir Digital Hub — বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, Canva Pro, প্রিমিয়াম সাবস্ক্রিপশন, ডিজাইন টেমপ্লেট ও অনলাইন টুলস এর বিশ্বস্ত মার্কেটপ্লেস। ইন্সট্যান্ট ডেলিভারি ও ২৪/৭ সাপোর্ট।'
  );
  const [metaKeywords, setMetaKeywords] = useState(
    settings.metaKeywords || RECOMMENDED_SEO_KEYWORDS.join(', ')
  );
  const [newKeywordInput, setNewKeywordInput] = useState('');
  const [ogImageUrl, setOgImageUrl] = useState(settings.ogImageUrl || '');

  // Contact & Announcement States
  const [whatsappNumber, setWhatsappNumber] = useState(settings.whatsappNumber || '01962780922');
  const [deliveryCharge, setDeliveryCharge] = useState<number>(settings.deliveryCharge || 0);
  const [announcementEnabled, setAnnouncementEnabled] = useState(
    settings.announcement?.enabled ?? true
  );
  const [announcementText, setAnnouncementText] = useState(
    settings.announcement?.text || '🔥 আজকের বিশেষ অফার — সীমিত সময়ের জন্য বিশেষ ছাড়!'
  );
  const [announcementLink, setAnnouncementLink] = useState(
    settings.announcement?.link || '#discount'
  );
  const [email, setEmail] = useState(settings.email || 'info@nasirdigitalhub.com');
  const [address, setAddress] = useState(settings.address || 'ঢাকা, বাংলাদেশ');
  const [facebookUrl, setFacebookUrl] = useState(settings.facebookUrl || 'https://facebook.com');
  const [youtubeUrl, setYoutubeUrl] = useState(settings.youtubeUrl || 'https://youtube.com');
  const [telegramUrl, setTelegramUrl] = useState(settings.telegramUrl || 'https://t.me');

  // PayBD (Pipilik Host) Payment Gateway States
  const [paybdEnabled, setPaybdEnabled] = useState(settings.paybd?.enabled ?? true);
  const [paybdApiKey, setPaybdApiKey] = useState(
    settings.paybd?.apiKey || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ'
  );
  const [paybdSecretKey, setPaybdSecretKey] = useState(
    settings.paybd?.secretKey || 'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg'
  );
  const [paybdBrandKey, setPaybdBrandKey] = useState(
    settings.paybd?.brandKey || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ'
  );
  const [paybdGatewayUrl, setPaybdGatewayUrl] = useState(
    settings.paybd?.gatewayUrl || 'https://app-paybd.pipilikhost.com/api/payment/create'
  );

  // Hostinger Business Email (SMTP / Mail API) States
  const [smtpEnabled, setSmtpEnabled] = useState(settings.smtp?.enabled ?? true);
  const [smtpSenderEmail, setSmtpSenderEmail] = useState(
    settings.smtp?.senderEmail || 'nasirdigitalhub@pipilikhost.com'
  );
  const [smtpSenderName, setSmtpSenderName] = useState(
    settings.smtp?.senderName || 'Nasir Digital Hub'
  );
  const [smtpHost, setSmtpHost] = useState(
    settings.smtp?.smtpHost || 'smtp.hostinger.com'
  );
  const [smtpPort, setSmtpPort] = useState<number>(
    settings.smtp?.smtpPort || 465
  );
  const [smtpPassword, setSmtpPassword] = useState(
    settings.smtp?.smtpPassword || '4ea22f7ead670187bbb994158af679a61877a6df5affcaf3a3d710f9fc11edba'
  );
  const [testEmailRecipient, setTestEmailRecipient] = useState(
    settings.smtp?.adminNotificationEmail || 'nasirdigitalhub@pipilikhost.com'
  );
  const [testEmailStatus, setTestEmailStatus] = useState<string | null>(null);
  const [isTestingEmail, setIsTestingEmail] = useState(false);

  // Keep form in sync when Firestore settings finish loading or update
  useEffect(() => {
    setWebsiteName(settings.websiteName || 'Nasir Digital Hub');
    setTagline(settings.tagline || 'প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস');
    setDescription(settings.description || '');
    setHideHeaderTitle(settings.hideHeaderTitle !== false);

    // Automatically strip solid black JPEG background from existing logos if needed
    const rawLogo = settings.logoUrl || '';
    if (rawLogo.startsWith('data:image/jpeg')) {
      compactDataUrl(rawLogo, 65000, 420, true).then((cleaned) => setLogoUrl(cleaned));
    } else {
      setLogoUrl(rawLogo);
    }

    const rawLoadingLogo = settings.loadingLogoUrl || '';
    if (rawLoadingLogo.startsWith('data:image/jpeg')) {
      compactDataUrl(rawLoadingLogo, 65000, 420, true).then((cleaned) => setLoadingLogoUrl(cleaned));
    } else {
      setLoadingLogoUrl(rawLoadingLogo);
    }

    setFaviconUrl(settings.faviconUrl || '');
    setMetaTitle(
      settings.metaTitle ||
        `${settings.websiteName || 'Nasir Digital Hub'} — প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস`
    );
    setMetaDescription(
      settings.metaDescription ||
        settings.description ||
        'Nasir Digital Hub — বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, Canva Pro, প্রিমিয়াম সাবস্ক্রিপশন, ডিজাইন টেমপ্লেট ও অনলাইন টুলস এর বিশ্বস্ত মার্কেটপ্লেস।'
    );
    setMetaKeywords(settings.metaKeywords || RECOMMENDED_SEO_KEYWORDS.join(', '));
    setOgImageUrl(settings.ogImageUrl || '');
    setWhatsappNumber(settings.whatsappNumber || '01962780922');
    setDeliveryCharge(settings.deliveryCharge || 0);
    setAnnouncementEnabled(settings.announcement?.enabled ?? true);
    setAnnouncementText(
      settings.announcement?.text || '🔥 আজকের বিশেষ অফার — সীমিত সময়ের জন্য বিশেষ ছাড়!'
    );
    setAnnouncementLink(settings.announcement?.link || '#discount');
    setEmail(settings.email || 'info@nasirdigitalhub.com');
    setAddress(settings.address || 'ঢাকা, বাংলাদেশ');
    setFacebookUrl(settings.facebookUrl || 'https://facebook.com');
    setYoutubeUrl(settings.youtubeUrl || 'https://youtube.com');
    setTelegramUrl(settings.telegramUrl || 'https://t.me');

    // PayBD Sync
    setPaybdEnabled(settings.paybd?.enabled ?? true);
    setPaybdApiKey(
      settings.paybd?.apiKey || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ'
    );
    setPaybdSecretKey(
      settings.paybd?.secretKey || 'fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg'
    );
    setPaybdBrandKey(
      settings.paybd?.brandKey || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ'
    );
    setPaybdGatewayUrl(
      settings.paybd?.gatewayUrl || 'https://app-paybd.pipilikhost.com/api/payment/create'
    );

    // SMTP Sync
    setSmtpEnabled(settings.smtp?.enabled ?? true);
    setSmtpSenderEmail(settings.smtp?.senderEmail || 'nasirdigitalhub@pipilikhost.com');
    setSmtpSenderName(settings.smtp?.senderName || 'Nasir Digital Hub');
    setSmtpHost(settings.smtp?.smtpHost || 'smtp.hostinger.com');
    setSmtpPort(settings.smtp?.smtpPort || 465);
    setSmtpPassword(
      settings.smtp?.smtpPassword ||
        '4ea22f7ead670187bbb994158af679a61877a6df5affcaf3a3d710f9fc11edba'
    );
    setTestEmailRecipient(
      settings.smtp?.adminNotificationEmail || 'nasirdigitalhub@pipilikhost.com'
    );
  }, [settings]);

  const handleTestEmail = async () => {
    if (!testEmailRecipient || !testEmailRecipient.includes('@')) {
      setTestEmailStatus('অনুগ্রহ করে সঠিক টেস্ট প্রাপক ইমেইল লিখুন।');
      return;
    }

    setIsTestingEmail(true);
    setTestEmailStatus(null);
    try {
      const { dispatchTestEmail } = await import('../utils/clientEmailDelivery');
      const result = await dispatchTestEmail(testEmailRecipient.trim(), smtpPassword.trim());
      if (result && result.success) {
        setTestEmailStatus(`✅ ${result.message || 'টেস্ট ইমেইল সফলভাবে পাঠানো হয়েছে!'}`);
      } else {
        setTestEmailStatus(`❌ এরর: ${result?.message || result?.error || 'ইমেইল পাঠাতে সমস্যা হয়েছে।'}`);
      }
    } catch (err: any) {
      setTestEmailStatus(`❌ নেটওয়ার্ক এরর: ${err?.message || 'টেস্ট সম্পন্ন করা যায়নি।'}`);
    } finally {
      setIsTestingEmail(false);
    }
  };

  // Parse keywords into array for interactive chips
  const keywordList = metaKeywords
    .split(',')
    .map((k) => k.trim())
    .filter(Boolean);

  const handleAddKeyword = () => {
    const clean = newKeywordInput.trim();
    if (!clean) return;
    if (!keywordList.includes(clean)) {
      const updated = [...keywordList, clean].join(', ');
      setMetaKeywords(updated);
    }
    setNewKeywordInput('');
  };

  const handleRemoveKeyword = (tagToRemove: string) => {
    const updated = keywordList.filter((k) => k !== tagToRemove).join(', ');
    setMetaKeywords(updated);
  };

  const handleAutoGenerateSeo = () => {
    const cleanSite = websiteName.trim() || 'Nasir Digital Hub';
    setMetaTitle(`${cleanSite} — প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস`);
    setMetaDescription(
      `${cleanSite} — বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, Canva Pro, প্রিমিয়াম সাবস্ক্রিপশন, ডিজাইন ও ভিডিও টেমপ্লেট এবং অনলাইন টুলস এর বিশ্বস্ত প্রতিষ্ঠান। ইন্সট্যান্ট ডেলিভারি ও ২৪/৭ সাপোর্ট।`
    );
    setMetaKeywords(RECOMMENDED_SEO_KEYWORDS.join(', '));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const cleanName = websiteName.trim();
    if (!cleanName) {
      setFormError('ওয়েবসাইটের নাম আবশ্যক।');
      return;
    }

    const cleanPhone = whatsappNumber.trim().replace(/[^0-9+]/g, '');
    if (!cleanPhone || cleanPhone.length < 8) {
      setFormError('একটি সঠিক WhatsApp নম্বর প্রদান করুন।');
      return;
    }

    if (logoUrl.trim() && !isSafeImageUrl(logoUrl.trim())) {
      setFormError('অবৈধ লোগো ইমেজ লিঙ্ক। শুধুমাত্র নিরাপদ https:// অথবা ডিভাইস ছবি ব্যবহার করুন।');
      return;
    }

    if (loadingLogoUrl.trim() && !isSafeImageUrl(loadingLogoUrl.trim())) {
      setFormError('অবৈধ লোডিং লোগো ইমেজ লিঙ্ক। শুধুমাত্র নিরাপদ https:// অথবা ডিভাইস ছবি ব্যবহার করুন।');
      return;
    }

    if (faviconUrl.trim() && !isSafeImageUrl(faviconUrl.trim())) {
      setFormError('অবৈধ ফেভিকন ইমেজ লিঙ্ক।');
      return;
    }

    if (ogImageUrl.trim() && !isSafeImageUrl(ogImageUrl.trim())) {
      setFormError('অবৈধ সোশ্যাল শেয়ার ব্যানার ইমেজ লিঙ্ক।');
      return;
    }

    const numDelivery = Number(deliveryCharge);
    if (isNaN(numDelivery) || numDelivery < 0) {
      setFormError('ডেলিভারি চার্জ ঋণাত্মক হতে পারে না।');
      return;
    }

    setIsSubmitting(true);
    try {
      const cleanMetaDesc = metaDescription.trim() || description.trim();
      await updateStoreSettings({
        ...settings,
        websiteName: cleanName.slice(0, 150),
        tagline: tagline.trim().slice(0, 300),
        description: (description.trim() || cleanMetaDesc).slice(0, 5000),
        metaTitle: (metaTitle.trim() || cleanName).slice(0, 300),
        metaDescription: cleanMetaDesc.slice(0, 2000),
        metaKeywords: metaKeywords.trim().slice(0, 2000),
        ogImageUrl: ogImageUrl.trim(),
        hideHeaderTitle: Boolean(hideHeaderTitle),
        whatsappNumber: cleanPhone.slice(0, 50),
        deliveryCharge: numDelivery,
        logoUrl: logoUrl.trim(),
        loadingLogoUrl: loadingLogoUrl.trim(),
        faviconUrl: faviconUrl.trim(),
        announcement: {
          enabled: Boolean(announcementEnabled),
          text: announcementText.trim().slice(0, 500),
          link: announcementLink.trim().slice(0, 500),
        },
        email: email.trim().slice(0, 200),
        address: address.trim().slice(0, 500),
        facebookUrl: facebookUrl.trim().slice(0, 500),
        youtubeUrl: youtubeUrl.trim().slice(0, 500),
        telegramUrl: telegramUrl.trim().slice(0, 500),
        paybd: {
          enabled: Boolean(paybdEnabled),
          apiKey: paybdApiKey.trim() || 'r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ',
          secretKey: paybdSecretKey.trim(),
          brandKey: paybdBrandKey.trim(),
          gatewayUrl: paybdGatewayUrl.trim() || 'https://app-paybd.pipilikhost.com/api/payment/create',
        },
        smtp: {
          enabled: Boolean(smtpEnabled),
          senderEmail: smtpSenderEmail.trim() || 'nasirdigitalhub@pipilikhost.com',
          senderName: smtpSenderName.trim() || 'Nasir Digital Hub',
          smtpHost: smtpHost.trim() || 'smtp.hostinger.com',
          smtpPort: Number(smtpPort) || 465,
          smtpUser: smtpSenderEmail.trim() || 'nasirdigitalhub@pipilikhost.com',
          smtpPassword: smtpPassword.trim(),
          secure: Number(smtpPort) === 465,
          notifyAdmin: true,
          adminNotificationEmail: testEmailRecipient.trim() || 'nasirdigitalhub@pipilikhost.com',
        },
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3500);
    } catch (err) {
      console.error('Update settings error:', err);
      setFormError('স্টোর সেটিংস সংরক্ষণ করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInstantLogoSave = async (partial: {
    logoUrl?: string;
    loadingLogoUrl?: string;
    faviconUrl?: string;
  }) => {
    setFormError(null);
    try {
      await updateStoreSettings({
        ...settings,
        websiteName: websiteName.trim() || settings.websiteName || 'Nasir Digital Hub',
        whatsappNumber: whatsappNumber.trim() || settings.whatsappNumber || '01962780922',
        logoUrl: partial.logoUrl !== undefined ? partial.logoUrl : logoUrl,
        loadingLogoUrl:
          partial.loadingLogoUrl !== undefined ? partial.loadingLogoUrl : loadingLogoUrl,
        faviconUrl: partial.faviconUrl !== undefined ? partial.faviconUrl : faviconUrl,
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Auto save logo error:', err);
    }
  };

  const previewUrl =
    typeof window !== 'undefined' ? window.location.origin : 'https://nasirdigitalhub.com';
  const previewShareTitle =
    metaTitle.trim() || `${websiteName || 'Nasir Digital Hub'} — প্রিমিয়াম ডিজিটাল প্রোডাক্ট মার্কেটপ্লেস`;
  const previewShareDesc =
    metaDescription.trim() ||
    description.trim() ||
    'বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স ও অনলাইন টুলস শপ।';
  const previewShareImg =
    ogImageUrl.trim() ||
    logoUrl.trim() ||
    (settings.heroSlides && settings.heroSlides[0]?.imageUrl) ||
    '';

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Store className="w-5 h-5 text-indigo-400" />
            <span>ওয়েবসাইট, লোগো ও গুগল এসইও (SEO) সেটিংস</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            লোগো সিস্টেম, গুগল র‍্যাংকিং মেটা ট্যাগ ও ডেসক্রিপশন, লিংক শেয়ার প্রিভিউ এবং স্টোর সেটিংস নিয়ন্ত্রণ করুন
          </p>
        </div>

        {savedSuccess && (
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/20 animate-pulse">
            <CheckCircle2 className="w-4 h-4" /> ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে!
          </span>
        )}
      </div>

      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}

      <form
        onSubmit={handleSave}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl"
      >
        {/* 1. Brand & Screenshot Reference Logo System */}
        <div className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <Store className="w-4 h-4" /> ১. ব্র্যান্ড ও লোগো সিস্টেম (স্ক্রিনশট রেফারেন্স স্টাইল)
            </h3>
            <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
              হেডার ও লোডিং স্ক্রিনে অটো-সিঙ্ক
            </span>
          </div>

          {/* Live Header & Loading Animation Logo Previews */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Live Header Logo Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  হেডার লোগো প্রিভিউ:
                </span>
                <p className="text-[11px] text-slate-500">
                  ওয়েবসাইটের উপরের সাদা নেভবারে যেভাবে দেখাবে
                </p>
              </div>
              <div className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 shadow-md flex items-center justify-center shrink-0">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt={websiteName}
                    className="h-10 w-auto max-w-[160px] object-contain"
                  />
                ) : (
                  <BrandLogo variant="header" />
                )}
              </div>
            </div>

            {/* Live Loading Animation Custom Logo Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/25 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  লোডিং অ্যানিমেশন প্রিভিউ:
                </span>
                <p className="text-[11px] text-slate-400">
                  পেজ রিলোড দেওয়ার সময় যে লোগো অ্যানিমেশন দেখাবে
                </p>
              </div>
              <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full border-2 border-slate-800 border-t-emerald-400 border-r-teal-400 animate-spin" />
                <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/15 flex items-center justify-center overflow-hidden p-1.5 shadow-lg shadow-emerald-500/20">
                  {loadingLogoUrl || logoUrl ? (
                    <img
                      src={loadingLogoUrl || logoUrl}
                      alt={websiteName}
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <BrandLogo variant="loader" />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ওয়েবসাইটের মূল নাম (Website Name — লিংক শেয়ার ও এসইও-এর জন্য) *
              </label>
              <input
                type="text"
                required
                maxLength={150}
                value={websiteName}
                onChange={(e) => setWebsiteName(e.target.value)}
                placeholder="Nasir Digital Hub"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                সাব-ট্যাগলাইন (Logo Tagline)
              </label>
              <input
                type="text"
                maxLength={300}
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="Digital Products Service"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Browser Hidden Title Toggle (Requested Feature) */}
          <div className="p-3.5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 flex items-start gap-3">
            <input
              type="checkbox"
              id="hideHeaderTitleCheck"
              checked={hideHeaderTitle}
              onChange={(e) => setHideHeaderTitle(e.target.checked)}
              className="mt-0.5 rounded bg-slate-950 border-slate-700 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <label htmlFor="hideHeaderTitleCheck" className="cursor-pointer space-y-0.5">
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <EyeOff className="w-3.5 h-3.5 text-indigo-400" />
                ওয়েব ব্রাউজারে ফুল টেক্সট টাইটেল হিডেন রাখুন (শুধুমাত্র স্ক্রিনশট স্টাইল লোগো শো করবে)
              </span>
              <span className="block text-[11px] text-slate-400">
                এটি চালু থাকলে ওয়েবসাইটের হেডার ও লোডিং স্ক্রিনে শুধু প্রফেশনাল লোগো দেখাবে, আর &quot;{websiteName || 'Nasir Digital Hub'}&quot; নাম ও ডেসক্রিপশন ব্রাউজারে হিডেন (`sr-only` ও Meta Tag) থাকবে যাতে কাউকে লিংক শেয়ার করলে এবং গুগল সার্চে পূর্ণ নাম ও ডেসক্রিপশন দেখায়।
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <ImageUploader
              label="১. হেডার ও সাইট লোগো (Main Header Logo)"
              value={logoUrl}
              onChange={(url) => {
                setLogoUrl(url);
                handleInstantLogoSave({ logoUrl: url });
              }}
              helperText="হেডারে দেখানোর জন্য কাস্টম লোগো আপলোড করুন (আপলোড করলেই অটো-সেভ হবে)"
              maxDimension={380}
            />

            <ImageUploader
              label="২. লোডিং অ্যানিমেশন কাস্টম লোগো (Loading Animation Logo)"
              value={loadingLogoUrl}
              onChange={(url) => {
                setLoadingLogoUrl(url);
                handleInstantLogoSave({ loadingLogoUrl: url });
              }}
              helperText="পেজ লোড হওয়ার সময় অ্যানিমেশনের ভেতরে যে কাস্টম লোগো শো করবে (অটো-সেভ হবে)"
              maxDimension={380}
            />

            <ImageUploader
              label="৩. ব্রাউজার ট্যাব ফেভিকন আইকন (Favicon)"
              value={faviconUrl}
              onChange={(url) => {
                setFaviconUrl(url);
                handleInstantLogoSave({ faviconUrl: url });
              }}
              helperText="ব্রাউজারের ট্যাবে দেখানোর জন্য ছোট আইকন (অটো-সেভ হবে)"
              maxDimension={128}
            />
          </div>
        </div>

        {/* 2. Google Ranking SEO, Meta Tags & Social Link Share Preview Section */}
        <div className="pt-6 border-t border-slate-800 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Search className="w-4 h-4" /> ২. গুগল র‍্যাংকিং এসইও (SEO), মেটা ট্যাগ ও ডেসক্রিপশন
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                গুগল সার্চে সাইট র‍্যাংক করার জন্য এবং হোয়াটসঅ্যাপ/ফেসবুকে লিংক শেয়ার করলে যে টাইটেল ও ডেসক্রিপশন দেখাবে
              </p>
            </div>

            <button
              type="button"
              onClick={handleAutoGenerateSeo}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>গুগল র‍্যাংকিং অটো-এসইও সেট করুন</span>
            </button>
          </div>

          {/* Meta Title Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                মেটা টাইটেল (SEO Meta Title & Social Share Title) *
              </label>
              <span
                className={`text-[11px] font-semibold ${
                  metaTitle.length >= 30 && metaTitle.length <= 70
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {metaTitle.length} অক্ষর (গুগল স্ট্যান্ডার্ড: ৩০-৬৫ অক্ষর)
              </span>
            </div>
            <input
              type="text"
              maxLength={250}
              value={metaTitle}
              onChange={(e) => setMetaTitle(e.target.value)}
              placeholder="Nasir Digital Hub — প্রিমিয়াম ডিজিটাল প্রোডাক্ট ও সফটওয়্যার মার্কেটপ্লেস"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Meta Description Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-300">
                মেটা ডেসক্রিপশন (SEO Meta Description — গুগল ও লিংক শেয়ার বর্ণনা) *
              </label>
              <span
                className={`text-[11px] font-semibold ${
                  metaDescription.length >= 100 && metaDescription.length <= 220
                    ? 'text-emerald-400'
                    : 'text-amber-400'
                }`}
              >
                {metaDescription.length} অক্ষর (গুগল স্ট্যান্ডার্ড: ১২০-১৬০ অক্ষর)
              </span>
            </div>
            <textarea
              rows={3}
              maxLength={1500}
              value={metaDescription}
              onChange={(e) => {
                setMetaDescription(e.target.value);
                setDescription(e.target.value);
              }}
              placeholder="Nasir Digital Hub — বাংলাদেশের সেরা ডিজিটাল প্রোডাক্ট, সফটওয়্যার লাইসেন্স, Canva Pro, প্রিমিয়াম সাবস্ক্রিপশন ও অনলাইন টুলস শপ।"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Meta Keywords / SEO Tags */}
          <div className="space-y-2.5">
            <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-emerald-400" />
              <span>মেটা ট্যাগ ও গুগল সার্চ কিওয়ার্ডসমূহ (SEO Meta Tags / Keywords)</span>
            </label>

            {/* Interactive Tag Adder */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newKeywordInput}
                onChange={(e) => setNewKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddKeyword();
                  }
                }}
                placeholder="নতুন এসইও ট্যাগ লিখে Enter চাপুন (যেমন: Canva Pro BD, Digital Product)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
              <button
                type="button"
                onClick={handleAddKeyword}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ট্যাগ যোগ করুন</span>
              </button>
            </div>

            {/* Active Tag Chips */}
            {keywordList.length > 0 && (
              <div className="flex flex-wrap gap-1.5 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80">
                {keywordList.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium"
                  >
                    <span>#{tag}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveKeyword(tag)}
                      className="text-slate-400 hover:text-rose-400 transition-colors cursor-pointer"
                      title="ট্যাগ মুছুন"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}

            {/* Direct Comma-Separated Editor */}
            <input
              type="text"
              maxLength={2000}
              value={metaKeywords}
              onChange={(e) => setMetaKeywords(e.target.value)}
              placeholder="কমা দিয়ে মেটা ট্যাগগুলো লিখুন..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-[11px] text-slate-300 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Social Share Image (og:image) */}
          <ImageUploader
            label="সোশ্যাল লিংক শেয়ার প্রিভিউ ব্যানার (Social Share OG Image - ঐচ্ছিক)"
            value={ogImageUrl}
            onChange={(url) => setOgImageUrl(url)}
            helperText="কাউকে লিংক শেয়ার করলে কার্ডে যে থাম্বনেইল ছবি দেখাবে (খালি থাকলে লোগো বা প্রথম হিরো ব্যানার দেখাবে)"
            maxDimension={800}
          />

          {/* Live Previews: Google Search Result & Social Link Share Card */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 pt-2">
            {/* Google Search Result Live Preview */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" /> গুগল সার্চ র‍্যাংকিং প্রিভিউ (Google Snippet)
                </span>
                <span className="text-[10px] text-slate-500">SEO Live Preview</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white text-slate-900 shadow-sm space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
                    {faviconUrl || logoUrl ? (
                      <img
                        src={faviconUrl || logoUrl}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    ) : (
                      <span className="text-[9px] font-black text-emerald-600">N</span>
                    )}
                  </div>
                  <div className="truncate">
                    <span className="font-semibold text-slate-800 block leading-none">
                      {websiteName || 'Nasir Digital Hub'}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate block">{previewUrl}</span>
                  </div>
                </div>
                <h4 className="text-sm font-bold text-[#1a0dab] hover:underline line-clamp-1 pt-0.5">
                  {previewShareTitle}
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {previewShareDesc}
                </p>
              </div>
            </div>

            {/* Social Link Share Card Preview (WhatsApp / Facebook / Messenger) */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Share2 className="w-3.5 h-3.5" /> লিংক শেয়ার প্রিভিউ (WhatsApp / Facebook)
                </span>
                <span className="text-[10px] text-slate-500">OpenGraph Card</span>
              </div>
              <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm">
                {previewShareImg && (
                  <div className="h-24 w-full bg-slate-950 border-b border-slate-800 flex items-center justify-center overflow-hidden">
                    <img
                      src={previewShareImg}
                      alt={websiteName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-3 space-y-1 bg-slate-900/90">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block truncate">
                    {websiteName || 'Nasir Digital Hub'} • {previewUrl.replace(/^https?:\/\//, '')}
                  </span>
                  <h4 className="text-xs font-bold text-white line-clamp-1">
                    {previewShareTitle}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {previewShareDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Contact & WhatsApp Order Channel */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <Phone className="w-4 h-4" /> ৩. যোগাযোগ ও WhatsApp অর্ডার হেল্পলাইন
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                অ্যাডমিন WhatsApp নম্বর *
              </label>
              <input
                type="text"
                required
                maxLength={30}
                placeholder="01962780922"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ডেলিভারি চার্জ (BDT ৳)
              </label>
              <input
                type="number"
                min="0"
                value={deliveryCharge}
                onChange={(e) => setDeliveryCharge(Math.max(0, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                অফিসিয়াল ইমেইল
              </label>
              <input
                type="email"
                maxLength={200}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              অফিস বা ব্যবসায়িক ঠিকানা
            </label>
            <input
              type="text"
              maxLength={500}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* 4. Social Media Links */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
            <Globe className="w-4 h-4" /> ৪. সোশ্যাল মিডিয়া লিংক (Social Links)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Facebook Page URL
              </label>
              <input
                type="url"
                placeholder="https://facebook.com/..."
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                YouTube Channel URL
              </label>
              <input
                type="url"
                placeholder="https://youtube.com/..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Telegram Channel / Support URL
              </label>
              <input
                type="url"
                placeholder="https://t.me/..."
                value={telegramUrl}
                onChange={(e) => setTelegramUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 5. Announcement Bar Settings */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <Bell className="w-4 h-4" /> ৫. শীর্ষ ঘোষণা বার (Top Announcement Bar)
          </h3>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="announcementCheck"
              checked={announcementEnabled}
              onChange={(e) => setAnnouncementEnabled(e.target.checked)}
              className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0 w-4 h-4 cursor-pointer"
            />
            <label
              htmlFor="announcementCheck"
              className="text-xs text-slate-200 cursor-pointer font-medium"
            >
              ঘোষণা বার ওয়েবসাইটের শীর্ষে সক্রিয় রাখুন
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                ঘোষণার বার্তা
              </label>
              <input
                type="text"
                maxLength={500}
                value={announcementText}
                onChange={(e) => setAnnouncementText(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                টার্গেট লিংক
              </label>
              <input
                type="text"
                maxLength={500}
                value={announcementLink}
                onChange={(e) => setAnnouncementLink(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* 6. PayBD (Pipilik Host) Payment Gateway Integration */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" /> ৬. PayBD (Pipilik Host) পেমেন্ট গেটওয়ে
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                গ্রাহক যাতে সরাসরি bKash, Nagad, Rocket, Upay ও কার্ডের মাধ্যমে স্বয়ংক্রিয় অনলাইন পেমেন্ট করতে পারে
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="paybdEnabledCheck"
                checked={paybdEnabled}
                onChange={(e) => setPaybdEnabled(e.target.checked)}
                className="rounded bg-slate-900 border-slate-800 text-emerald-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="paybdEnabledCheck"
                className="text-xs font-bold text-white cursor-pointer select-none"
              >
                {paybdEnabled ? 'পেমেন্ট গেটওয়ে সক্রিয়' : 'পেমেন্ট গেটওয়ে নিষ্ক্রিয়'}
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-start gap-2.5 text-xs text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">Pipilik Host PayBD / JonotaPay ইন্টিগ্রেশন</p>
                <p className="text-slate-300 text-[11px]">
                  লাইভ ডায়াগনস্টিক টেস্ট, পিং ভেরিফিকেশন ও ওয়েব হুক গাইড দেখতে উপরের <strong>"পেমেন্ট গেটওয়ে (PayBD)"</strong> ট্যাব ব্যবহার করুন।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BRAND-KEY *</span>
                </label>
                <input
                  type="text"
                  placeholder="আপনার BRAND-KEY দিন"
                  value={paybdBrandKey}
                  onChange={(e) => setPaybdBrandKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-indigo-400" />
                  <span>DEVICE-KEY / SECRET-KEY</span>
                </label>
                <input
                  type="text"
                  placeholder="আপনার Device Key দিন"
                  value={paybdSecretKey}
                  onChange={(e) => setPaybdSecretKey(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                Gateway Create URL (ডিফল্ট: Pipilik Host Production)
              </label>
              <input
                type="url"
                value={paybdGatewayUrl}
                onChange={(e) => setPaybdGatewayUrl(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 7. Hostinger Business Email & Instant Product Delivery Settings */}
        <div className="pt-6 border-t border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
                <Mail className="w-4 h-4" /> ৭. হোস্টইঙ্গার বিজনেস ইমেইল ও ইনস্ট্যান্ট প্রোডাক্ট ডেলিভারি
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">
                পেমেন্ট সম্পন্ন হওয়ার সাথে সাথে স্বয়ংক্রিয়ভাবে কাস্টমারের ইমেইলে ডাউনলোড ও লাইসেন্স লিঙ্ক পৌঁছে যাবে
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="smtpEnabledCheck"
                checked={smtpEnabled}
                onChange={(e) => setSmtpEnabled(e.target.checked)}
                className="rounded bg-slate-900 border-slate-800 text-sky-600 focus:ring-0 w-4 h-4 cursor-pointer"
              />
              <label
                htmlFor="smtpEnabledCheck"
                className="text-xs font-bold text-white cursor-pointer select-none"
              >
                {smtpEnabled ? 'অটোমেটিক ইমেইল সক্রিয়' : 'ইমেইল ডেলিভারি নিষ্ক্রিয়'}
              </label>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
            <div className="flex items-start gap-2.5 text-xs text-sky-300 bg-sky-500/10 border border-sky-500/20 p-3 rounded-xl">
              <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold text-white">হোস্টইঙ্গার SMTP ও অটোমেশন কানেকশন</p>
                <p className="text-slate-300 text-[11px]">
                  প্রেরক ইমেইল: <strong className="text-sky-300 font-mono">nasirdigitalhub@pipilikhost.com</strong>। প্রতিটি অর্ডারের একটি কপি স্বয়ংক্রিয়ভাবে আপনার অ্যাডমিন ইনবক্সেও জমা হবে।
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-sky-400" />
                  <span>প্রেরক বিজনেস ইমেইল (Sender Email) *</span>
                </label>
                <input
                  type="email"
                  placeholder="nasirdigitalhub@pipilikhost.com"
                  value={smtpSenderEmail}
                  onChange={(e) => setSmtpSenderEmail(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  প্রেরকের নাম (Sender Name)
                </label>
                <input
                  type="text"
                  placeholder="Nasir Digital Hub"
                  value={smtpSenderName}
                  onChange={(e) => setSmtpSenderName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SMTP Host
                </label>
                <input
                  type="text"
                  placeholder="smtp.hostinger.com"
                  value={smtpHost}
                  onChange={(e) => setSmtpHost(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  SMTP Port (SSL: 465 / TLS: 587)
                </label>
                <input
                  type="number"
                  placeholder="465"
                  value={smtpPort}
                  onChange={(e) => setSmtpPort(Number(e.target.value) || 465)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1">
                  <Key className="w-3.5 h-3.5 text-amber-400" />
                  <span>Hostinger Mail API / পাসওয়ার্ড</span>
                </label>
                <input
                  type="text"
                  placeholder="API Key বা ইমেইল পাসওয়ার্ড"
                  value={smtpPassword}
                  onChange={(e) => setSmtpPassword(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            {/* Test Email Section */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-sky-400" />
                  <span>লাইভ টেস্ট ইমেইল পাঠান</span>
                </p>
                <p className="text-[11px] text-slate-400">
                  নিচের ইমেইলে একটি পরীক্ষামূলক ইমেইল পাঠিয়ে যাচাই করুন
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="email"
                  placeholder="টেস্ট ইমেইল ঠিকানা..."
                  value={testEmailRecipient}
                  onChange={(e) => setTestEmailRecipient(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-sky-400 w-full sm:w-56"
                />
                <button
                  type="button"
                  onClick={handleTestEmail}
                  disabled={isTestingEmail}
                  className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow transition-all shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {isTestingEmail ? 'পাঠানো হচ্ছে...' : 'টেস্ট পাঠান'}
                </button>
              </div>
            </div>

            {testEmailStatus && (
              <div
                className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                  testEmailStatus.startsWith('✅')
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-300'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-300'
                }`}
              >
                <span>{testEmailStatus}</span>
              </div>
            )}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-7 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSubmitting ? 'সংরক্ষণ হচ্ছে...' : 'সব সেটিংস সংরক্ষণ করুন'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
