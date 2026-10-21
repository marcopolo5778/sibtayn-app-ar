import React, { useState, useEffect } from 'react';

interface InAppNotificationProps {
  notification: { title: string; body: string; data?: any } | null;
  onClick?: (notification: any) => void;
  onClose: () => void;
}

/**
 * نوتیفیکیشن درون‌برنامه‌ای
 * وقتی Push Notification دریافت می‌شود و اپ باز است، این نمایش داده می‌شود
 */
export const InAppNotification: React.FC<InAppNotificationProps> = ({
  notification,
  onClick,
  onClose
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (notification) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onClose, 300);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [notification, onClose]);

  if (!notification || !visible) return null;

  const handleClick = () => {
    onClick?.(notification);
    setVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div className="in-app-notification" onClick={handleClick}>
      <div className="in-app-notification__icon">
        <ion-icon name="notifications-outline"></ion-icon>
      </div>
      <div className="in-app-notification__content">
        <h4 className="in-app-notification__title">{notification.title}</h4>
        <p className="in-app-notification__body">{notification.body}</p>
      </div>
      <button
        className="in-app-notification__close"
        onClick={(e) => {
          e.stopPropagation();
          setVisible(false);
          setTimeout(onClose, 300);
        }}
        aria-label="إغلاق"
      >
        <ion-icon name="close-outline"></ion-icon>
      </button>
    </div>
  );
};
