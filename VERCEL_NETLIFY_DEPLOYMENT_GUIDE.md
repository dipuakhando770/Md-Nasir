# 🚀 Vercel ও Netlify ডেপ্লয়মেন্ট গাইড (PayBD Payment Fix)

## কেন লোকাল বা এআই স্টুডিওতে চলতো কিন্তু Vercel/Netlify-তে এরর আসতো?
- **কারণ:** Vercel এবং Netlify হলো স্ট্যাটিক সিডিএন (Serverless Hosting)। সাধারণ Vite প্রজেক্টে ব্যাকএন্ডের `server.ts` স্বয়ংক্রিয়ভাবে চলে না। ফলে `/api/payment/create` রিকোয়েস্ট করলে `404 Not Found` বা `index.html` রিটার্ন আসতো (Unexpected token `<` in JSON)।

---

## 🛠️ যা যা ফিক্স ও কনফিগার করা হয়েছে:

### ১. Vercel Serverless Architecture যোগ করা হয়েছে:
- `/api/payment/create.ts` (পেমেন্ট তৈরি করার সার্ভারলেস ফাংশন)
- `/api/payment/callback.ts` (কলব্যাক ও রিডাইরেক্ট ফাংশন)
- `/api/payment/verify.ts` (পেমেন্ট ভেরিফাই ফাংশন)
- `vercel.json` (API রুট রিরাইটস ও SPA সাপোর্ট)

### ২. Netlify Functions Architecture যোগ করা হয়েছে:
- `/netlify/functions/create.ts`
- `/netlify/functions/callback.ts`
- `netlify.toml` (রিডাইরেক্ট রুলস ও ফাংশন ম্যাপিং)

---

## 🔑 Vercel বা Netlify-তে Environment Variables সেট করার নিয়ম (Optional কিন্তু ভালো):

Vercel বা Netlify ড্যাশবোর্ডে **Project Settings > Environment Variables** এ নিচের কিগুলো যুক্ত করতে পারেন:

| Variable Name | Default Value | বিবরণ |
|---|---|---|
| `PAYBD_BRAND_KEY` | `r5d1y7Ye6bZzblEzvuhjO4OtWjyAjcfcePMKXZiqlK7wU8HrWJ` | আপনার মূল PayBD ব্র্যান্ড কি |
| `PAYBD_DEVICE_KEY` | `fVSARTobNKvglddV9QhKlPFTsFcLUD884mmh1wjg` | আপনার PayBD সিক্রেট/ডিভাইস কি |
| `PAYBD_GATEWAY_URL` | `https://app-paybd.pipilikhost.com/api/payment/create` | গেটওয়ে ক্রিয়েট URL |

> **নোট:** কোডের ভিতরেও স্বয়ংক্রিয় ডিফল্ট ফলব্যাক দেওয়া রয়েছে, তাই এনভায়রনমেন্ট ভ্যারিয়েবল সেট না করলেও অ্যাডমিন প্যানেলের সংরক্ষিত কি দিয়ে এটি শতভাগ কাজ করবে!

---

## 🚀 কীভাবে Vercel বা Netlify-তে রি-ডেপ্লয় করবেন:

1. **GitHub-এ কোড পুশ করুন:**
   ```bash
   git add .
   git commit -m "Fix Vercel and Netlify payment serverless functions"
   git push origin main
   ```
2. Vercel বা Netlify স্বয়ংক্রিয়ভাবে নতুন বিল্ড তৈরি করবে।
3. বিল্ড শেষ হলে আপনার লাইভ ডোমেইনে টেস্ট করুন — **Status 200 OK** হয়ে সরাসরি নতুন ট্যাবে পেমেন্ট ওপেন হবে!
