import React, { useState, useEffect } from 'react';

interface HijriDate {
  day: number;
  month: number;
  monthName: string;
  year: number;
  weekday: string;
  fullString: string;
}

const HIJRI_MONTHS = [
  'محرم', 'صفر', 'ربيع الأول', 'ربيع الثاني',
  'جمادى الأولى', 'جمادى الثانية', 'رجب', 'شعبان',
  'رمضان', 'شوال', 'ذو القعدة', 'ذو الحجة'
];

const HIJRI_WEEKDAYS = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت'
];

const ARABIC_WEEKDAYS = [
  'الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء',
  'الخميس', 'الجمعة', 'السبت'
];

/**
 * تبدیل میلادی به قمری با استفاده از Intl.DateTimeFormat
 * این روش در همه مرورگرهای مدرن کار می‌کند
 */
function getHijriDate(): HijriDate {
  try {
    const now = new Date();

    // دریافت تاریخ قمری به عربی
    const hijriFormatter = new Intl.DateTimeFormat('ar-SA-u-ca-islamic', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric'
    });
    const hijriParts = hijriFormatter.formatToParts(now);

    let day = 1, month = 0, year = 1445;
    hijriParts.forEach(part => {
      if (part.type === 'day') day = parseInt(part.value, 10);
      if (part.type === 'month') month = parseInt(part.value, 10) - 1;
      if (part.type === 'year') year = parseInt(part.value, 10);
    });

    // نام روز هفته به عربی
    const weekdayIndex = now.getDay();
    const weekday = ARABIC_WEEKDAYS[weekdayIndex];

    const monthName = HIJRI_MONTHS[month] || 'محرم';

    return {
      day,
      month,
      monthName,
      year,
      weekday,
      fullString: `${weekday}، ${day} ${monthName} ${year} هـ`
    };
  } catch (e) {
    // fallback در صورت عدم پشتیبانی
    return {
      day: 1,
      month: 0,
      monthName: 'محرم',
      year: 1445,
      weekday: 'الأحد',
      fullString: 'الأحد، 1 محرم 1445 هـ'
    };
  }
}

/**
 * کامپوننت نمایش تاریخ قمری در یک کادر زیبا
 */
export const HijriDateCard: React.FC = () => {
  const [hijriDate, setHijriDate] = useState<HijriDate | null>(null);
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    setHijriDate(getHijriDate());

    // آپدیت ساعت هر ثانیه
    const updateClock = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 60000); // هر دقیقه

    return () => clearInterval(timer);
  }, []);

  if (!hijriDate) {
    return <div className="hijri-card hijri-card--loading">...</div>;
  }

  return (
    <div className="hijri-card">
      <div className="hijri-card__background">
        <span className="hijri-card__pattern">۞</span>
      </div>

      <div className="hijri-card__content">
        <div className="hijri-card__right">
          <div className="hijri-card__weekday">{hijriDate.weekday}</div>
          <div className="hijri-card__date">
            <span className="hijri-card__day">{hijriDate.day}</span>
            <span className="hijri-card__month">{hijriDate.monthName}</span>
            <span className="hijri-card__year">{hijriDate.year} هـ</span>
          </div>
        </div>

        <div className="hijri-card__divider"></div>

        <div className="hijri-card__left">
          <div className="hijri-card__clock-icon">
            <ion-icon name="time-outline"></ion-icon>
          </div>
          <div className="hijri-card__time">{currentTime}</div>
        </div>
      </div>
    </div>
  );
};
