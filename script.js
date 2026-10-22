(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  const currentSlideNumEl = document.getElementById('currentSlideNum');
  const totalSlidesNumEl = document.getElementById('totalSlidesNum');
  const progressBar = document.getElementById('progressBar');
  const bgStage = document.getElementById('bgStage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const pdfDownloadBtn = document.getElementById('pdfDownloadBtn');
  const dotsContainer = document.getElementById('dotsContainer');

  let currentIndex = 0;
  let isAnimating = false;

  const totalFormatted = String(totalSlides).padStart(2, '0');
  totalSlidesNumEl.textContent = totalFormatted;

  // Fallback local stock images map for offline/print resilience
  const fallbackImages = [
    'images/stock-luxury-villa.jpg',
    'images/stock-executive-leadership.jpg',
    'images/stock-executive-leadership.jpg',
    'images/stock-team-talent.jpg',
    'images/stock-team-talent.jpg',
    'images/stock-sales-training.jpg',
    'images/stock-real-estate-sales.jpg',
    'images/stock-protocol-hospitality.jpg',
    'images/stock-executive-leadership.jpg',
    'images/stock-sales-training.jpg',
    'images/stock-city-gardens-events.jpg',
    'images/stock-luxury-villa.jpg'
  ];

  // Preload background images and inject exact 1:1 per-slide print/PDF replica chrome
  slides.forEach((slide, idx) => {
    const bgUrl = slide.getAttribute('data-bg') || '';
    const fallbackUrl = fallbackImages[idx % fallbackImages.length];
    if (bgUrl) {
      const img = new Image();
      img.src = bgUrl;
    }

    const slideNumFormatted = String(idx + 1).padStart(2, '0');
    const progressPercent = (((idx + 1) / totalSlides) * 100).toFixed(2);

    let dotsHtml = '';
    for (let d = 0; d < totalSlides; d++) {
      dotsHtml += `<span class="dot${d === idx ? ' active' : ''}"></span>`;
    }

    const chrome = document.createElement('div');
    chrome.className = 'slide-print-chrome';
    chrome.setAttribute('aria-hidden', 'true');
    chrome.innerHTML = `
      <div class="slide-print-bg">
        <svg class="slide-print-base-svg" viewBox="0 0 1600 900" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:0;">
          <rect width="1600" height="900" fill="#07090f" />
        </svg>
        <img src="${bgUrl}" onerror="this.src='${fallbackUrl}'" alt="" style="position:relative;z-index:1;" />
        <svg class="slide-print- tint-svg" viewBox="0 0 1600 900" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;z-index:2;">
          <defs>
            <radialGradient id="goldGlow${idx}" cx="18%" cy="22%" r="50%">
              <stop offset="0%" stop-color="#d4af37" stop-opacity="0.16" />
              <stop offset="100%" stop-color="#07090f" stop-opacity="0" />
            </radialGradient>
            <linearGradient id="darkGrad${idx}" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#07090f" stop-opacity="0.90" />
              <stop offset="50%" stop-color="#0d121d" stop-opacity="0.76" />
              <stop offset="100%" stop-color="#07090f" stop-opacity="0.92" />
            </linearGradient>
          </defs>
          <rect width="1600" height="900" fill="url(#darkGrad${idx})" />
          <rect width="1600" height="900" fill="url(#goldGlow${idx})" />
        </svg>
      </div>
      <div class="slide-print-overlay"></div>
      <div class="slide-print-grid"></div>
      <div class="slide-print-progress">
        <div class="slide-print-progress-bar" style="width: ${progressPercent}%"></div>
      </div>
      <div class="slide-print-topbar">
        <div class="brand-mark">
          <span class="brand-dot"></span>
          <span>مدينة شط العرب السكنية — منظومة الإدارة وتطوير المبيعات</span>
        </div>
        <div class="header-meta">
          <div class="slide-counter">
            <span class="current">${slideNumFormatted}</span> / <span>${totalFormatted}</span>
          </div>
        </div>
      </div>
      <div class="slide-print-bottombar">
        <div class="nav-buttons">
          <span class="nav-btn${idx === 0 ? ' disabled' : ''}">
            <span>→</span>
            <span>السابق</span>
          </span>
          <span class="nav-btn${idx === totalSlides - 1 ? ' disabled' : ''}">
            <span>التالي</span>
            <span>←</span>
          </span>
        </div>
        <div class="dots-nav">${dotsHtml}</div>
      </div>
    `;
    slide.insertBefore(chrome, slide.firstChild);
  });

  // Create interactive navigation dots
  slides.forEach((_, idx) => {
    const dot = document.createElement('button');
    dot.className = 'dot' + (idx === 0 ? ' active' : '');
    dot.setAttribute('aria-label', 'انتقال إلى شريحة ' + (idx + 1));
    dot.addEventListener('click', () => goToSlide(idx));
    dotsContainer.appendChild(dot);
  });

  const dots = Array.from(dotsContainer.querySelectorAll('.dot'));

  function updateSlidesState() {
    const activeSlide = slides[currentIndex];

    slides.forEach((slide, idx) => {
      slide.classList.remove('active', 'prev-slide', 'next-slide');
      if (idx === currentIndex) {
        slide.classList.add('active');
      } else if (idx < currentIndex) {
        slide.classList.add('prev-slide');
      } else {
        slide.classList.add('next-slide');
      }
    });

    // Update dynamic background image from active slide
    const bgUrl = activeSlide.getAttribute('data-bg');
    if (bgUrl && bgStage) {
      bgStage.classList.remove('ken-burns');
      bgStage.style.backgroundImage = `url("${bgUrl}")`;
      void bgStage.offsetWidth;
      bgStage.classList.add('ken-burns');
    }

    dots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentIndex);
    });

    currentSlideNumEl.textContent = String(currentIndex + 1).padStart(2, '0');
    const progressPercent = ((currentIndex + 1) / totalSlides) * 100;
    progressBar.style.width = progressPercent + '%';

    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === totalSlides - 1;
  }

  function goToSlide(targetIndex) {
    if (isAnimating || targetIndex === currentIndex || targetIndex < 0 || targetIndex >= totalSlides) {
      return;
    }
    isAnimating = true;
    currentIndex = targetIndex;
    updateSlidesState();
    setTimeout(() => {
      isAnimating = false;
    }, 750);
  }

  function nextSlide() {
    if (currentIndex < totalSlides - 1) {
      goToSlide(currentIndex + 1);
    }
  }

  function prevSlide() {
    if (currentIndex > 0) {
      goToSlide(currentIndex - 1);
    }
  }

  prevBtn.addEventListener('click', prevSlide);
  nextBtn.addEventListener('click', nextSlide);

  // PDF Export button: ensures all slide images are ready, then triggers 1:1 widescreen PDF export
  if (pdfDownloadBtn) {
    pdfDownloadBtn.addEventListener('click', () => {
      window.print();
    });
  }

  // Keyboard navigation (RTL aware: ArrowLeft = Next, ArrowRight = Prev)
  window.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides - 1);
    }
  });

  // Touch swipe support
  let touchStartX = 0;
  let touchEndX = 0;

  window.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  window.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    const deltaX = touchEndX - touchStartX;
    if (Math.abs(deltaX) > 50) {
      if (deltaX > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }
  }, { passive: true });

  // Initialize first slide
  updateSlidesState();
})();
