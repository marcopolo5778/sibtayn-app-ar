import React, { useState } from 'react';
import { shareService } from '@/services/shareService';

interface ShareSheetProps {
  url: string;
  title: string;
  visible: boolean;
  onClose: () => void;
}

/**
 * پنل اشتراک‌گذاری از پایین صفحه
 */
export const ShareSheet: React.FC<ShareSheetProps> = ({
  url,
  title,
  visible,
  onClose
}) => {
  if (!visible) return null;

  const handleShare = async (method: 'native' | 'copy' | 'whatsapp' | 'telegram') => {
    switch (method) {
      case 'native':
        await shareService.share(url, title);
        break;
      case 'copy':
        try {
          await navigator.clipboard.writeText(url);
          alert('تم نسخ الرابط');
        } catch (e) {
          console.error('Copy error:', e);
        }
        break;
      case 'whatsapp':
        window.open(`https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`, '_system');
        break;
      case 'telegram':
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`, '_system');
        break;
    }
    onClose();
  };

  return (
    <div className="share-modal" onClick={onClose}>
      <div className="share-modal__sheet" onClick={(e) => e.stopPropagation()}>
        <h3 className="share-modal__title">مشاركة</h3>
        <div className="share-modal__options">
          <button
            className="share-modal__option share-modal__option--whatsapp"
            onClick={() => handleShare('whatsapp')}
          >
            <div className="share-modal__icon">
              <ion-icon name="logo-whatsapp"></ion-icon>
            </div>
            <span className="share-modal__label">واتساب</span>
          </button>

          <button
            className="share-modal__option share-modal__option--telegram"
            onClick={() => handleShare('telegram')}
          >
            <div className="share-modal__icon">
              <ion-icon name="paper-plane-outline"></ion-icon>
            </div>
            <span className="share-modal__label">تيليجرام</span>
          </button>

          <button
            className="share-modal__option share-modal__option--copy"
            onClick={() => handleShare('copy')}
          >
            <div className="share-modal__icon">
              <ion-icon name="copy-outline"></ion-icon>
            </div>
            <span className="share-modal__label">نسخ</span>
          </button>

          <button
            className="share-modal__option share-modal__option--more"
            onClick={() => handleShare('native')}
          >
            <div className="share-modal__icon">
              <ion-icon name="share-social-outline"></ion-icon>
            </div>
            <span className="share-modal__label">المزيد</span>
          </button>
        </div>
      </div>
    </div>
  );
};
