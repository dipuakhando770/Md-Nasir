# 🚀 Hostinger Deployment Guide (হোস্টিংগারে লাইভ করার নিয়ম)

এই প্রজেক্টটি **Hostinger (Shared / Cloud / VPS Hosting)** এর জন্য সম্পূর্ণ অপ্টিমাইজড করা হয়েছে।

---

## 🛠️ ধাপ ১: বিল্ড তৈরি করা (Production Build)

আপনার কম্পিউটার বা সার্ভার টার্মিনালে নিচের কমান্ডগুলো রান করুন:

```bash
# ১. ডিপেনডেন্সি ইন্সটল করুন
npm install

# ২. প্রডাকশন বিল্ড তৈরি করুন
npm run build
```

`npm run build` কমান্ড রান করার পর প্রজেক্টে একটি **`dist`** ফোল্ডার তৈরি হবে। এই `dist` ফোল্ডারের ভেতরে আপনার ওয়েবসাইটের সমস্ত কম্পাইলড ফাইল এবং `.htaccess` তৈরি হবে।

---

## 🌐 ধাপ ২: Hostinger-এ ফাইল আপলোড করা

1. **Hostinger hPanel**-এ লগইন করুন।
2. **Websites** > আপনার ডোমেইনের পাশে **Manage** এ ক্লিক করুন।
3. বাম পাশের মেনু থেকে **File Manager** এ ক্লিক করুন এবং **public_html** ফোল্ডারে প্রবেশ করুন।
4. **public_html** এর ভেতরে আগে কোনো ডিফল্ট ফাইল থাকলে তা ডিলিট করুন।
5. আপনার প্রজেক্টের **`dist`** ফোল্ডারের ভেতরের **সবগুলো ফাইল ও ফোল্ডার** (যেমন: `index.html`, `assets/`, `.htaccess` ইত্যাদি) সরাসরি `public_html` এ আপলোড করুন।

*(টিপস: `dist` ফোল্ডারের ভেতরের সব ফাইল একসাথে সিলেক্ট করে একটি `zip` ফাইল তৈরি করে Hostinger File Manager-এ আপলোড করে **Extract** করে দিলে কয়েক সেকেন্ডের মধ্যেই আপলোড হয়ে যাবে।)*

---

## ⚙️ ধাপ ৩: ENV কনফিগারেশন পরিবর্তন (যদি নতুন Firebase প্রজেক্ট ব্যবহার করতে চান)

যদি পরবর্তীতে আপনি Firebase প্রজেক্ট পরিবর্তন করতে চান:
1. প্রজেক্টের মূল ডিরেক্টরিতে থাকা `.env` ফাইলে আপনার নতুন ফায়ারবেস তথ্য দিন:
   ```env
   VITE_FIREBASE_API_KEY="আপনার_API_KEY"
   VITE_FIREBASE_AUTH_DOMAIN="আপনার_AUTH_DOMAIN"
   VITE_FIREBASE_PROJECT_ID="আপনার_PROJECT_ID"
   VITE_FIREBASE_STORAGE_BUCKET="আপনার_STORAGE_BUCKET"
   VITE_FIREBASE_MESSAGING_SENDER_ID="আপনার_MESSAGING_SENDER_ID"
   VITE_FIREBASE_APP_ID="আপনার_APP_ID"
   VITE_ADMIN_UID="আপনার_ADMIN_UID"
   ```
2. পুনরায় `npm run build` দিয়ে নতুন `dist` ফাইল Hostinger-এ আপলোড করে দিন।

---

## 🔒 ধাপ ৪: SSL (HTTPS) সক্রিয় করা
Hostinger hPanel থেকে **Security** > **SSL** সেকশনে গিয়ে আপনার ডোমেইনে **Free Let's Encrypt SSL** সক্রিয় করে দিন।

ব্যাস! আপনার ই-কমার্স সাইট **Nasir Digital Hub** সম্পূর্ণ লাইভ হয়ে যাবে! 🎉
