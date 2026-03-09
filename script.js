/* =============================================
   CAFFÈ CONCERTO — script.js
   Animations, Slider, Tabs, Navbar scroll
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {

  /* ===== NAVBAR SCROLL ===== */
  const navbar = document.getElementById('navbar');
  const backToTop = document.getElementById('backToTop');

  const onScroll = () => {
    const y = window.scrollY;
    if (y > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    if (y > 400) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ===== BACK TO TOP ===== */
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  /* ===== MOBILE NAV TOGGLE ===== */
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  navToggle.addEventListener('click', () => {
    const isOpen = navLinks.classList.toggle('open');
    navToggle.setAttribute('aria-expanded', isOpen);
    // Animate burger to X
    const spans = navToggle.querySelectorAll('span');
    if (isOpen) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });

  // Close nav when a link is clicked
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    });
  });

  /* ===== SCROLL REVEAL ===== */
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => revealObserver.observe(el));

  /* ===== MENU TABS ===== */
  const tabBtns = document.querySelectorAll('.tab-btn');
  const menuPanels = document.querySelectorAll('.menu-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      tabBtns.forEach(b => b.classList.remove('active'));
      menuPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const panel = document.querySelector(`[data-panel="${target}"]`);
      if (panel) {
        panel.classList.add('active');
        panel.style.animation = 'none';
        requestAnimationFrame(() => {
          panel.style.animation = 'panelFadeIn 0.4s ease forwards';
        });
      }
    });
  });

  // Add panel fade animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes panelFadeIn {
      from { opacity: 0; transform: translateY(16px); }
      to { opacity: 1; transform: translateY(0); }
    }
    .menu-panel.active { animation: panelFadeIn 0.4s ease forwards; }
  `;
  document.head.appendChild(style);

  /* ===== TESTIMONIALS SLIDER ===== */
  const track = document.getElementById('testimonialsTrack');
  const cards = track ? track.querySelectorAll('.testimonial-card') : [];
  const dotsContainer = document.getElementById('sliderDots');
  const prevBtn = document.getElementById('sliderPrev');
  const nextBtn = document.getElementById('sliderNext');

  if (cards.length && track) {
    let current = 0;
    let perView = getPerView();
    let maxIndex = Math.max(0, cards.length - perView);
    let autoplayTimer = null;

    function getPerView() {
      if (window.innerWidth >= 900) return 3;
      if (window.innerWidth >= 600) return 2;
      return 1;
    }

    function buildDots() {
      dotsContainer.innerHTML = '';
      const count = Math.max(1, cards.length - perView + 1);
      for (let i = 0; i < count; i++) {
        const dot = document.createElement('button');
        dot.className = 'dot' + (i === current ? ' active' : '');
        dot.setAttribute('aria-label', `Slide ${i + 1}`);
        dot.addEventListener('click', () => goTo(i));
        dotsContainer.appendChild(dot);
      }
    }

    function updateDots() {
      document.querySelectorAll('.dot').forEach((d, i) => {
        d.classList.toggle('active', i === current);
      });
    }

    function getCardWidth() {
      const card = cards[0];
      const style = getComputedStyle(card);
      return card.offsetWidth + parseInt(style.marginLeft) + parseInt(style.marginRight);
    }

    function goTo(index) {
      current = Math.max(0, Math.min(index, maxIndex));
      const cardW = getCardWidth();
      track.style.transform = `translateX(-${current * cardW}px)`;
      updateDots();
    }

    function next() { goTo(current < maxIndex ? current + 1 : 0); }
    function prev() { goTo(current > 0 ? current - 1 : maxIndex); }

    prevBtn.addEventListener('click', () => { prev(); resetAutoplay(); });
    nextBtn.addEventListener('click', () => { next(); resetAutoplay(); });

    function startAutoplay() {
      autoplayTimer = setInterval(next, 5000);
    }
    function resetAutoplay() {
      clearInterval(autoplayTimer);
      startAutoplay();
    }

    function handleResize() {
      perView = getPerView();
      maxIndex = Math.max(0, cards.length - perView);
      current = Math.min(current, maxIndex);
      buildDots();
      goTo(current);
    }

    buildDots();
    startAutoplay();
    window.addEventListener('resize', handleResize);

    // Touch / swipe support
    let touchStartX = 0;
    track.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      const diff = touchStartX - e.changedTouches[0].clientX;
      if (Math.abs(diff) > 50) {
        diff > 0 ? next() : prev();
        resetAutoplay();
      }
    });
  }

  /* ===== SMOOTH ANCHOR LINKS with offset ===== */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const offset = 80;
        const top = target.getBoundingClientRect().top + window.scrollY - offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

  /* ===== GALLERY LIGHTBOX (simple) ===== */
  const galleryItems = document.querySelectorAll('.gallery-item');
  galleryItems.forEach(item => {
    item.addEventListener('click', () => {
      const img = item.querySelector('img');
      const caption = item.querySelector('.gallery-overlay span');
      if (!img) return;

      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        background:rgba(0,0,0,0.92); display:flex;
        align-items:center; justify-content:center;
        flex-direction:column; gap:16px; padding:24px;
        cursor:pointer; animation:fadeIn 0.3s ease;
      `;
      const lightboxStyle = document.createElement('style');
      lightboxStyle.textContent = '@keyframes fadeIn{from{opacity:0}to{opacity:1}}';
      document.head.appendChild(lightboxStyle);

      const lightImg = document.createElement('img');
      lightImg.src = img.src;
      lightImg.alt = img.alt;
      lightImg.style.cssText = `
        max-width:90vw; max-height:80vh;
        object-fit:contain; border-radius:8px;
        box-shadow:0 20px 60px rgba(0,0,0,0.5);
      `;

      const closeBtn = document.createElement('button');
      closeBtn.innerHTML = '&times;';
      closeBtn.style.cssText = `
        position:absolute; top:20px; right:28px;
        color:white; font-size:2.5rem; background:none;
        border:none; cursor:pointer; line-height:1;
        opacity:0.7; transition:opacity 0.2s;
      `;
      closeBtn.onmouseenter = () => closeBtn.style.opacity = '1';
      closeBtn.onmouseleave = () => closeBtn.style.opacity = '0.7';

      const label = document.createElement('p');
      label.textContent = caption ? caption.textContent : '';
      label.style.cssText = `
        color:rgba(200,169,106,0.9); font-family:'Playfair Display',serif;
        font-style:italic; font-size:1rem;
      `;

      overlay.appendChild(lightImg);
      overlay.appendChild(label);
      overlay.appendChild(closeBtn);
      document.body.appendChild(overlay);
      document.body.style.overflow = 'hidden';

      const close = () => {
        overlay.remove();
        lightboxStyle.remove();
        document.body.style.overflow = '';
      };
      closeBtn.addEventListener('click', e => { e.stopPropagation(); close(); });
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', function esc(e) {
        if (e.key === 'Escape') { close(); document.removeEventListener('keydown', esc); }
      });
    });
  });

  /* ===== ACTIVE NAV LINK ON SCROLL ===== */
  const sections = document.querySelectorAll('section[id]');
  const navLinkEls = document.querySelectorAll('.nav-link');

  const activeSectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinkEls.forEach(link => {
          link.classList.toggle('active', link.getAttribute('href') === `#${entry.target.id}`);
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(sec => activeSectionObserver.observe(sec));

});
