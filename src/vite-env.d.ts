/// <reference types="vite/client" />

interface Window {
  // برای اطمینان از پشتیبانی مرورگر از Service Worker
  __WB_MANIFEST?: Array<{ url: string; revision: string | null }>;
}
