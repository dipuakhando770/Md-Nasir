import { createCategory, createProduct, updateStoreSettings, createBenefit } from '../firebase/services';

export async function seedInitialCatalog(): Promise<void> {
  // 1. Categories
  const catSoftwareId = await createCategory({
    name: 'সফটওয়্যার ও ইউটিলিটি',
    slug: 'software-utility',
    description: 'জেনুইন সফটওয়্যার লাইসেন্স কি এবং পিসি ইউটিলিটি টুলস',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80',
    sortOrder: 1,
    active: true,
    createdAt: Date.now(),
  });

  const catGraphicId = await createCategory({
    name: 'গ্রাফিক্স ও ভিডিও টেমপ্লেট',
    slug: 'graphics-video',
    description: 'প্রিমিয়ার প্রো, আফটার ইফেক্টস এবং ফটোশপ রেডিমেড প্রজেক্ট ফাইলস',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=600&q=80',
    sortOrder: 2,
    active: true,
    createdAt: Date.now(),
  });

  const catWebId = await createCategory({
    name: 'ওয়ার্ডপ্রেস ও ওয়েব থিম',
    slug: 'wordpress-themes',
    description: 'এলিমেন্টর প্রো, প্রিমিয়াম ওয়ার্ডপ্রেস থিম এবং প্লাগইনস',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=600&q=80',
    sortOrder: 3,
    active: true,
    createdAt: Date.now(),
  });

  const catAiId = await createCategory({
    name: 'এআই ও প্রিমিয়াম অ্যাকাউন্টস',
    slug: 'ai-premium-tools',
    description: 'ক্যানভা প্রো, ক্যাপকাট প্রো এবং আধুনিক এআই টুলস সাবস্ক্রিপশন',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    sortOrder: 4,
    active: true,
    createdAt: Date.now(),
  });

  // 2. Products
  const p1 = await createProduct({
    title: 'Canva Pro 1-Year Private / Team Access',
    slug: 'canva-pro-1-year',
    categoryId: catAiId,
    description: `ক্যানভা প্রো ১ বছর মেয়াদি অরিজিনাল লাইসেন্স এক্সেস।\n• আনলিমিটেড প্রিমিয়াম টেমপ্লেট ও এলিমেন্টস ব্যবহার\n• ব্যাকগ্রাউন্ড রিমুভার ১ ক্লিকে\n• ফুল এইচডি ও এসভিজি এক্সপোর্ট\n• নিজস্ব ব্র্যান্ড কিট এবং ফন্ট আপলোড সুবিধা\n• ১০০% প্রাইভেট এবং নিরাপদ এক্সেস`,
    shortDescription: 'ক্যানভা প্রো ১ বছর ফুল অ্যাক্টিভেশন ও লাইফটাইম সাপোর্ট',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    price: 350,
    oldPrice: 850,
    available: true,
    featured: true,
    newArrival: true,
    rating: 4.9,
    reviewCount: 48,
    type: 'digital',
    downloadUrl: 'https://nasirdigitalhub.com/access/canva-pro',
    tags: ['canva', 'design', 'graphic', 'pro'],
    createdAt: Date.now() - 10000,
  });

  const p2 = await createProduct({
    title: 'Windows 11 Pro Genuine Retail Lifetime Key',
    slug: 'windows-11-pro-lifetime-key',
    categoryId: catSoftwareId,
    description: `উইন্ডোজ ১১ প্রো ১০০% অরিজিনাল রিটেইল লাইসেন্স কী।\n• ১টি পিসির জন্য লাইফটাইম ভ্যালিডিটি\n• মাইক্রোসফট অফিসিয়াল সার্ভার থেকে অনলাইন অ্যাক্টিভেশন\n• সকল উইন্ডোজ আপডেট সরাসরি সাপোর্ট করবে\n• রি-ইন্সটলেশন সাপোর্ট অন্তর্ভুক্ত`,
    shortDescription: '১০০% অরিজিনাল রিটেইল লাইসেন্স কী (লাইফটাইম মেয়াদ)',
    imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    price: 499,
    oldPrice: 1200,
    available: true,
    featured: true,
    newArrival: false,
    rating: 5.0,
    reviewCount: 35,
    type: 'digital',
    downloadUrl: 'https://nasirdigitalhub.com/keys/win11pro',
    tags: ['windows', 'microsoft', 'windows11', 'license'],
    createdAt: Date.now() - 20000,
  });

  const p3 = await createProduct({
    title: 'CapCut Pro 1-Year VIP Subscription Access',
    slug: 'capcut-pro-1-year',
    categoryId: catAiId,
    description: `ক্যাপকাট প্রো ১ বছর ভিআইপি এক্সেস। মোবাইল এবং পিসি উভয় ভার্সনে প্রিমিয়াম ফিচার ব্যবহার করা যাবে।\n• অটো ক্যাপশন ও বাংলা সাবটাইটেল সাপোর্ট\n• প্রো ট্রানজিশন ও এফেক্টস আনলকড\n• ফোর-কে (4K 60FPS) এক্সপোর্ট সুবিধা\n• কোনো ওয়াটারমার্ক থাকবে না`,
    shortDescription: 'পিসি ও মোবাইলে ফুল প্রো ফিচার অ্যাক্সেস ১ বছর মেয়াদে',
    imageUrl: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
    price: 450,
    oldPrice: 950,
    available: true,
    featured: true,
    newArrival: true,
    rating: 4.8,
    reviewCount: 29,
    type: 'digital',
    downloadUrl: 'https://nasirdigitalhub.com/capcut-pro',
    tags: ['capcut', 'video editing', 'reels', 'tiktok'],
    createdAt: Date.now() - 30000,
  });

  const p4 = await createProduct({
    title: '500+ Mega Video Editing Motion Graphics Asset Bundle',
    slug: 'mega-video-editing-bundle',
    categoryId: catGraphicId,
    description: `ভিডিও এডিটর ও কনটেন্ট ক্রিয়েটরদের জন্য মেগা মোশন গ্রাফিক্স বান্ডেল।\n• ৫০০+ প্রিমিয়ার প্রো ও আফটার ইফেক্টস প্রজেক্ট ফাইল\n• লোয়ার থার্ডস, টাইটেলস, ট্রানজিশনস ও সাউন্ড এফেক্টস\n• ইউটিউব ও ফেসবুক ভিডিওর জন্য রেডি টেমপ্লেট\n• গুগল ড্রাইভ লাইফটাইম হাই-স্পিড ডাউনলোড অ্যাক্সেস`,
    shortDescription: '৫০০+ প্রিমিয়াম ভিডিও এডিটিং মোশন গ্রাফিক্স প্যাক',
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=800&q=80',
    price: 299,
    oldPrice: 800,
    available: true,
    featured: false,
    newArrival: true,
    rating: 4.9,
    reviewCount: 19,
    type: 'digital',
    downloadUrl: 'https://drive.google.com',
    tags: ['premiere pro', 'after effects', 'motion', 'video'],
    createdAt: Date.now() - 40000,
  });

  const p5 = await createProduct({
    title: 'Elementor Pro Agency License for 1 Website',
    slug: 'elementor-pro-agency-license',
    categoryId: catWebId,
    description: `ওয়ার্ডপ্রেসের জন্য এলিমেন্টর প্রো জেনুইন এজেন্সী লাইসেন্স এক্সেস।\n• সরাসরি ড্যাশবোর্ড থেকে ওয়ান-ক্লিক আপডেট\n• প্রিমিয়াম টেমপ্লেট কিট ও পপআপ বিল্ডার ফুল আনলকড\n• থিম বিল্ডার ও উকমার্স বিল্ডার সাপোর্ট\n• ১ বছরের ফ্রি লাইসেন্স রিনিউ সাপোর্ট`,
    shortDescription: 'এলিমেন্টর প্রো ১০০% জেনুইন লাইসেন্স সরাসরি আপডেট সহ',
    imageUrl: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80',
    price: 390,
    oldPrice: 900,
    available: true,
    featured: true,
    newArrival: false,
    rating: 5.0,
    reviewCount: 42,
    type: 'digital',
    downloadUrl: 'https://elementor.com',
    tags: ['elementor', 'wordpress', 'web design'],
    createdAt: Date.now() - 50000,
  });

  // 3. Update Hero Product slots
  await updateStoreSettings({
    heroProductIds: {
      leftTop: p1,
      leftBottom: p2,
      rightTop: p3,
      rightBottom: p4,
    },
  });

  // 4. Default Benefits
  await createBenefit({
    icon: 'zap',
    title: 'ইন্সট্যান্ট ডেলিভারি',
    description: 'অর্ডারের সাথে সাথেই আপনার ইমেইল বা হোয়াটসঅ্যাপে অ্যাক্সেস লিংক পৌঁছে যাবে।',
    active: true,
    sortOrder: 1,
  });

  await createBenefit({
    icon: 'shield',
    title: '১০০% জেনুইন ও নিরাপদ',
    description: 'সকল ডিজিটাল পণ্য সম্পূর্ণ ভেরিফাইড এবং বিশ্বস্ত সোর্স থেকে সরাসরি এক্টিভেটেড।',
    active: true,
    sortOrder: 2,
  });

  await createBenefit({
    icon: 'headphones',
    title: '২৪/৭ সরাসরি হোয়াটসঅ্যাপ সহায়তা',
    description: 'যেকোনো কারিগরি সমস্যায় আমাদের টিম সার্বক্ষণিক সহায়তা প্রদান করে।',
    active: true,
    sortOrder: 3,
  });

  await createBenefit({
    icon: 'award',
    title: 'সহজ ও সাশ্রয়ী মূল্য',
    description: 'বাংলাদেশের ফ্রিল্যান্সার ও ক্রিয়েটরদের জন্য সেরা ডিল ও কোয়ালিটি নিশ্চিত।',
    active: true,
    sortOrder: 4,
  });
}

