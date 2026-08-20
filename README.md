# ⚡ Gemini 3.1 Flash Lite - AI Chatbot PWA

একটি আধুনিক, অতি-দ্রুত প্রোগ্রেসিভ ওয়েব অ্যাপ (PWA) যা এক্সক্লুসিভলি **Google Gemini 3.1 Flash Lite** মডেল এবং **Netlify Serverless Functions** দ্বারা চালিত।

---

## 🌟 মূল বৈশিষ্ট্যসমূহ (Key Features)

- **⚡ এক্সক্লুসিভ Gemini 3.1 Flash Lite**: আল্ট্রা-লো লেটেন্সি এবং সুপার-ফাস্ট রেসপন্স।
- **📱 ১০০% কমপ্লায়েন্ট PWA**: 
  - মোবাইলে ও ডেস্কটপে "Install App / Add to Home screen" সাপোর্ট।
  - অফলাইন স্টোরেজ ও সার্ভিস ওয়ার্কার ক্যাশিং (`public/sw.js`)।
  - অফলাইন স্ট্যাটাস ডিটেক্টর ব্যানার।
- **☁️ Netlify Serverless আর্কিটেকচার**: API Key ফ্রন্টএন্ডে এক্সপোজ হয় না, সম্পূর্ণ সুরক্ষিত।
- **🖼️ মাল্টিমোডাল ইমেজ সাপোর্ট**: ছবি আপলোড, পেস্ট বা ড্র্যাগ-অ্যান্ড-ড্রপ করে প্রশ্ন করা যায়।
- **🌐 Google Search Grounding**: বাস্তব সময়ের ওয়েব তথ্য ও সোর্স লিংক।
- **🎙️ ভয়েস ও অডিও**: মাইক্রোফোনে কথা বলে প্রম্পট লেখা এবং টেক্সট-টু-স্পিচ প্লেব্যাক।
- **💾 অটো লোকাল ব্যাকআপ**: সমস্ত চ্যাট ব্রাউজারে সংরক্ষিত থাকে এবং Markdown বা JSON হিসেবে এক্সপোর্ট করা যায়।

---

## 🚀 Netlify-তে ডেপ্লয় করার নিয়ম (Deploy to Netlify)

1. [Netlify](https://app.netlify.com/)-এ লগইন করুন।
2. **Add new site** > **Import an existing project**-এ ক্লিক করুন।
3. আপনার GitHub অ্যাকাউন্ট থেকে `Milon41Rana/SABOT2` রিপোজিটরিটি নির্বাচন করুন।
4. **Site Configuration** সেকশনে যান:
   - **Environment Variables**-এ ক্লিক করুন।
   - **Add a variable** সিলেক্ট করে:
     - **Key**: `GEMINI_API_KEY`
     - **Value**: আপনার আসল Google Gemini API Key দিন।
5. **Deploy Site** বাটনে ক্লিক করুন। ২ মিনিটের মধ্যে আপনার PWA চ্যাটবট লাইভ হয়ে যাবে!

---

## 💻 লোকাল ডেভেলপমেন্ট (Local Development)

```bash
# ডিপেন্ডেন্সি ইন্সটল করুন
npm install

# .env ফাইলে এপিআই কি সেট করুন
cp .env.example .env

# লোকাল ডেভ সার্ভার রান করুন
npm run dev
```
