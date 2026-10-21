import React, { useState, useEffect, useRef, useCallback } from 'react';

interface SlideItem {
  imageUrl: string;
  title: string;
  subtitle?: string;
  link?: string;
}

interface ImageSliderProps {
  onSlideClick?: (link: string, title: string) => void;
}

/**
 * اسلایدر تصاویر نیتیو - تصاویر را به‌طور خودکار از API می‌گیرد
 *
 * API (که روی Vercel اجرا می‌شود) خودش صفحه اصلی سایت sibtayn.com را می‌خواند
 * و تصاویر اسلایدر واقعی را استخراج می‌کند. در نتیجه:
 * - هر بار که مدیر سایت تصاویر اسلایدر را تغییر دهد، اپلیکیشن هم به‌روز می‌شود
 * - نیازی به تعریف دستی تصاویر نیست
 * - هر ۱ ساعت تصاویر به‌روزرسانی می‌شوند (cache)
 */
export const ImageSlider: React.FC<ImageSliderProps> = ({ onSlideClick }) => {
  const [slides, setSlides] = useState<SlideItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * دریافت تصاویر اسلایدر از API
   */
  const fetchSlides = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // درخواست به API که روی Vercel اجرا می‌شود
      // API آدرس سایت /api/slider دارد
      const response = await fetch('/api/slider', {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.success && data.slides && data.slides.length > 0) {
        setSlides(data.slides);
      } else if (data.slides && data.slides.length > 0) {
        // fallback هم موفق است
        setSlides(data.slides);
      } else {
        throw new Error('No slides returned');
      }
    } catch (err) {
      console.error('Error fetching slides:', err);
      setError('تعذر تحميل الشريحة');
      // در صورت خطا، تصاویر پیش‌فرض استفاده می‌شوند
      setSlides(getFallbackSlides());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSlides();
  }, [fetchSlides]);

  const nextSlide = useCallback(() => {
    setCurrentIndex(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentIndex(prev => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // چرخش خودکار اسلایدها
  useEffect(() => {
    if (isPaused || slides.length === 0) return;

    intervalRef.current = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPaused, nextSlide, slides.length]);

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
    const threshold = 50;

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        prevSlide();
      } else {
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

  // حالت لودینگ
  if (loading) {
    return (
      <div className="image-slider image-slider--loading">
        <div className="image-slider__loading">
          <ion-icon name="images-outline"></ion-icon>
          <span>جاري تحميل الشريحة...</span>
        </div>
      </div>
    );
  }

  // حالت بدون اسلاید
  if (slides.length === 0) {
    return (
      <div className="image-slider image-slider--error">
        <div className="image-slider__loading">
          <ion-icon name="alert-circle-outline"></ion-icon>
          <span>لا توجد شرائح</span>
        </div>
      </div>
    );
  }

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
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`image-slider__slide ${index === currentIndex ? 'image-slider__slide--active' : ''}`}
            onClick={() => handleClick(slide)}
          >
            <img
              src={slide.imageUrl}
              alt={slide.title}
              className="image-slider__image"
              loading={index === 0 ? 'eager' : 'lazy'}
              onError={(e) => {
                // در صورت خطا در لود تصویر، تصویر پیش‌فرض نمایش داده می‌شود
                (e.target as HTMLImageElement).style.background = '#0F4C81';
                (e.target as HTMLImageElement).style.opacity = '0.3';
              }}
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
      {slides.length > 1 && (
        <>
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
            {slides.map((_, index) => (
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
            {currentIndex + 1} / {slides.length}
          </div>
        </>
      )}
    </div>
  );
};

/**
 * تصاویر پیش‌فرض fallback
 * در صورت عدم دسترسی به API یا سایت
 */
function getFallbackSlides(): SlideItem[] {
  return [
    {
      imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-i/h-fatemeh11.jpg',
      title: 'مناسبات السيدة فاطمة الزهراء (س)',
      subtitle: 'ذكرى استشهاد السيدة الزهراء',
      link: 'https://www.sibtayn.com/ar/index.php?option=com_sppagebuilder&view=page&id=13&Itemid=914'
    },
    {
      imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-ii/m-h-zahra12.jpg',
      title: 'مولد السيدة زينب (س)',
      subtitle: 'ذكرى ميلاد العقيلة',
      link: 'https://www.sibtayn.com/ar/index.php?option=com_hwdmediashare&view=mediaitem&id=8123&Itemid=5009&category_id=3994'
    },
    {
      imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-i/h-fatemeh06.jpg',
      title: 'فاطمة الزهراء (س) - الكوثر',
      subtitle: 'من سيرة سيدة نساء العالمين',
      link: 'https://www.sibtayn.com/ar/index.php?option=com_hwdmediashare&view=category&id=3733&Itemid=4855'
    },
    {
      imageUrl: 'https://www.sibtayn.com/sibtaynplayer/images/jamadi-i/h-fatemeh15.jpg',
      title: 'إصدارات المؤسسة',
      subtitle: 'إصدارات مؤسسة السبطين',
      link: 'https://www.sibtayn.com/ar/index.php?option=com_hwdmediashare&view=category&id=3715&Itemid=4855'
    }
  ];
}
