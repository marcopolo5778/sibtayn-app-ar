/**
 * API خودکار برای استخراج تصاویر اسلایدر از سایت sibtayn.com
 *
 * این فایل روی Vercel به‌صورت Serverless Function اجرا می‌شود
 * و تصاویر اسلایدر را از HTML صفحه اصلی سایت استخراج می‌کند.
 *
 * URL: /api/slider
 * Method: GET
 * Response: { slides: [{ imageUrl, title, link }, ...] }
 */

export default async function handler(req, res) {
  // تنظیمات CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=7200');

  // پاسخ به درخواست‌های preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // دریافت HTML صفحه اصلی سایت
    const response = await fetch('https://www.sibtayn.com/ar/', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; SibtaynApp/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'ar,en;q=0.5'
      },
      timeout: 15000
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch sibtayn.com: ${response.status}`);
    }

    const html = await response.text();

    // استخراج تصاویر و لینک‌های اسلایدر
    const slides = extractSliderImages(html);

    // اگه چیزی پیدا نشد، fallback به تصاویر پیش‌فرض
    if (slides.length === 0) {
      return res.status(200).json({
        success: true,
        slides: getDefaultSlides(),
        source: 'fallback',
        cached_at: new Date().toISOString()
      });
    }

    return res.status(200).json({
      success: true,
      slides: slides,
      source: 'live',
      cached_at: new Date().toISOString()
    });

  } catch (error) {
    console.error('Slider API error:', error);
    // fallback در صورت خطا
    return res.status(200).json({
      success: false,
      slides: getDefaultSlides(),
      source: 'fallback',
      error: error.message,
      cached_at: new Date().toISOString()
    });
  }
}

/**
 * استخراج تصاویر اسلایدر از HTML
 * سایت از DJ-MediaTools استفاده می‌کند که اسلایدر را در div با کلاس dj-slideshow می‌سازد
 */
function extractSliderImages(html) {
  const slides = [];
  const seenUrls = new Set();

  // پیدا کردن بخش اسلایدر (DJ-MediaTools)
  // الگو: <div id="dj-slideshow..." ...>...</div>
  const slideshowRegex = /<div[^>]*id="dj-slideshow[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>\s*<\/div>\s*<\/div>/;
  const slideshowMatch = html.match(slideshowRegex);

  if (!slideshowMatch) {
    // الگوهای جایگزین
    return extractFromAlternativePatterns(html);
  }

  const sliderHtml = slideshowMatch[1];

  // پیدا کردن هر slide
  // الگو: <div class="dj-slide dj-slide-N ...">...</div>
  const slideRegex = /<div[^>]*class="[^"]*dj-slide[^"]*"[^>]*>([\s\S]*?)(?=<div[^>]*class="[^"]*dj-slide[^"]*"|<\/div>\s*<\/div>\s*<\/div>)/g;
  let slideMatch;

  while ((slideMatch = slideRegex.exec(sliderHtml)) !== null) {
    const slideContent = slideMatch[1];

    // استخراج تصویر
    const imgMatch = slideContent.match(/<img[^>]*src="([^"]+)"[^>]*>/);
    if (!imgMatch) continue;

    let imageUrl = imgMatch[1];

    // تبدیل آدرس نسبی به مطلق
    if (imageUrl.startsWith('/')) {
      imageUrl = 'https://www.sibtayn.com' + imageUrl;
    } else if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }

    // فیلتر کردن تصاویر کوچک (مثل دکمه‌های ناوبری)
    if (imageUrl.includes('next.png') ||
        imageUrl.includes('prev.png') ||
        imageUrl.includes('play.png') ||
        imageUrl.includes('pause.png') ||
        imageUrl.includes('/layouts/')) {
      continue;
    }

    // جلوگیری از تکرار
    if (seenUrls.has(imageUrl)) continue;
    seenUrls.add(imageUrl);

    // استخراج لینک
    const linkMatch = slideContent.match(/<a[^>]*href="([^"]+)"[^>]*>/);
    let link = linkMatch ? linkMatch[1] : '';
    if (link.startsWith('/')) {
      link = 'https://www.sibtayn.com' + link;
    } else if (link.startsWith('http://')) {
      link = link.replace('http://', 'https://');
    }

    // استخراج عنوان از alt یا title
    const altMatch = slideContent.match(/<img[^>]*alt="([^"]*)"[^>]*>/);
    const titleMatch = slideContent.match(/<[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)</);
    const title = (titleMatch && titleMatch[1].trim()) ||
                  (altMatch && altMatch[1].trim()) ||
                  'مناسبة دينية';

    // استخراج زیرعنوان (اگه وجود داشته باشد)
    const descMatch = slideContent.match(/<[^>]*class="[^"]*desc[^"]*"[^>]*>([^<]+)</);
    const subtitle = descMatch ? descMatch[1].trim() : '';

    slides.push({
      imageUrl,
      title,
      subtitle,
      link
    });
  }

  return slides;
}

/**
 * الگوهای جایگزین برای پیدا کردن اسلایدر
 */
function extractFromAlternativePatterns(html) {
  const slides = [];
  const seenUrls = new Set();

  // الگو ۱: پیدا کردن تصاویر بزرگ با لینک
  const pattern1 = /<div[^>]*class="[^"]*slideshow[^"]*"[^>]*>([\s\S]*?)<\/div>/g;
  let match;

  while ((match = pattern1.exec(html)) !== null) {
    const content = match[1];

    const imgMatch = content.match(/<img[^>]*src="([^"]+\.(?:jpg|jpeg|png|webp))"[^>]*>/i);
    if (!imgMatch) continue;

    let imageUrl = imgMatch[1];
    if (imageUrl.startsWith('/')) {
      imageUrl = 'https://www.sibtayn.com' + imageUrl;
    } else if (imageUrl.startsWith('http://')) {
      imageUrl = imageUrl.replace('http://', 'https://');
    }

    if (imageUrl.includes('/layouts/') ||
        imageUrl.includes('/thumbs/') ||
        imageUrl.includes('next.png') ||
        imageUrl.includes('prev.png')) {
      continue;
    }

    if (seenUrls.has(imageUrl)) continue;
    seenUrls.add(imageUrl);

    slides.push({
      imageUrl,
      title: 'مناسبة دينية',
      subtitle: '',
      link: ''
    });
  }

  return slides;
}

/**
 * تصاویر پیش‌فرض fallback
 * در صورت عدم دسترسی به سایت، این تصاویر نمایش داده می‌شوند
 */
function getDefaultSlides() {
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
