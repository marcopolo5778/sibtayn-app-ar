import React, { useState, useEffect, useRef, useCallback } from 'react';
import { IonApp, setupIonicReact } from '@ionic/react';
import { App as CapacitorApp } from '@capacitor/app';

import { AppWebView } from '@/components/AppWebView';
import { Toolbar } from '@/components/Toolbar';
import { TabBar } from '@/components/TabBar';
import { ShareSheet } from '@/components/ShareSheet';
import { InAppNotification } from '@/components/InAppNotification';
import { HomePage } from '@/pages/HomePage';

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
  const [currentUrl, setCurrentUrl] = useState<string>(APP_CONFIG.tabs[0].url);
  const [pageTitle, setPageTitle] = useState<string>(APP_CONFIG.app.fullName);
  const [loading, setLoading] = useState<boolean>(true);
  const [canGoBack, setCanGoBack] = useState<boolean>(false);
  const [showShare, setShowShare] = useState<boolean>(false);
  const [inAppNotification, setInAppNotification] = useState<any>(null);
  // حالت نمایش: 'home' (نیتیو) یا 'webview' (موقع باز کردن لینک از داخل صفحه اصلی)
  const [viewMode, setViewMode] = useState<'home' | 'webview'>('home');

  const navigationHistory = useRef<string[]>([APP_CONFIG.tabs[0].url]);
  const historyIndex = useRef<number>(0);
  const webViewKey = useRef<number>(0);

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
          if (tabFromUrl !== 'home') {
            const tab = APP_CONFIG.tabs.find(t => t.id === tabFromUrl);
            if (tab) {
              setCurrentUrl(tab.url);
              setViewMode('webview');
            }
          } else {
            setViewMode('home');
          }
          window.history.replaceState({}, '', window.location.pathname);
        } else {
          // استفاده از Capacitor Preferences (در PWA به localStorage fallback می‌شود)
          try {
            const { Preferences } = await import('@capacitor/preferences');
            const { value: savedTab } = await Preferences.get({ key: STORAGE_KEYS.ACTIVE_TAB });
            if (savedTab) {
              setActiveTab(savedTab);
              if (savedTab !== 'home') {
                const tab = APP_CONFIG.tabs.find(t => t.id === savedTab);
                if (tab) {
                  setCurrentUrl(tab.url);
                  setViewMode('webview');
                }
              } else {
                setViewMode('home');
              }
            }
          } catch {
            const savedTab = localStorage.getItem(STORAGE_KEYS.ACTIVE_TAB);
            if (savedTab) {
              setActiveTab(savedTab);
              if (savedTab !== 'home') {
                const tab = APP_CONFIG.tabs.find(t => t.id === savedTab);
                if (tab) {
                  setCurrentUrl(tab.url);
                  setViewMode('webview');
                }
              } else {
                setViewMode('home');
              }
            }
          }
        }

        // تلاش برای تنظیم نوار وضعیت
        try {
          const { StatusBar, Style } = await import('@capacitor/status-bar');
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#0F4C81' });
        } catch {}

        // تلاش برای مخفی کردن اسپلش اسکرین
        try {
          const { SplashScreen } = await import('@capacitor/splash-screen');
          await new Promise(resolve => setTimeout(resolve, 500));
          await SplashScreen.hide();
        } catch {}

        // راه‌اندازی Push Notification
        try {
          await pushService.init();
        } catch {}
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
        setViewMode('webview');
        webViewKey.current += 1;
      }
    };
    window.addEventListener('open-url', onOpenUrl);

    // هندل دکمه Back سخت‌افزاری اندروید
    let backButtonListener: any;
    try {
      CapacitorApp.addListener('backButton', ({ canGoBack: appCanGoBack }: { canGoBack: boolean }) => {
        // اگر در WebView و تاریخچه داریم، برگرد
        if (viewMode === 'webview' && historyIndex.current > 0) {
          goBack();
        } else if (viewMode === 'webview') {
          // اگر در WebView هستیم اما تاریخچه نداریم، برگرد به خانه
          setViewMode('home');
          setActiveTab('home');
        } else if (!appCanGoBack) {
          CapacitorApp.exitApp();
        }
      }).then((listener: any) => {
        backButtonListener = listener;
      });
    } catch {
      window.addEventListener('popstate', () => {
        if (viewMode === 'webview' && historyIndex.current > 0) {
          goBack();
        } else if (viewMode === 'webview') {
          setViewMode('home');
          setActiveTab('home');
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
  }, [viewMode]);

  // مدیریت تغییر تب
  const handleTabChange = useCallback(async (tabId: string) => {
    const tab = APP_CONFIG.tabs.find(t => t.id === tabId);
    if (!tab) return;

    setActiveTab(tabId);

    if (tabId === 'home') {
      // صفحه اصلی نیتیو
      setViewMode('home');
      setPageTitle(APP_CONFIG.app.fullName);
    } else {
      // سایر تب‌ها از WebView استفاده می‌کنند
      setViewMode('webview');
      setCurrentUrl(tab.url);
      setPageTitle(tab.title);
      webViewKey.current += 1;
      navigationHistory.current = [tab.url];
      historyIndex.current = 0;
      setCanGoBack(false);
    }

    // ذخیره تب فعال
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: STORAGE_KEYS.ACTIVE_TAB,
        value: tabId
      });
    } catch {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_TAB, tabId);
    }
  }, []);

  // باز کردن URL از داخل صفحه اصلی (برای کارت‌های دسترسی سریع)
  const handleOpenUrl = useCallback((url: string, title: string) => {
    setViewMode('webview');
    setCurrentUrl(url);
    setPageTitle(title);
    webViewKey.current += 1;
    navigationHistory.current = [url];
    historyIndex.current = 0;
    setCanGoBack(false);
  }, []);

  // مدیریت تغییر URL
  const handleUrlChange = useCallback((newUrl: string) => {
    if (newUrl !== currentUrl && viewMode === 'webview') {
      addToHistory(newUrl);
    }
  }, [currentUrl, viewMode]);

  // اضافه کردن به تاریخچه
  const addToHistory = useCallback((url: string) => {
    navigationHistory.current = navigationHistory.current.slice(0, historyIndex.current + 1);
    navigationHistory.current.push(url);
    historyIndex.current = navigationHistory.current.length - 1;
    setCurrentUrl(url);
    setCanGoBack(historyIndex.current > 0);
  }, []);

  // بازگشت به عقب
  const goBack = useCallback(() => {
    if (viewMode === 'webview' && historyIndex.current > 0) {
      historyIndex.current -= 1;
      const prevUrl = navigationHistory.current[historyIndex.current];
      setCurrentUrl(prevUrl);
      webViewKey.current += 1;
      setCanGoBack(historyIndex.current > 0);
    } else if (viewMode === 'webview') {
      // برگشت به صفحه اصلی نیتیو
      setViewMode('home');
      setActiveTab('home');
      setPageTitle(APP_CONFIG.app.fullName);
    }
  }, [viewMode]);

  // بازگشت به خانه
  const goHome = useCallback(() => {
    handleTabChange('home');
  }, [handleTabChange]);

  // تازه‌سازی صفحه
  const refresh = useCallback(() => {
    if (viewMode === 'webview') {
      webViewKey.current += 1;
    }
    // صفحه اصلی نیتیو نیاز به رفرش ندارد (تاریخ هر بار آپدیت می‌شود)
  }, [viewMode]);

  // اشتراک‌گذاری
  const handleShare = useCallback(() => {
    setShowShare(true);
  }, []);

  // عنوان نوار ابزار بر اساس حالت فعلی
  const displayTitle = viewMode === 'home' ? APP_CONFIG.app.fullName : pageTitle;
  const displayCanGoBack = viewMode === 'webview' && (canGoBack || activeTab !== 'home');

  return (
    <IonApp>
      <div className="app-container">
        <Toolbar
          title={displayTitle}
          onShare={handleShare}
          onRefresh={refresh}
          onHome={goHome}
          onMenu={() => console.log('menu')}
          canGoBack={displayCanGoBack}
          onBack={goBack}
        />

        {viewMode === 'home' ? (
          <HomePage
            onNavigateToTab={handleTabChange}
            onOpenUrl={handleOpenUrl}
          />
        ) : (
          <AppWebView
            key={webViewKey.current}
            url={currentUrl}
            onTitleChange={setPageTitle}
            onUrlChange={handleUrlChange}
            onLoadingChange={setLoading}
          />
        )}

        <TabBar
          activeTab={activeTab}
          onTabChange={handleTabChange}
        />

        <ShareSheet
          url={viewMode === 'webview' ? currentUrl : APP_CONFIG.siteUrl}
          title={displayTitle}
          visible={showShare}
          onClose={() => setShowShare(false)}
        />

        <InAppNotification
          notification={inAppNotification}
          onClick={(n) => {
            if (n.data?.url) {
              handleOpenUrl(n.data.url, 'إشعار');
            }
          }}
          onClose={() => setInAppNotification(null)}
        />
      </div>
    </IonApp>
  );
};

export default App;
