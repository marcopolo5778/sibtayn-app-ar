/**
 * سرویس اشتراک‌گذاری نیتیو
 */
export class ShareService {
  async share(url: string, title?: string, text?: string): Promise<void> {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: title || 'مؤسسة السبطين عليهما السلام',
        text: text || '',
        url: url,
        dialogTitle: 'مشاركة'
      });
    } catch (error) {
      console.error('Share error:', error);
      // fallback: کپی به کلیپ‌بورد
      try {
        await navigator.clipboard.writeText(url);
        alert('تم نسخ الرابط');
      } catch (e) {
        console.error('Clipboard error:', e);
      }
    }
  }

  /**
   * اشتراک‌گذاری متن ساده
   */
  async shareText(text: string, title?: string): Promise<void> {
    try {
      const { Share } = await import('@capacitor/share');
      await Share.share({
        title: title || 'مشاركة',
        text: text,
        dialogTitle: 'مشاركة'
      });
    } catch (error) {
      console.error('Share text error:', error);
    }
  }
}

export const shareService = new ShareService();
