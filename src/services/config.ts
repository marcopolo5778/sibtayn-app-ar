/**
 * 📌 پیکربندی اصلی اپلیکیشن السبطین
 *
 * این فایل تنها فایلی است که برای شخصی‌سازی اپ باید ویرایش کنید.
 */

export const APP_CONFIG = {
  /**
   * آدرس سایت مؤسسة السبطین
   * این آدرس پیش‌فرض برای نسخه عربی سایت است.
   */
  siteUrl: 'https://www.sibtayn.com/ar/',

  /**
   * آدرس‌های تب‌های منوی پایینی
   * این آدرس‌ها بر اساس منوی اصلی سایت sibtayn.com/ar تنظیم شده‌اند.
   */
  tabs: [
    {
      id: 'home',
      title: 'الرئيسية',
      icon: 'home-outline',
      iconActive: 'home',
      url: 'https://www.sibtayn.com/ar/'
    },
    {
      id: 'quran',
      title: 'القرآن',
      icon: 'book-outline',
      iconActive: 'book',
      url: 'https://www.sibtayn.com/ar/القرآن-الكريم'
    },
    {
      id: 'ahlelbayt',
      title: 'أهل البيت',
      icon: 'people-outline',
      iconActive: 'people',
      url: 'https://www.sibtayn.com/ar/أهل-البيت-عليهم-السلام'
    },
    {
      id: 'supplications',
      title: 'الأدعية',
      icon: 'moon-outline',
      iconActive: 'moon',
      url: 'https://www.sibtayn.com/ar/الأدعية-والزيارات'
    },
    {
      id: 'news',
      title: 'الأخبار',
      icon: 'newspaper-outline',
      iconActive: 'newspaper',
      url: 'https://www.sibtayn.com/ar/أخبار'
    }
  ] as const,

  /**
   * تنظیمات ظاهری
   */
  theme: {
    primaryColor: '#0F4C81',      // آبی تیره - رنگ اصلی سایت
    accentColor: '#FFD700',       // طلایی - رنگ تأکید
    backgroundColor: '#FFFFFF',
    textColor: '#1A1A2E',
    toolbarHeight: 56,
    tabBarHeight: 60
  },

  /**
   * تنظیمات WebView
   */
  webView: {
    // فعال‌سازی JavaScript
    javaScriptEnabled: true,
    // فعال‌سازی DOM Storage
    domStorageEnabled: true,
    // فعال‌سازی قابلیت zoom
    zoomEnabled: false,
    // پاک کردن کش هنگام شروع
    clearCacheOnStart: false,
    // پاک کردن کوکی‌ها هنگام شروع
    clearCookiesOnStart: false
  },

  /**
   * تنظیمات شبکه
   */
  network: {
    // عبارات کلیدی که در URL باشد، خارج از اپ باز می‌شوند
    externalLinkPatterns: [
      'facebook.com',
      'twitter.com',
      'youtube.com',
      't.me',
      'wa.me',
      'instagram.com'
    ]
  },

  /**
   * اطلاعات اپلیکیشن
   */
  app: {
    name: 'مؤسسة السبطين',
    fullName: 'مؤسسة السبطين عليهما السلام',
    version: '1.0.0',
    packageName: 'com.sibtayn.app'
  }
};

/**
 * کلیدهای ذخیره‌سازی محلی
 */
export const STORAGE_KEYS = {
  ACTIVE_TAB: 'active_tab',
  LAST_URL: 'last_url',
  PUSH_TOKEN: 'push_token',
  PUSH_ENABLED: 'push_enabled',
  THEME_MODE: 'theme_mode',
  FONT_SIZE: 'font_size'
};
