import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/**
 * ثبت Service Worker برای PWA Builder
 * فقط در محیط production فعال می‌شود
 */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('✓ Service Worker registered:', registration.scope);
      })
      .catch((error) => {
        console.error('❌ Service Worker registration failed:', error);
      });
  });

  // لیسنر برای پیام‌های از SW (مثلاً کلیک روی نوتیفیکیشن)
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data?.type === 'OPEN_URL' && event.data.url) {
      window.location.href = event.data.url;
    }
  });
}

/**
 * Web Push Notifications (برای PWA - بدون نیاز به Firebase)
 * این کد فقط در مرورگر کار می‌کند و جایگزین Capacitor Push در نسخه PWA است
 */
async function setupWebPush() {
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return;
  }

  // درخواست دسترسی (اختیاری - کاربر باید دکمه‌ای برای فعال‌سازی داشته باشد)
  // اینجا فقط ثبت می‌کنیم، کاربر باید خودش اجازه بدهد
  if (Notification.permission === 'default') {
    console.log('Notification permission not yet requested');
  }
}

setupWebPush();
