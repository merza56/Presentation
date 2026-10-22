(function () {
  const slides = Array.from(document.querySelectorAll('.slide'));
  const totalSlides = slides.length;
  const currentSlideNumEl = document.getElementById('currentSlideNum');
  const totalSlidesNumEl = document.getElementById('totalSlidesNum');
  const transitionBadgeEl = document.getElementById('transitionBadge');
  const progressBar = document.getElementById('progressBar');
  const bgStage = document.getElementById('bgStage');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const dotsContainer = document.getElementById('dotsContainer');

  let currentIndex = 0;
  let isAnimating = false;

  totalSlidesNumEl.textContent = String(totalSlides).padStart(2, '0');

  // Preload background images from Shatt Al-Arab Residential City
  slides.forEach((slide) => {
    const bgUrl = slide.getAttribute('data-bg');
    if (bgUrl) {
      const img = new Image();
      img.src = bgUrl;
    }
  });

  // Create navigation dots
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
      // Trigger subtle Ken Burns effect
      void bgStage.offsetWidth;
      bgStage.classList.add('ken-burns');
    }

    // Update transition indicator badge
    const transitionName = activeSlide.getAttribute('data-transition-name') || 'انتقال سلس';
    if (transitionBadgeEl) {
      transitionBadgeEl.textContent = 'حركة الصفحة: ' + transitionName;
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
