/* ============================================================
   BIRTHDAY LOVE WEBSITE — SCRIPT.JS
   Fitur: Loading, animasi scroll, lightbox, musik, parallax,
          floating hearts/particles, cursor glow
   ============================================================ */

(function () {
  'use strict';

  /* ---------- DOM Elements ---------- */
  const loadingScreen = document.getElementById('loading-screen');
  const cursorGlow = document.getElementById('cursor-glow');
  const particlesContainer = document.getElementById('particles');
  const floatingHeartsContainer = document.getElementById('floating-hearts');
  const starsContainer = document.getElementById('stars');
  const finalHeartsContainer = document.getElementById('final-hearts');
  const collagePhotos = document.getElementById('collage-photos');
  const bgMusic = document.getElementById('bg-music');
  const musicToggle = document.getElementById('music-toggle');
  const openLetterBtn = document.getElementById('open-letter-btn');

  /* ---------- Konfigurasi — mudah diedit ---------- */
  /* GANTI FOTO: sesuaikan daftar path foto kolase background */
  const COLLAGE_PHOTOS = Array.from(
    { length: 8 },
    (_, i) => `images/photo (${i + 1}).jpg`
  );

  /* ==================== UBAH TANGGAL KUNCI GALERI DI SINI ==================== */
  const GALLERY_UNLOCK_DATE = {
    year: 2025,
    month: 6,   /* 1 = Januari, 12 = Desember */
    day: 27
  };

  const GAME_CONFIG = {
    blowThreshold: 0.18,
    blowDurationMs: 180,
    micSmoothing: 0.85
  };

  const CONFIG = {
    musicVolume: 0.3,
    particleCount: 14,
    heartCount: 6,
    starCount: 30,
    collageTileCount: 30,
    collageCols: 6,
    collageRows: 6,
    loadingDuration: 2200,
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches
  };

  const STORAGE_KEYS = {
    galleryUnlocked: 'galleryUnlocked',
    galleryRevealed: 'galleryRevealed'
  };

  let musicStarted = false;
  let userInteracted = false;

  /* ==================== LOADING SCREEN ==================== */
  function initLoading() {
    document.body.style.overflow = 'hidden';

    setTimeout(() => {
      loadingScreen.classList.add('hidden');
      loadingScreen.setAttribute('aria-hidden', 'true');
      document.body.classList.add('loaded');
      document.body.style.overflow = '';
    }, CONFIG.loadingDuration);
  }

  /* ==================== CURSOR GLOW ==================== */
  function initCursorGlow() {
    if (CONFIG.prefersReducedMotion || !window.matchMedia('(hover: hover)').matches) return;

    let mouseX = 0;
    let mouseY = 0;
    let glowX = 0;
    let glowY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateGlow() {
      glowX += (mouseX - glowX) * 0.08;
      glowY += (mouseY - glowY) * 0.08;
      cursorGlow.style.left = glowX + 'px';
      cursorGlow.style.top = glowY + 'px';
      requestAnimationFrame(animateGlow);
    }

    animateGlow();
  }

  /* ==================== FLOATING PARTICLES ==================== */
  function initParticles() {
    if (CONFIG.prefersReducedMotion) return;

    const colors = ['#C9A96E', '#F5E6D3', '#6E6A66', '#E0C992', '#A8A4A0'];

    for (let i = 0; i < CONFIG.particleCount; i++) {
      const particle = document.createElement('div');
      particle.classList.add('particle');

      const size = Math.random() * 3 + 1.5;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const left = Math.random() * 100;
      const duration = Math.random() * 15 + 12;
      const delay = Math.random() * 10;

      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        background: ${color};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;

      particlesContainer.appendChild(particle);
    }
  }

  /* ==================== FLOATING HEARTS (Hero) ==================== */
  function initFloatingHearts() {
    if (CONFIG.prefersReducedMotion) return;

    const hearts = ['♥', '♡', '❤', '✦'];

    for (let i = 0; i < CONFIG.heartCount; i++) {
      const heart = document.createElement('span');
      heart.classList.add('floating-heart');
      heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];

      const left = Math.random() * 100;
      const duration = Math.random() * 8 + 10;
      const delay = Math.random() * 12;
      const size = Math.random() * 0.6 + 0.7;

      heart.style.cssText = `
        left: ${left}%;
        font-size: ${size}rem;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;

      floatingHeartsContainer.appendChild(heart);
    }
  }

  /* ==================== BACKGROUND KOLASE FOTO (blur, atmosfer) ==================== */
  function initCollage() {
    if (!collagePhotos) return;
    /* Kolase sudah ada di HTML — JS hanya tambah tile ekstra jika perlu */
    if (collagePhotos.children.length > 0) return;

    const { collageCols, collageRows, collageTileCount } = CONFIG;
    let count = 0;

    for (let row = 0; row < collageRows && count < collageTileCount; row++) {
      for (let col = 0; col < collageCols && count < collageTileCount; col++) {
        const tile = document.createElement('div');
        tile.className = 'collage-tile';

        const img = document.createElement('img');
        img.src = COLLAGE_PHOTOS[count % COLLAGE_PHOTOS.length];
        img.alt = '';
        img.loading = 'eager';

        const jitterX = (Math.random() - 0.5) * 6;
        const jitterY = (Math.random() - 0.5) * 6;
        const top = (row / collageRows) * 100 + jitterY - 4;
        const left = (col / collageCols) * 100 + jitterX - 4;
        const width = 100 / collageCols + 10 + Math.random() * 8;
        const height = 100 / collageRows + 10 + Math.random() * 8;
        const rotate = -8 + Math.random() * 16;

        tile.style.cssText = `
          top: ${top}%;
          left: ${left}%;
          width: ${width}%;
          height: ${height}%;
          --rotate: ${rotate}deg;
        `;

        tile.appendChild(img);
        collagePhotos.appendChild(tile);
        count++;
      }
    }
  }

  /* ==================== PARALLAX KOLASE (halus) ==================== */
  function initCollageParallax() {
    if (CONFIG.prefersReducedMotion || !collagePhotos) return;

    window.addEventListener('scroll', () => {
      const y = window.scrollY * 0.06;
      collagePhotos.style.transform = `scale(1.08) translateY(${y}px)`;
    }, { passive: true });
  }

  /* ==================== INTERSECTION OBSERVER (Scroll Animations) ==================== */
  function initScrollReveal() {
    const revealElements = document.querySelectorAll('.reveal:not(.gallery-item)');

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: '0px 0px -40px 0px'
      }
    );

    revealElements.forEach((el) => observer.observe(el));

    /* Stagger animasi masonry gallery */
    const galleryItems = document.querySelectorAll('.gallery-item.reveal');
    const galleryObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const items = [...document.querySelectorAll('.gallery-item.reveal')];
            const idx = items.indexOf(entry.target);
            setTimeout(() => {
              entry.target.classList.add('visible');
            }, idx * 80);
            galleryObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -20px 0px' }
    );

    galleryItems.forEach((el) => galleryObserver.observe(el));
  }

  /* ==================== GALLERY LIGHTBOX ==================== */
  function initLightbox() {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const galleryItems = document.querySelectorAll('.gallery-item');
    const btnClose = lightbox.querySelector('.lightbox-close');
    const btnPrev = lightbox.querySelector('.lightbox-prev');
    const btnNext = lightbox.querySelector('.lightbox-next');

    let currentIndex = 0;
    const images = [];

    galleryItems.forEach((item, index) => {
      const img = item.querySelector('img');
      images.push({ src: img.src, alt: img.alt || '' });

      item.addEventListener('click', () => openLightbox(index));
    });

    function openLightbox(index) {
      currentIndex = index;
      updateLightbox();
      lightbox.hidden = false;
      requestAnimationFrame(() => lightbox.classList.add('active'));
      document.body.style.overflow = 'hidden';

      const img = document.getElementById('lightbox-img');
      img.style.animation = 'none';
      requestAnimationFrame(() => { img.style.animation = ''; });
    }

    function closeLightbox() {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
      setTimeout(() => { lightbox.hidden = true; }, 400);
    }

    function updateLightbox() {
      const current = images[currentIndex];
      lightboxImg.src = current.src;
      lightboxImg.alt = current.alt;
    }

    function showPrev() {
      currentIndex = (currentIndex - 1 + images.length) % images.length;
      updateLightbox();
    }

    function showNext() {
      currentIndex = (currentIndex + 1) % images.length;
      updateLightbox();
    }

    btnClose.addEventListener('click', closeLightbox);
    btnPrev.addEventListener('click', showPrev);
    btnNext.addEventListener('click', showNext);

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
      if (!lightbox.classList.contains('active')) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrev();
      if (e.key === 'ArrowRight') showNext();
    });
  }

  /* ==================== BACKGROUND MUSIC ==================== */
  /* Ganti file musik di: music/song.mp3 */
  function initMusic() {
    bgMusic.volume = CONFIG.musicVolume;

    function tryPlayMusic() {
      if (musicStarted || !userInteracted) return;

      bgMusic.play()
        .then(() => {
          musicStarted = true;
          musicToggle.classList.add('playing');
          musicToggle.querySelector('.music-icon-play').classList.add('hidden');
          musicToggle.querySelector('.music-icon-pause').classList.remove('hidden');
        })
        .catch(() => {
          /* Autoplay diblokir browser — user bisa klik tombol musik */
        });
    }

    function onUserInteraction() {
      if (userInteracted) return;
      userInteracted = true;
      tryPlayMusic();
    }

    document.addEventListener('click', onUserInteraction, { once: false });
    document.addEventListener('touchstart', onUserInteraction, { once: false });
    document.addEventListener('keydown', onUserInteraction, { once: false });

    openLetterBtn.addEventListener('click', () => {
      onUserInteraction();
      setTimeout(tryPlayMusic, 300);
    });

    musicToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      userInteracted = true;

      if (bgMusic.paused) {
        bgMusic.play()
          .then(() => {
            musicStarted = true;
            musicToggle.classList.add('playing');
            musicToggle.querySelector('.music-icon-play').classList.add('hidden');
            musicToggle.querySelector('.music-icon-pause').classList.remove('hidden');
          })
          .catch(() => {});
      } else {
        bgMusic.pause();
        musicToggle.classList.remove('playing');
        musicToggle.querySelector('.music-icon-play').classList.remove('hidden');
        musicToggle.querySelector('.music-icon-pause').classList.add('hidden');
      }
    });
  }

  /* ==================== STARS (Final Section) ==================== */
  function initStars() {
    if (CONFIG.prefersReducedMotion) return;

    for (let i = 0; i < CONFIG.starCount; i++) {
      const star = document.createElement('div');
      star.classList.add('star');

      const left = Math.random() * 100;
      const top = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = Math.random() * 3 + 2;
      const size = Math.random() * 2 + 2;

      star.style.cssText = `
        left: ${left}%;
        top: ${top}%;
        width: ${size}px;
        height: ${size}px;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
      `;

      starsContainer.appendChild(star);
    }
  }

  /* ==================== RISING HEARTS (Final Section) ==================== */
  function initFinalHearts() {
    if (CONFIG.prefersReducedMotion) return;

    const finalSection = document.getElementById('final');
    let heartInterval;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            heartInterval = setInterval(createRisingHeart, 1200);
          } else {
            clearInterval(heartInterval);
          }
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(finalSection);

    function createRisingHeart() {
      const heart = document.createElement('span');
      heart.classList.add('final-heart');
      heart.textContent = '♥';

      const left = Math.random() * 80 + 10;
      const duration = Math.random() * 2 + 3;
      const size = Math.random() * 0.5 + 0.6;

      heart.style.cssText = `
        left: ${left}%;
        bottom: 20%;
        font-size: ${size}rem;
        animation-duration: ${duration}s;
      `;

      finalHeartsContainer.appendChild(heart);

      setTimeout(() => heart.remove(), duration * 1000);
    }
  }

  /* ==================== GALLERY PINTEREST LAYOUT ==================== */
  const PINTEREST_SIZE_CLASSES = [
    'gallery-item--sm',
    'gallery-item--md',
    'gallery-item--tall',
    'gallery-item--xl',
    'gallery-item--wide',
    'gallery-item--panorama'
  ];

  const PINTEREST_PATTERN = [
    'gallery-item--tall',
    '',
    'gallery-item--wide',
    'gallery-item--md',
    'gallery-item--xl',
    'gallery-item--sm',
    '',
    'gallery-item--panorama',
    'gallery-item--wide',
    'gallery-item--tall',
    '',
    'gallery-item--md',
    'gallery-item--sm',
    'gallery-item--xl',
    '',
    'gallery-item--wide',
    'gallery-item--tall',
    'gallery-item--panorama',
    'gallery-item--md',
    ''
  ];

  function initPinterestGallery() {
    document.querySelectorAll('.gallery-masonry .gallery-item').forEach((item, index) => {
      PINTEREST_SIZE_CLASSES.forEach((cls) => item.classList.remove(cls));
      const variant = PINTEREST_PATTERN[index % PINTEREST_PATTERN.length];
      if (variant) item.classList.add(variant);
    });
  }

  /* ==================== GALLERY LOCK ==================== */
  function isCorrectGalleryDate(dateStr) {
    if (!dateStr) return false;
    const [y, m, d] = dateStr.split('-').map(Number);
    return (
      y === GALLERY_UNLOCK_DATE.year &&
      m === GALLERY_UNLOCK_DATE.month &&
      d === GALLERY_UNLOCK_DATE.day
    );
  }

  function revealGalleryMasonry() {
    const items = document.querySelectorAll('.gallery-item.reveal');
    items.forEach((item, idx) => {
      setTimeout(() => item.classList.add('visible'), idx * 60);
    });
  }

  function showGalleryContent() {
    const gallery = document.getElementById('gallery');
    const galleryContent = document.getElementById('gallery-content');
    const lockSection = document.getElementById('gallery-lock');

    gallery.classList.remove('gallery--hidden');
    gallery.setAttribute('aria-hidden', 'false');
    galleryContent.classList.add('is-visible');
    sessionStorage.setItem(STORAGE_KEYS.galleryRevealed, '1');

    if (lockSection) {
      lockSection.style.display = 'none';
    }

    revealGalleryMasonry();

    setTimeout(() => {
      gallery.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 300);
  }

  function initGalleryLock() {
    const lockPanel = document.getElementById('gallery-lock-panel');
    const unlockPanel = document.getElementById('gallery-unlock-panel');
    const lockForm = document.getElementById('gallery-lock-form');
    const dateInput = document.getElementById('gallery-date-input');
    const lockError = document.getElementById('gallery-lock-error');
    const openBtn = document.getElementById('gallery-open-btn');
    const gallery = document.getElementById('gallery');

    if (!lockForm || !gallery) return;

    if (sessionStorage.getItem(STORAGE_KEYS.galleryRevealed) === '1') {
      document.getElementById('gallery-lock').style.display = 'none';
      gallery.classList.remove('gallery--hidden');
      gallery.setAttribute('aria-hidden', 'false');
      document.getElementById('gallery-content').classList.add('is-visible');
      revealGalleryMasonry();
      return;
    }

    if (sessionStorage.getItem(STORAGE_KEYS.galleryUnlocked) === '1') {
      lockPanel.classList.add('hidden');
      unlockPanel.classList.remove('hidden');
    }

    lockForm.addEventListener('submit', (e) => {
      e.preventDefault();
      lockError.classList.add('hidden');

      if (isCorrectGalleryDate(dateInput.value)) {
        sessionStorage.setItem(STORAGE_KEYS.galleryUnlocked, '1');
        lockPanel.classList.add('is-unlocking');
        setTimeout(() => {
          lockPanel.classList.add('hidden');
          unlockPanel.classList.remove('hidden');
        }, 600);
      } else {
        lockError.classList.remove('hidden');
        dateInput.focus();
      }
    });

    openBtn.addEventListener('click', showGalleryContent);
  }

  /* ==================== BIRTHDAY BLOW GAME ==================== */
  function initBirthdayGame() {
    const surpriseBtn = document.getElementById('surprise-btn');
    const gameOverlay = document.getElementById('birthday-game');
    const gameClose = document.getElementById('game-close');
    const gameDoneBtn = document.getElementById('game-done-btn');
    const gameStage = document.getElementById('game-stage');
    const gameSuccess = document.getElementById('game-success');
    const blowFallback = document.getElementById('blow-fallback');
    const micHint = document.getElementById('game-mic-hint');
    const meterFill = document.getElementById('game-meter-fill');
    const flames = document.querySelectorAll('.flame');
    const candles = document.querySelectorAll('.candle');
    const smokeLayer = document.getElementById('smoke-layer');
    const celebParticles = document.getElementById('celebration-particles');

    if (!surpriseBtn || !gameOverlay) return;

    let audioContext = null;
    let analyser = null;
    let micStream = null;
    let animationId = null;
    let blowStartTime = null;
    let candlesOut = false;
    let smoothedVolume = 0;

    function openGame() {
      gameOverlay.hidden = false;
      gameOverlay.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
      requestAnimationFrame(() => gameOverlay.classList.add('is-open'));
      resetGame();
      startMicrophone();
    }

    function closeGame() {
      gameOverlay.classList.remove('is-open');
      document.body.style.overflow = '';
      stopMicrophone();
      setTimeout(() => {
        gameOverlay.hidden = true;
        gameOverlay.setAttribute('aria-hidden', 'true');
      }, 600);
    }

    function resetGame() {
      candlesOut = false;
      blowStartTime = null;
      smoothedVolume = 0;
      gameStage.classList.remove('hidden');
      gameSuccess.classList.add('hidden');
      blowFallback.classList.add('hidden');
      micHint.textContent = 'Izinkan akses mikrofon untuk meniup lilin';
      meterFill.style.width = '0%';
      flames.forEach((f) => f.classList.remove('is-out'));
      smokeLayer.innerHTML = '';
      celebParticles.innerHTML = '';
      candles.forEach((c) => { c.style.setProperty('--wobble', '0deg'); });
      flames.forEach((f) => {
        f.style.setProperty('--flame-scale', '1');
        f.style.setProperty('--flame-opacity', '1');
      });
    }

    function stopMicrophone() {
      if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
      }
      if (micStream) {
        micStream.getTracks().forEach((t) => t.stop());
        micStream = null;
      }
      if (audioContext) {
        audioContext.close().catch(() => {});
        audioContext = null;
      }
      analyser = null;
    }

    async function startMicrophone() {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        showFallback();
        return;
      }

      try {
        micStream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(micStream);
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512;
        analyser.smoothingTimeConstant = GAME_CONFIG.micSmoothing;
        source.connect(analyser);
        micHint.textContent = 'Nah, tiup lilinnya perlahan...';
        tickAudio();
      } catch {
        showFallback();
      }
    }

    function showFallback() {
      blowFallback.classList.remove('hidden');
      micHint.textContent = 'Mikrofon tidak tersedia — gunakan tombol di bawah';
    }

    function tickAudio() {
      if (!analyser || candlesOut) return;

      const timeData = new Uint8Array(analyser.fftSize);
      analyser.getByteTimeDomainData(timeData);

      let sum = 0;
      for (let i = 0; i < timeData.length; i++) {
        const v = (timeData[i] - 128) / 128;
        sum += v * v;
      }
      const rms = Math.sqrt(sum / timeData.length);
      smoothedVolume = smoothedVolume * 0.7 + rms * 0.3;

      updateFlames(smoothedVolume);

      if (smoothedVolume > GAME_CONFIG.blowThreshold) {
        if (!blowStartTime) blowStartTime = Date.now();
        if (Date.now() - blowStartTime >= GAME_CONFIG.blowDurationMs) {
          extinguishCandles();
          return;
        }
      } else {
        blowStartTime = null;
      }

      animationId = requestAnimationFrame(tickAudio);
    }

    function updateFlames(volume) {
      const intensity = Math.min(volume / GAME_CONFIG.blowThreshold, 1.5);
      const scale = 1 + intensity * 0.5;
      const wobble = intensity * 12;

      meterFill.style.width = `${Math.min(intensity * 100, 100)}%`;

      flames.forEach((flame, i) => {
        if (!flame.classList.contains('is-out')) {
          const offset = Math.sin(Date.now() / 100 + i) * 2;
          flame.style.setProperty('--flame-scale', scale + offset * 0.02);
        }
      });

      candles.forEach((candle, i) => {
        const dir = i % 2 === 0 ? 1 : -1;
        candle.style.setProperty('--wobble', `${wobble * dir * 0.4}deg`);
      });
    }

    function createSmoke() {
      for (let i = 0; i < 8; i++) {
        const puff = document.createElement('div');
        puff.className = 'smoke-puff';
        puff.style.left = `${40 + Math.random() * 40}%`;
        puff.style.animationDelay = `${i * 0.15}s`;
        smokeLayer.appendChild(puff);
      }
    }

    function createCelebration() {
      for (let i = 0; i < 20; i++) {
        const p = document.createElement('div');
        p.className = 'celeb-particle';
        p.style.left = `${20 + Math.random() * 60}%`;
        p.style.bottom = `${30 + Math.random() * 40}%`;
        p.style.animationDelay = `${Math.random() * 0.8}s`;
        celebParticles.appendChild(p);
      }
    }

    function extinguishCandles() {
      if (candlesOut) return;
      candlesOut = true;
      stopMicrophone();

      flames.forEach((flame) => flame.classList.add('is-out'));
      candles.forEach((c) => c.style.setProperty('--wobble', '0deg'));
      meterFill.style.width = '0%';
      createSmoke();
      createCelebration();

      setTimeout(() => {
        gameStage.classList.add('hidden');
        gameSuccess.classList.remove('hidden');
      }, 1800);
    }

    function simulateBlow() {
      if (candlesOut) return;
      let step = 0;
      const interval = setInterval(() => {
        step++;
        updateFlames(step * 0.12);
        if (step >= 4) {
          clearInterval(interval);
          extinguishCandles();
        }
      }, 50);
    }

    surpriseBtn.addEventListener('click', openGame);
    gameClose.addEventListener('click', closeGame);
    gameDoneBtn.addEventListener('click', closeGame);
    blowFallback.addEventListener('click', simulateBlow);

    gameOverlay.addEventListener('click', (e) => {
      if (e.target === gameOverlay.querySelector('.birthday-game__backdrop')) {
        closeGame();
      }
    });
  }

  /* ==================== SMOOTH SCROLL untuk anchor links ==================== */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener('click', (e) => {
        const targetId = anchor.getAttribute('href');
        if (targetId === '#') return;

        const target = document.querySelector(targetId);
        if (!target) return;

        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  /* ==================== INIT — Jalankan semua fitur ==================== */
  function init() {
    initLoading();
    initCollage();
    initCollageParallax();
    initCursorGlow();
    initParticles();
    initFloatingHearts();
    initScrollReveal();
    initLightbox();
    initMusic();
    initStars();
    initFinalHearts();
    initSmoothScroll();
    initPinterestGallery();
    initGalleryLock();
    initBirthdayGame();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
