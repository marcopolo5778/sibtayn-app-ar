import React from 'react';
import { APP_CONFIG } from '@/services/config';

interface TabBarProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * نوار پایینی اپلیکیشن با ۵ تب اصلی
 */
export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="app-tab-bar" role="tablist">
      {APP_CONFIG.tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const iconName = isActive ? tab.iconActive : tab.icon;

        return (
          <button
            key={tab.id}
            className={`app-tab ${isActive ? 'app-tab--active' : ''}`}
            onClick={() => onTabChange(tab.id)}
            role="tab"
            aria-selected={isActive}
            aria-label={tab.title}
          >
            <ion-icon name={iconName}></ion-icon>
            <span className="app-tab__label">{tab.title}</span>
          </button>
        );
      })}
    </nav>
  );
};
