# مؤسسة السبطين - تطبيق أندرويد (PWA)

<div dir="rtl">

تطبيق أندرويد لموقع **مؤسسة السبطين عليهما السلام العالمية** (https://www.sibtayn.com/ar/)

مبني بتقنية **PWA + Capacitor** — يعمل على:
- 🌐 أي متصفح ويب
- 📱 أندرويد (عبر PWA Builder أو Capacitor)
- 🍎 iOS (عبر PWA Builder)
- 💻 كتطبيق سطح المكتب

</div>

---

## ✨ المميزات

- ✅ واجهة عربية كاملة مع دعم RTL
- ✅ خط **Cairo** للنصوص العادية + خط **Amiri** للنصوص القرآنية
- ✅ شريط تبويبات سفلي (5 أقسام رئيسية)
- ✅ شريط أدوات علوي (رجوع، تحديث، الرئيسية، مشاركة)
- ✅ مشاركة عبر واتساب، تيليجرام، نسخ، والمزيد
- ✅ دعم **Push Notifications** (Web Push API)
- ✅ **Shortcuts** عند الضغط المطول على الأيقونة
- ✅ شاشة بداية (Splash Screen) أنيقة
- ✅ يعمل **بدون إنترنت** (Service Worker)

---

## 🚀 طريقتان للتثبيت

### الطريقة 1: عبر Vercel + PWA Builder (الأسهل) ⭐

#### الخطوة 1: تثبيت المتطلبات محلياً (اختياري للاختبار)

```bash
# فك ضغط الملف
unzip sibtayn-ar.zip
cd sibtayn-app

# تثبيت الحزم
npm install

# تشغيل التطبيق محلياً
npm run dev
```

افتح: http://localhost:5173

#### الخطوة 2: رفع المشروع على GitHub

```bash
# في GitHub، أنشئ repository جديد باسم sibtayn-app
# ثم في جهازك:
cd sibtayn-app
git init
git add .
git commit -m "Initial commit - Sibtayn App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/sibtayn-app.git
git push -u origin main
```

#### الخطوة 3: النشر على Vercel

1. اذهب إلى https://vercel.com وسجّل دخولك (حساب GitHub)
2. اضغط **"Add New Project"**
3. اختر repository الذي أنشأته (`sibtayn-app`)
4. الإعدادات:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
5. اضغط **"Deploy"**
6. انتظر ۱-۲ دقيقة حتى يكتمل النشر
7. ستحصل على رابط مثل: `https://sibtayn-app.vercel.app`

#### الخطوة 4: بناء APK عبر PWA Builder

1. اذهب إلى https://www.pwabuilder.com
2. الصق رابط Vercel: `https://sibtayn-app.vercel.app`
3. اضغط **"Start"**
4. انتظر قليلاً لتحليل التطبيق
5. في قسم Android، اضغط **"Generate Package"**
6. حمّل ملف ZIP الناتج
7. فك ضغط الملف

#### الخطوة 5: تثبيت APK على هاتفك

1. انقل ملف APK إلى هاتفك
2. فعّل **"تثبيت من مصادر غير معروفة"** في إعدادات الأندرويد
3. افتح ملف APK وثبّته

أو عبر ADB:
```bash
adb install app-release.apk
```

---

### الطريقة 2: عبر Capacitor (للمطورين المتقدمين)

هذه الطريقة تعطي إمكانات أكثر (Push Notifications مع Firebase، APIs أصلي) لكنها تحتاج Android Studio.

```bash
# الإعداد الأولي
cd sibtayn-app
npm install
npm run build

# إضافة أندرويد
npx cap add android

# نسخ الموارد (تشغيل السكريبت)
python /path/to/scripts/setup_sibtayn_app.py

# المزامنة
npx cap sync android

# فتح في Android Studio
npx cap open android
```

---

## 🎨 تخصيص التطبيق

### تغيير الأقسام في الشريط السفلي

افتح `src/services/config.ts` وعدّل:

```typescript
tabs: [
  {
    id: 'home',
    title: 'الرئيسية',
    icon: 'home-outline',
    iconActive: 'home',
    url: 'https://www.sibtayn.com/ar/'
  },
  // أضف أو عدّل التبويبات
]
```

### تغيير الألوان

في `src/theme/variables.css`:
```css
:root {
  --ion-color-primary: #0F4C81;
  --ion-color-tertiary: #FFD700;
}
```

وفي `public/manifest.json`:
```json
{
  "theme_color": "#0F4C81",
  "background_color": "#0F4C81"
}
```

### تفعيل خط Amiri للقرآن

الخط مُفعّل بالفعل. أي عنصر يحمل إحدى هذه الكلاسات سيستخدم خط Amiri تلقائياً:
- `.quran-text`, `.quran`, `.ayah`, `.aya`
- `.bismillah`, `.basmala`
- أي كلاس يحتوي على `quran` أو `ayah` أو `bismillah`

---

## 📁 هيكل المشروع

```
sibtayn-app/
├── public/                  # ملفات PWA العامة
│   ├── icons/                  # أيقونات PWA (192, 512, maskable)
│   ├── manifest.json           # PWA Manifest
│   ├── sw.js                   # Service Worker
│   └── robots.txt
├── src/
│   ├── components/          # مكونات UI
│   │   ├── AppWebView.tsx
│   │   ├── Toolbar.tsx
│   │   ├── TabBar.tsx
│   │   ├── ShareSheet.tsx
│   │   └── InAppNotification.tsx
│   ├── services/            # الخدمات
│   │   ├── config.ts
│   │   ├── pushService.ts
│   │   └── shareService.ts
│   ├── theme/               # التصميم
│   │   └── variables.css
│   ├── App.tsx
│   └── main.tsx
├── android-resources/       # موارد أندرويد (لـ Capacitor)
├── capacitor.config.ts
├── vercel.json              # إعدادات Vercel
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## ❓ استكشاف الأخطاء

### PWA Builder يظهر تحذيرات

بعض التحذيرات غير حرجة. المهم هو:
- ✅ manifest.json موجود وصحيح
- ✅ Service Worker مسجل ويعمل
- ✅ أيقونات 192 و 512 موجودة
- ✅ HTTPS مفعّل (Vercel يوفره تلقائياً)

### الموقع لا يفتح داخل التطبيق

- تأكد من اتصال الإنترنت
- الموقع sibtayn.com قد يكون بطيئاً أحياناً

### Push Notifications لا تعمل في PWA

- تأكد من أن المتصفح يدعم Web Push
- يجب أن يكون الموقع على HTTPS
- في Capacitor، استخدم Firebase Cloud Messaging بدلاً من ذلك

### التطبيق لا يظهر بالعربية

- تأكد من أن `lang="ar"` و `dir="rtl"` في `index.html`
- تحقق من تحميل خط Cairo

---

## 📝 ملاحظات مهمة

1. **WebView Cross-Origin:** بسبب سياسة Same-Origin، لا يمكن للتطبيق قراءة محتوى موقع sibtayn.com مباشرة، لكن يمكنه عرضه في iframe
2. **Push Notifications:** في وضع PWA، يستخدم Web Push API. في وضع Capacitor، يستخدم Firebase Cloud Messaging
3. **الخطوط:** خطوط Cairo و Amiri محملة من Google Fonts (تحتاج إنترنت)

---

**بالتوفيق! 🤲**