export async function seedDemoOrders(): Promise<void> {
  const { createOrder } = await import('../firebase/services');
  const now = Date.now();

  const demoOrders = [
    {
      id: `ORD-${now.toString().slice(-6)}1`,
      customerName: 'মোঃ রাশেদুল ইসলাম',
      customerPhone: '01711223344',
      customerEmail: 'rashed.dev@gmail.com',
      customerAddress: 'ডিজিটাল ডেলিভারি (ঢাকা)',
      note: 'Canva Pro সাবস্ক্রিপশন দ্রুত অ্যাক্টিভ করে দিন।',
      items: [
        {
          productId: 'demo-1',
          title: 'Canva Pro 1-Year Private / Team Access',
          price: 350,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
          downloadUrl: 'https://canva.com/brand/join/invite-demo-link',
        },
      ],
      subtotal: 350,
      deliveryCharge: 0,
      total: 350,
      paymentMethod: 'PayBD Online (bKash/Nagad)',
      paymentStatus: 'pending' as const,
      status: 'pending' as const,
      createdAt: now - 1000 * 60 * 15, // 15 mins ago
    },
    {
      id: `ORD-${now.toString().slice(-6)}2`,
      customerName: 'তানভীর আহমেদ',
      customerPhone: '01864368912',
      customerEmail: 'tanvir.ui@gmail.com',
      customerAddress: 'চট্টগ্রাম',
      note: 'উইন্ডোজ ১১ প্রো কী দ্রুত প্রয়োজন।',
      items: [
        {
          productId: 'demo-2',
          title: 'Windows 11 Pro Genuine Retail Lifetime Key',
          price: 499,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80',
          downloadUrl: 'https://nasirdigitalhub.com/keys/win11pro-demo',
        },
      ],
      subtotal: 499,
      deliveryCharge: 0,
      total: 499,
      paymentMethod: 'bKash Personal',
      paymentStatus: 'pending' as const,
      status: 'pending' as const,
      paymentTrxId: '9K8J7H6G5F',
      createdAt: now - 1000 * 60 * 45, // 45 mins ago
    },
    {
      id: `ORD-${now.toString().slice(-6)}3`,
      customerName: 'সাদিয়া তাসনিম',
      customerPhone: '01912345678',
      customerEmail: 'sadia.motion@gmail.com',
      customerAddress: 'সিলেট',
      note: 'মোশন গ্রাফিক্স বান্ডেল গুগল ড্রাইভ লিঙ্ক পাঠিয়ে দিন।',
      items: [
        {
          productId: 'demo-3',
          title: '500+ Mega Video Editing Motion Graphics Asset Bundle',
          price: 299,
          quantity: 1,
          imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&w=400&q=80',
          downloadUrl: 'https://drive.google.com/drive/folders/demo-assets',
        },
      ],
      subtotal: 299,
      deliveryCharge: 0,
      total: 299,
      paymentMethod: 'Nagad',
      paymentStatus: 'paid' as const,
      status: 'completed' as const,
      paymentTrxId: 'NAGAD-TRX-874210',
      createdAt: now - 1000 * 60 * 180, // 3 hours ago
    },
  ];

  for (const ord of demoOrders) {
    await createOrder(ord as any);
  }
}
