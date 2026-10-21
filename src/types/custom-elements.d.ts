/**
 * تعریف تگ‌های HTML سفارشی که توسط Ionicons اضافه شده‌اند
 * بدون این فایل، TypeScript خطای "Property 'ion-icon' does not exist" می‌دهد
 */

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'ion-icon': any;
    }
  }
}

export {};
