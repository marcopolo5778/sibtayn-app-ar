import { APP_CONFIG } from './config';

/**
 * سرویس Push Notification با Firebase Cloud Messaging
 *
 * برای استفاده از این سرویس باید:
 * 1. در Firebase Console یک پروژه بسازید
 * 2. فایل google-services.json را دانلود و در android/app/ قرار دهید
 * 3. از Firebase Server Key برای ارسال نوتیفیکیشن از پنل خودتان استفاده کنید
 */
export class PushNotificationService {
  private initialized = false;

  async init(): Promise<void> {
    if (this.initialized) return;

    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');

      // بررسی دسترسی
      let permStatus = await PushNotifications.checkPermissions();
      let requestStatus = permStatus;

      if (requestStatus.receive === 'prompt') {
        requestStatus = await PushNotifications.requestPermissions();
      }

      if (requestStatus.receive !== 'granted') {
        console.warn(' Push notification permission not granted');
        return;
      }

      // ثبت برای دریافت نوتیفیکیشن
      await PushNotifications.register();
      this.setupListeners(PushNotifications);
      this.initialized = true;

      console.log('✓ Push notifications initialized');
    } catch (error) {
      console.error(' Push notification init error:', error);
    }
  }

  private async setupListeners(PushNotifications: any) {
    // دریافت توکن ثبت
    PushNotifications.addListener('registration', (token: any) => {
      console.log('✓ Push token received:', token.value);
      this.saveToken(token.value);
      // 🔔 این توکن را باید در سرور خود ذخیره کنید تا بتوانید نوتیفیکیشن ارسال کنید
    });

    // خطا در ثبت
    PushNotifications.addListener('registrationError', (error: any) => {
      console.error(' Push registration error:', error);
    });

    // دریافت نوتیفیکیشن (در حالت Foreground)
    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: any) => {
        console.log(' Notification received:', notification);
        this.showInAppNotification(notification);
      }
    );

    // کلیک روی نوتیفیکیشن
    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: any) => {
        console.log(' Notification clicked:', action);
        const data = action.notification.data;
        // اگر لینک در نوتیفیکیشن وجود دارد، بازش کن
        if (data?.url) {
          window.dispatchEvent(new CustomEvent('open-url', { detail: data.url }));
        } else if (data?.articleUrl) {
          window.dispatchEvent(new CustomEvent('open-url', { detail: data.articleUrl }));
        }
      }
    );
  }

  /**
   * ذخیره توکن در حافظه محلی
   */
  private async saveToken(token: string) {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      await Preferences.set({
        key: 'push_token',
        value: token
      });
    } catch (e) {
      console.error('Save token error:', e);
    }
  }

  /**
   * دریافت توکن ذخیره شده
   */
  async getToken(): Promise<string | null> {
    try {
      const { Preferences } = await import('@capacitor/preferences');
      const { value } = await Preferences.get({ key: 'push_token' });
      return value;
    } catch {
      return null;
    }
  }

  /**
   * نمایش نوتیفیکیشن درون‌برنامه‌ای (وقتی اپ باز است)
   */
  private showInAppNotification(notification: any) {
    const event = new CustomEvent('in-app-notification', {
      detail: {
        title: notification.title || 'إشعار جديد',
        body: notification.body || '',
        data: notification.data
      }
    });
    window.dispatchEvent(event);
  }

  /**
   * لغو ثبت
   */
  async unregister() {
    try {
      const { PushNotifications } = await import('@capacitor/push-notifications');
      await PushNotifications.unregister();
      console.log('Unregistered from push notifications');
    } catch (e) {
      console.error('Unregister error:', e);
    }
  }
}

export const pushService = new PushNotificationService();
