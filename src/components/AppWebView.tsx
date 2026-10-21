import React, { useRef, useState, useEffect, useCallback } from 'react';
import { APP_CONFIG } from '@/services/config';

interface AppWebViewProps {
  url: string;
  onTitleChange?: (title: string) => void;
  onUrlChange?: (url: string) => void;
  onLoadingChange?: (loading: boolean) => void;
  onShareRequest?: (url: string, title: string) => void;
}

/**
 * کامپوننت WebView اصلی اپلیکیشن
 * سایت مؤسسة السبطین را نمایش می‌دهد
 */
export const AppWebView: React.FC<AppWebViewProps> = ({
  url,
  onTitleChange,
  onUrlChange,
  onLoadingChange,
  onShareRequest
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loading, setLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(url);

  useEffect(() => {
    setCurrentUrl(url);
    setLoading(true);
    onLoadingChange?.(true);
  }, [url, onLoadingChange]);

  const handleLoad = useCallback(() => {
    setLoading(false);
    onLoadingChange?.(false);

    try {
      const iframe = iframeRef.current;
      if (iframe && iframe.contentWindow) {
        // تلاش برای دریافت عنوان صفحه
        const title = iframe.contentDocument?.title || APP_CONFIG.app.fullName;
        onTitleChange?.(title);

        // تلاش برای دریافت URL فعلی
        const newUrl = iframe.contentWindow.location.href;
        if (newUrl && newUrl !== 'about:blank') {
          setCurrentUrl(newUrl);
          onUrlChange?.(newUrl);
        }
      }
    } catch (e) {
      // به دلیل Same-Origin Policy ممکن است به محتوای iframe دسترسی نداشته باشیم
      onTitleChange?.(APP_CONFIG.app.fullName);
      onUrlChange?.(url);
    }
  }, [onTitleChange, onUrlChange, onLoadingChange, url]);

  const handleLoadStart = useCallback(() => {
    setLoading(true);
    onLoadingChange?.(true);
  }, [onLoadingChange]);

  // هندل لینک‌های خارجی
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a') as HTMLAnchorElement | null;

      if (anchor && anchor.href) {
        const href = anchor.href;

        // بررسی آیا لینک خارجی است
        const isExternal = APP_CONFIG.network.externalLinkPatterns.some(pattern =>
          href.includes(pattern)
        );

        // اگر لینک خارجی است یا در تب جدید باز می‌شود
        if (isExternal || anchor.target === '_blank') {
          e.preventDefault();
          // باز کردن در مرورگر خارجی
          window.open(href, '_system');
        }
      }
    };

    const iframe = iframeRef.current;
    if (iframe && iframe.contentWindow) {
      try {
        iframe.contentWindow.addEventListener('click', handleClick);
        return () => {
          iframe.contentWindow?.removeEventListener('click', handleClick);
        };
      } catch {
        // Same-Origin Policy
      }
    }
  }, [currentUrl]);

  return (
    <div className="app-webview-container">
      <iframe
        ref={iframeRef}
        src={currentUrl}
        className="app-webview"
        onLoad={handleLoad}
        onLoadStart={handleLoadStart}
        title="مؤسسة السبطين"
        sandbox="allow-same-origin allow-scripts allow-popups allow-forms allow-popups-to-escape-sandbox"
        referrerPolicy="no-referrer-when-downgrade"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
      />

      {loading && (
        <div className="loading-overlay">
          <div className="loading-overlay__spinner" />
          <div className="loading-overlay__text">جاري التحميل...</div>
        </div>
      )}
    </div>
  );
};
