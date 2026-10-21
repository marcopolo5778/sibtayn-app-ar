import React, { useState, useEffect } from 'react';
import { HijriDateCard } from '@/components/HijriDateCard';
import { ImageSlider } from '@/components/ImageSlider';
import { APP_CONFIG } from '@/services/config';

interface HomePageProps {
  onNavigateToTab: (tabId: string) => void;
  onOpenUrl: (url: string, title: string) => void;
}

/**
 * کارت دسترسی سریع به بخش‌های اصلی
 */
interface QuickAccessItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  url?: string;
  tabId?: string;
}

const QUICK_ACCESS_ITEMS: QuickAccessItem[] = [
  {
    id: 'quran',
    title: 'القرآن الكريم',
    subtitle: 'النص والصوت والتفسير',
    icon: 'book-outline',
    color: '#0F4C81',
    tabId: 'quran'
  },
  {
    id: 'ahlelbayt',
    title: 'أهل البيت عليهم السلام',
    subtitle: 'سيرة المعصومين',
    icon: 'people-outline',
    color: '#C9A063',
    tabId: 'ahlelbayt'
  },
  {
    id: 'supplications',
    title: 'الأدعية والزيارات',
    subtitle: 'مفاتيح الجنان',
    icon: 'moon-outline',
    color: '#2E7D32',
    tabId: 'supplications'
  },
  {
    id: 'news',
    title: 'الأخبار',
    subtitle: 'أخبار المؤسسة',
    icon: 'newspaper-outline',
    color: '#C62828',
    tabId: 'news'
  },
  {
    id: 'beliefs',
    title: 'العقائد',
    subtitle: 'العقائد الإسلامية',
    icon: 'shield-outline',
    color: '#6A1B9A',
    url: 'https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=12082&Itemid=3763'
  },
  {
    id: 'mahdaviat',
    title: 'المهدوية',
    subtitle: 'الإمام المهدي عجل الله فرجه',
    icon: 'star-outline',
    color: '#FF6F00',
    url: 'https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=12297&Itemid=911'
  },
  {
    id: 'mofakera',
    title: 'المفكرة',
    subtitle: 'المفكرة الإسلامية',
    icon: 'calendar-outline',
    color: '#0F4C81',
    url: 'https://www.sibtayn.com/ar/index.php?option=com_content&view=category&id=1937'
  },
  {
    id: 'children',
    title: 'الأطفال',
    subtitle: 'قسم الأطفال',
    icon: 'happy-outline',
    color: '#00897B',
    url: 'https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=14747&Itemid=3806'
  },
  {
    id: 'gallery',
    title: 'معرض الصور',
    subtitle: 'صور المؤسسة',
    icon: 'images-outline',
    color: '#5E35B1',
    url: 'https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=14748&Itemid=4130'
  }
];

/**
 * صفحه اصلی نیتیو اپلیکیشن
 * این صفحه جایگزین WebView برای تب "الرئيسية" است
 */
export const HomePage: React.FC<HomePageProps> = ({ onNavigateToTab, onOpenUrl }) => {
  const [greeting, setGreeting] = useState('');

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('صباح الخير');
    else setGreeting('مساء الخير');
  }, []);

  const handleItemClick = (item: QuickAccessItem) => {
    if (item.tabId) {
      onNavigateToTab(item.tabId);
    } else if (item.url) {
      onOpenUrl(item.url, item.title);
    }
  };

  return (
    <div className="home-page">
      <div className="home-page__greeting">
        <div className="home-page__greeting-text">
          <h2 className="home-page__greeting-title">{greeting}</h2>
          <p className="home-page__greeting-subtitle">مرحباً بك في مؤسسة السبطين عليهما السلام</p>
        </div>
        <div className="home-page__logo">
          <ion-icon name="moon-outline"></ion-icon>
        </div>
      </div>

      <HijriDateCard />

      {/* اسلایدر تصاویر */}
      <ImageSlider onSlideClick={(url, title) => onOpenUrl(url, title)} />

      <div className="home-page__section">
        <h3 className="home-page__section-title">
          <ion-icon name="grid-outline"></ion-icon>
          الأقسام الرئيسية
        </h3>
        <div className="quick-access-grid">
          {QUICK_ACCESS_ITEMS.map(item => (
            <button
              key={item.id}
              className="quick-access-card"
              onClick={() => handleItemClick(item)}
              style={{ '--card-color': item.color } as React.CSSProperties}
            >
              <div className="quick-access-card__icon" style={{ background: item.color }}>
                <ion-icon name={item.icon}></ion-icon>
              </div>
              <div className="quick-access-card__content">
                <h4 className="quick-access-card__title">{item.title}</h4>
                <p className="quick-access-card__subtitle">{item.subtitle}</p>
              </div>
              <ion-icon name="chevron-back-outline" className="quick-access-card__arrow"></ion-icon>
            </button>
          ))}
        </div>
      </div>

      <div className="home-page__section">
        <h3 className="home-page__section-title">
          <ion-icon name="flash-outline"></ion-icon>
          الوصول السريع
        </h3>
        <div className="quick-tools-grid">
          <button
            className="quick-tool"
            onClick={() => onOpenUrl('https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=39773&Itemid=4597', 'القرآن الكريم')}
          >
            <ion-icon name="volume-high-outline"></ion-icon>
            <span>صوت القرآن</span>
          </button>
          <button
            className="quick-tool"
            onClick={() => onOpenUrl('https://www.sibtayn.com/ar/index.php?option=com_content&view=category&id=1336&Itemid=3762', 'الأدعية الصوتية')}
          >
            <ion-icon name="musical-notes-outline"></ion-icon>
            <span>الأدعية الصوتية</span>
          </button>
          <button
            className="quick-tool"
            onClick={() => onOpenUrl('https://www.sibtayn.com/ar/index.php?option=com_content&view=category&layout=blog&id=1976&Itemid=3856', 'المكتبة المرئية')}
          >
            <ion-icon name="videocam-outline"></ion-icon>
            <span>المكتبة المرئية</span>
          </button>
          <button
            className="quick-tool"
            onClick={() => onOpenUrl('https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=14750&Itemid=3818', 'البث المباشر')}
          >
            <ion-icon name="radio-outline"></ion-icon>
            <span>البث المباشر</span>
          </button>
        </div>
      </div>

      <div className="home-page__section">
        <button
          className="about-card"
          onClick={() => onOpenUrl('https://www.sibtayn.com/ar/index.php?option=com_content&view=article&id=18726&Itemid=3727', 'حول المؤسسة')}
        >
          <div className="about-card__icon">
            <ion-icon name="information-circle-outline"></ion-icon>
          </div>
          <div className="about-card__content">
            <h4>حول مؤسسة السبطين عليهما السلام</h4>
            <p>تعريف بالمؤسسة وأهدافها وأنشطتها</p>
          </div>
          <ion-icon name="chevron-back-outline"></ion-icon>
        </button>
      </div>

      <div className="home-page__footer">
        <p>مؤسسة السبطين عليهما السلام العالمية</p>
        <p className="home-page__footer-version">الإصدار 1.0.0</p>
      </div>
    </div>
  );
};
