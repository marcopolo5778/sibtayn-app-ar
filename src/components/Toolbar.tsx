import React from 'react';

interface ToolbarProps {
  title: string;
  onShare: () => void;
  onRefresh: () => void;
  onHome: () => void;
  onMenu: () => void;
  canGoBack: boolean;
  onBack: () => void;
}

/**
 * نوار بالایی اپلیکیشن
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  title,
  onShare,
  onRefresh,
  onHome,
  onMenu,
  canGoBack,
  onBack
}) => {
  return (
    <header className="app-toolbar" role="banner">
      <button
        className="app-toolbar__btn"
        onClick={canGoBack ? onBack : onMenu}
        aria-label={canGoBack ? 'رجوع' : 'القائمة'}
      >
        <ion-icon name={canGoBack ? 'arrow-forward-outline' : 'menu-outline'}></ion-icon>
      </button>

      <h1 className="app-toolbar__title">{title}</h1>

      <button
        className="app-toolbar__btn"
        onClick={onHome}
        aria-label="الصفحة الرئيسية"
      >
        <ion-icon name="home-outline"></ion-icon>
      </button>

      <button
        className="app-toolbar__btn"
        onClick={onRefresh}
        aria-label="تحديث"
      >
        <ion-icon name="refresh-outline"></ion-icon>
      </button>

      <button
        className="app-toolbar__btn"
        onClick={onShare}
        aria-label="مشاركة"
      >
        <ion-icon name="share-social-outline"></ion-icon>
      </button>
    </header>
  );
};
