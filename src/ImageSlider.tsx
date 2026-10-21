import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SlideItem {
  id: number;
  imageUrl: string;
  title: string;
  subtitle?: string;
  link?: string;
}

interface ImageSliderProps {
  onSlideClick?: (link: string, title: string) => void;
}

/**
 * آدرس تصاویر اسلایدر - از ماژول DJ-MediaTools سایت sibtayn.com استخراج شده
 * این تصاویر ممکن است توسط مدیر سایت تغییر کنند، در صورت نیاز آدرس‌ها را به‌روزرسانی کنید
 */
const SLIDES: SlideItem[] = [
  {
    id: 1,
    imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-i/h-fatemeh11.jpg',
    title: 'مناسبات السيدة فاطمة الزهراء (س)',
    subtitle: 'ذكرى استشهاد السيدة الزهراء',
    link: 'https://www.sibtayn.com/ar/index.php?option=com_sppagebuilder&view=page&id=13&Itemid=914'
  },
  {
    id: 2,
    imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-ii/m-h-zahra12.jpg',
    title: 'مولد السيدة زينب (س)',
    subtitle: 'ذكرى ميلاد العقيلة',
    link: 'https://www.sibtayn.com/ar/index.php?option=com_hwdmediashare&view=mediaitem&id=8123&Itemid=5009&category_id=3994'
  },
  {
    id: 3,
    imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-i/h-fatemeh06.jpg',
    title: 'فاطمة الزهراء (س) - الكوثر',
    subtitle: 'من سيرة سيدة نساء العالمين',
    link: 'https://www.sibtayn.com/ar/index.php?option=com_hwdmediashare&view=category&id=3733&Itemid=4855'
  },
  {
    id: 4,
    imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-i/h-fatemeh15.jpg',
    title: 'إصدارات المؤسسة',
    subtitle: 'إصدارات مؤسسة السبطين',
    link: 'https://www.sibtayn.com/ar/index.php?option=com_hwdmediashare&view=category&id=3715&Itemid=4855'
  }
];

/**
 * اسلایدر تصاویر نیتیو
 * - اسلایدها هر ۵ ثانیه به‌طور خودکار عوض می‌شوند
 * - پشتیبانی از سوایپ دستی
 * - نقاط (dots) نشان‌دهنده موقعیت فعلی
 */
export const ImageSlider: React.FC<ImageSliderProps> = ({ onSlideClick }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // چرخش خودکار اسلایدها
  useEffect(() => {
    if (isPaused) return;

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, nextSlide]);

  // هندل سوایپ
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;

    const diff = touchStartX.current - touchEndX.current;
    const threshold = 50; // حداقل 50px سوایپ

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        // سوایپ به چپ → اسلاید بعدی (در RTL برعکس)
        prevSlide();
      } else {
        // سوایپ به راست → اسلاید قبلی (در RTL برعکس)
        nextSlide();
      }
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  const handleClick = (slide: SlideItem) => {
    if (slide.link && onSlideClick) {
      onSlideClick(slide.link, slide.title);
    }
  };

  return (
    <div
      className="image-slider"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="image-slider__track"
        style={{
          transform: `translateX(${currentIndex * 100}%)`
        }}
      >
        {SLIDES.map((slide, index) => (
          <div
            key={slide.id}
            className={`image-slider__slide ${index === currentIndex ? 'image-slider__slide--active' : ''}`}
            onClick={() => handleClick(slide)}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="image-slider__image"
              loading={index === 0 ? 'eager' : 'lazy'}
            />
            <div className="image-slider__overlay" />
            <div className="image-slider__content">
              <h3 className="image-slider__title">{slide.title}</h3>
              {slide.subtitle && (
                <p className="image-slider__subtitle">{slide.subtitle}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* دکمه‌های ناوبری */}
      <button
        className="image-slider__nav image-slider__nav--prev"
        onClick={(e) => { e.stopPropagation(); nextSlide(); }}
        aria-label="التالي"
      >
        <ion-icon name="chevron-forward-outline"></ion-icon>
      </button>
      <button
        className="image-slider__nav image-slider__nav--next"
        onClick={(e) => { e.stopPropagation(); prevSlide(); }}
        aria-label="السابق"
      >
        <ion-icon name="chevron-back-outline"></ion-icon>
      </button>

      {/* نقاط نشان‌دهنده */}
      <div className="image-slider__dots">
        {SLIDES.map((_, index) => (
          <button
            key={index}
            className={`image-slider__dot ${index === currentIndex ? 'image-slider__dot--active' : ''}`}
            onClick={(e) => { e.stopPropagation(); goToSlide(index); }}
            aria-label={`الشريحة ${index + 1}`}
          />
        ))}
      </div>

      {/* شمارنده */}
      <div className="image-slider__counter">
        {currentIndex + 1} / {SLIDES.length}
      </div>
    </div>
  );
};
