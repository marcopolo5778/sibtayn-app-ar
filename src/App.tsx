import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { App as CapacitorApp } from '@capacitor/app';

import { AppWebView } from '@/components/AppWebView';
import { Toolbar } from '@/components/Toolbar';
import { TabBar } from '@/components/TabBar';
import { ShareSheet } from '@/components/ShareSheet';
import { InAppNotification } from '@/components/InAppNotification';

import { APP_CONFIG, STORAGE_KEYS } from '@/services/config';
import { pushService } from '@/services/pushService';

import '@/theme/variables.css';

setupIonicReact({
  mode: 'md',
  animated: true,
  rippleEffect: true
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [currentUrl, setCurrentUrl] = useState<string>(APP_CONFIG.siteUrl);
  const [pageTitle, setPageTitle] = useState<string>(APP_CONFIG.app.fullName);
  const [loading, setLoading] = useState<boolean>(true);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [inAppNotification, setInAppNotification] = useState<any>(null);

  const navigationHistory = useRef<string[]>([APP_CONFIG.siteUrl]);
  const historyIndex = useRef<number>(0);
  const webViewKey = useRef<number>(0); // برای reload

  // راه‌اندازی اولیه اپ
  useEffect(() => {
    const initApp = async () => {
      try {
        // بررسی کوئری پارامتر tab (برای PWA Shortcuts)
        const urlParams = new URLSearchParams(window.location.search);
        const tabFromUrl = urlParams.get('tab');

        if (tabFromUrl && APP_CONFIG.tabs.find(t => t.id === tabFromUrl)) {
          // اگر tab در URL بود، آن را فعال کن
          setActiveTab(tabFromUrl);
          const tab = APP_CONFIG.tabs.find(t => t.id === tabFromUrl);
          if (tab) {
            setCurrentUrl(tab.url);
          }
          // پاک کردن کوئری پارامتر
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          // استفاده از Capacitor Preferences (در PWA به localStorage fallback می‌شود)
          try {
            const { Preferences } = await import('@capacitor/preferences');
            const { value: savedTab } = await Preferences.get({ key: STORAGE_KEYS.ACTIVE_TAB });
            if (savedTab) {
              setActiveTab(savedTab);
              const tab = APP_CONFIG.tabs.find(t => t.id === savedTab);
              if (tab) {
                setCurrentUrl(tab.url);
              }
            }
          } catch {
            // fallback به localStorage
            const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
            if (savedTab) {
              setActiveTab(savedTab);
              const tab = APP_CONFIG.tabs.find(t => t.id === savedTab);
              if (tab) {
                setCurrentUrl(tab.url);
              }
            }
          }
        }

        // تلاش برای تنظیم نوار وضعیت (فقط در Capacitor کار می‌کند)
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0F4C81' });
        } catch {
          // در PWA - با theme-color متا تگ مدیریت می‌شود
        }

        // تلاش برای مخفی کردن اسپلش اسکرین
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await new Promise(resolve => setTimeout(resolve, 500));
          await SplashScreen.hide();
        } catch {
          // در PWA اسپلش اسکرین نداریم
        }

        // راه‌اندازی Push Notification (Capacitor یا Web Push)
        try {
          await pushService.init();
        } catch {
          // در PWA از Web Push API استفاده می‌شود (در main.tsx)
        }
      } catch (error) {
        console.warn('App init error:', error);
      }
    };

    initApp();

    // لیسنر برای نوتیفیکیشن درون‌برنامه‌ای
    const onInAppNotification = (e: Event) => {
      const customEvent = e as CustomEvent;
      setInAppNotification(customEvent.detail);
    };
    window.addEventListener('in-app-notification', onInAppNotification);

    // لیسنر برای باز کردن URL از نوتیفیکیشن
    const onOpenUrl = (e: Event) => {
      const customEvent = e as CustomEvent;
      const url = customEvent.detail as string;
      if (url) {
        addToHistory(url);
        setCurrentUrl(url);
        webViewKey.current += 1;
      }
    };
    window.addEventListener('open-url', onOpenUrl);

    // هندل دکمه Back سخت‌افزاری اندروید (فقط در Capacitor)
    let backButtonListener: any;
    try {
      CapacitorApp.addListener('backButton', ({ canGoBack: appCanGoBack }: { canGoBack: boolean }) => {
        if (historyIndex.current > 0) {
          goBack();
        } else if (!appCanGoBack) {
          CapacitorApp.exitApp();
        }
      }).then((listener: any) => {
        backButtonListener = listener;
      });
    } catch {
      // در PWA - با popstate هندل می‌شود
      window.addEventListener('popstate', (e) => {
        if (historyIndex.current > 0) {
          goBack();
        }
      });
    }

    return () => {
      window.removeEventListener('in-app-notification', onInAppNotification);
      window.removeEventListener('open-url', onOpenUrl);
      if (backButtonListener?.remove) {
        backButtonListener.remove();
      }
    };
  }, []);

  // مدیریت تغییر تب
  const handleTabChange = useCallback(async (tabId: string) => {
    const tab = APP_CONFIG.tabs.find(t => t.id === tabId);
    if (!tab) return;

    setActiveTab(tabId);
    setCurrentUrl(tab.url);
    webViewKey.current += 1;
    navigationHistory.current = [tab.url];
    historyIndex.current = 0;

    // ذخیره تب فعال
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: STORAGE_KEYS.ACTIVE_TAB,
        value: tabId
      });
    } catch {
      // fallback به localStorage
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
    }
  }, []);

  // مدیریت تغییر URL
  const handleUrlChange = useCallback((newUrl: string) => {
    if (newUrl !== currentUrl) {
      addToHistory(newUrl);
    }
  }, [currentUrl]);

  // اضافه کردن به تاریخچه
  const addToHistory = useCallback((url: string) => {
    // حذف تاریخچه بعد از موقعیت فعلی
    navigationHistory.current = navigationHistory.current.slice(0, historyIndex.current + 1);
    navigationHistory.current.push(url);
    historyIndex.current = navigationHistory.current.length - 1;
    setCurrentUrl(url);
    setCanGoBack(historyIndex.current > 0);
  }, []);

  // بازگشت به عقب
  const goBack = useCallback(() => {
    if (historyIndex.current > 0) {
      historyIndex.current -= 1;
      const prevUrl = navigationHistory.current[historyIndex.current];
      setCurrentUrl(prevUrl);
      webViewKey.current += 1;
      setCanGoBack(historyIndex.current > 0);
    }
  }, []);

  // بازگشت به خانه
  const goHome = useCallback(() => {
    handleTabChange('home');
  }, [handleTabChange]);

  // تازه‌سازی صفحه
  const refresh = useCallback(() => {
    webViewKey.current += 1;
  }, []);

  // اشتراک‌گذاری
  const handleShare = useCallback(() => {
    setShowShare(true);
  }, []);

  return (
    <IonApp>
      <div className="app-container">
        <Toolbar
          title={pageTitle}
          onShare={handleShare}
          onRefresh={refresh}
          onHome={goHome}
          onMenu={() => console.log('menu')}
          canGoBack={canGoBack}
          onBack={goBack}
        />

        <AppWebView
          key={webViewKey.current}
          url={currentUrl}
          onTitleChange={setPageTitle}
          onUrlChange={handleUrlChange}
          onLoadingChange={setLoading}
        />

        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <ShareSheet
          url={currentUrl}
          title={pageTitle}
          visible={showShare}
          onClose={() => setShowShare(false)}
        />

        <InAppNotification
          notification={inAppNotification}
          onClick={(n) => {
            if (n.data?.url) {
              addToHistory(n.data.url);
            }
          }}
          onClose={() => setInAppNotification(null)}
        />
      </div>
    </IonApp>
  );
};

export default App;
