/* =============================================================
   SAFIR WEAR — Animation & Interaction Engine
   ============================================================= */

(function() {
  'use strict';

  /* ─── PRELOADER ─── */
  function initPreloader() {
    const preloader = document.querySelector('.preloader');
    if (!preloader) return;
    window.addEventListener('load', () => {
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.add('loaded');
        setTimeout(() => preloader.remove(), 900);
      }, 2200);
    });
  }

  /* ─── LENIS SMOOTH SCROLL ─── */
  let lenis;
  function initLenis() {
    if (typeof Lenis === 'undefined') return;
    lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      smoothWheel: true,
    });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    // Connect with GSAP ScrollTrigger if available
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => { lenis.raf(time * 1000); });
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* ─── CUSTOM CURSOR ─── */
  function initCursor() {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    const cursor = document.querySelector('.cursor');
    if (!cursor) return;
    let mouseX = -100, mouseY = -100, curX = -100, curY = -100;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursor.classList.add('visible');
    });
    document.addEventListener('mouseleave', () => cursor.classList.remove('visible'));
    document.addEventListener('mousedown', () => cursor.classList.add('clicking'));
    document.addEventListener('mouseup', () => cursor.classList.remove('clicking'));

    // Hover targets
    const hoverEls = 'a, button, .cat-card, .test-card, .port-case, .faq-question, .team-card, .value-card, .contact-card, input, textarea, select';
    document.querySelectorAll(hoverEls).forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hovering'));
    });

    function animate() {
      curX += (mouseX - curX) * 0.15;
      curY += (mouseY - curY) * 0.15;
      cursor.style.left = curX + 'px';
      cursor.style.top = curY + 'px';
      requestAnimationFrame(animate);
    }
    animate();
  }

  /* ─── NAVIGATION ─── */
  function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;

    // Scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      nav.classList.toggle('stuck', y > 30);

      // Hide/show nav on scroll direction
      if (y > 400) {
        if (y > lastScroll + 5) {
          nav.style.transform = 'translateY(-100%)';
        } else if (y < lastScroll - 5) {
          nav.style.transform = 'translateY(0)';
        }
      } else {
        nav.style.transform = 'translateY(0)';
      }
      lastScroll = y;
    }, { passive: true });

    nav.style.transition += ', transform .4s cubic-bezier(.22,1,.36,1)';
  }

  /* ─── HERO SLIDESHOW ─── */
  function initHeroSlider() {
    const hero = document.getElementById('hero');
    if (!hero) return;
    const slides = Array.from(hero.querySelectorAll('.hero-slide'));
    const dots = Array.from(hero.querySelectorAll('.hero-dot'));
    const idxEl = document.getElementById('heroIdx');
    const prevBtn = document.getElementById('heroPrev');
    const nextBtn = document.getElementById('heroNext');
    if (slides.length < 2) return;

    let cur = 0;
    let timer = null;
    const INTERVAL = 6000;

    function show(n) {
      n = (n + slides.length) % slides.length;
      if (n === cur) return;
      slides[cur].classList.remove('is-active');
      slides[cur].setAttribute('aria-hidden', 'true');
      dots[cur] && dots[cur].classList.remove('is-active');
      cur = n;
      slides[cur].classList.add('is-active');
      slides[cur].removeAttribute('aria-hidden');
      dots[cur] && dots[cur].classList.add('is-active');
      if (idxEl) idxEl.textContent = String(cur + 1).padStart(2, '0');
    }
    const next = () => show(cur + 1);
    const prev = () => show(cur - 1);

    function start() {
      stop();
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      timer = setInterval(next, INTERVAL);
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function restart() { stop(); start(); }

    nextBtn && nextBtn.addEventListener('click', () => { next(); restart(); });
    prevBtn && prevBtn.addEventListener('click', () => { prev(); restart(); });
    dots.forEach((d, i) => d.addEventListener('click', () => { show(i); restart(); }));

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    document.addEventListener('visibilitychange', () => {
      document.hidden ? stop() : start();
    });

    start();
  }

  /* ─── MOBILE MENU ─── */
  function initMobileMenu() {
    const burger = document.getElementById('burger');
    const mobMenu = document.getElementById('mobMenu');
    if (!burger || !mobMenu) return;

    burger.addEventListener('click', () => {
      burger.classList.toggle('open');
      mobMenu.classList.toggle('open');
      document.body.style.overflow = mobMenu.classList.contains('open') ? 'hidden' : '';
    });

    // Close on link click
    mobMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        burger.classList.remove('open');
        mobMenu.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ─── SCROLL REVEAL ─── */
  function initScrollReveal() {
    const els = document.querySelectorAll('.rv, .rv-scale, .rv-left, .rv-right');
    if (!els.length) return;

    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.06, rootMargin: '0px 0px -40px 0px' });

    els.forEach(el => obs.observe(el));
  }

  /* ─── GSAP SCROLL ANIMATIONS ─── */
  function initGSAPAnimations() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Hero slide content entrance is handled in CSS (.hero-slide.is-active).

    // Page hero entrance (inner pages)
    const pageHero = document.querySelector('.page-hero');
    if (pageHero) {
      const phChildren = pageHero.children;
      gsap.set(phChildren, { y: 30, opacity: 0 });
      gsap.to(phChildren, {
        y: 0, opacity: 1,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.1,
        delay: 2.4
      });
    }

    // Parallax images
    document.querySelectorAll('.parallax-wrap').forEach(wrap => {
      const img = wrap.querySelector('.parallax-img');
      if (!img) return;
      gsap.to(img, {
        yPercent: -15,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    });

    // Image reveals
    document.querySelectorAll('.img-reveal').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        onEnter: () => el.classList.add('revealed'),
        once: true
      });
    });

    // Text line reveals
    document.querySelectorAll('.split-line-inner').forEach(el => {
      ScrollTrigger.create({
        trigger: el.parentElement,
        start: 'top 85%',
        onEnter: () => el.classList.add('revealed'),
        once: true
      });
    });

    // Horizontal text scroll
    const horizText = document.querySelector('.horiz-text-inner');
    if (horizText) {
      gsap.to(horizText, {
        x: () => -(horizText.scrollWidth - window.innerWidth + 100),
        ease: 'none',
        scrollTrigger: {
          trigger: '.horiz-text',
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1
        }
      });
    }

    // Service cards stagger
    document.querySelectorAll('.svc-card').forEach((card, i) => {
      gsap.from(card, {
        y: 40, opacity: 0,
        duration: 0.7,
        delay: i * 0.08,
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Portfolio items
    document.querySelectorAll('.port-item').forEach((item, i) => {
      gsap.from(item, {
        y: 50, opacity: 0, scale: 0.96,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true
        }
      });
    });

    // Stat counters
    document.querySelectorAll('.brand-stat, .stat-box').forEach(box => {
      const numEl = box.querySelector('[data-target]:not([data-static])');
      if (!numEl) return;
      ScrollTrigger.create({
        trigger: box,
        start: 'top 85%',
        onEnter: () => countUp(numEl),
        once: true
      });
    });

    // Catalog cards stagger
    document.querySelectorAll('.cat-card').forEach((card, i) => {
      gsap.from(card, {
        y: 40, opacity: 0,
        duration: 0.7,
        delay: (i % 3) * 0.08,
        ease: 'power3.out',
        scrollTrigger: { trigger: card, start: 'top 90%', once: true }
      });
    });

    // Brand panels
    document.querySelectorAll('.brand-panel, .brand-feature').forEach((el, i) => {
      gsap.from(el, {
        y: 36, opacity: 0,
        duration: 0.8,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true }
      });
    });

    // Testimonial cards
    document.querySelectorAll('.test-card').forEach((card, i) => {
      gsap.from(card, {
        y: 40, opacity: 0, rotateX: 5,
        duration: 0.8,
        delay: i * 0.12,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Why features stagger
    document.querySelectorAll('.why-feat').forEach((feat, i) => {
      gsap.from(feat, {
        x: -30, opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: feat,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Portfolio cases
    document.querySelectorAll('.port-case').forEach((card, i) => {
      gsap.from(card, {
        y: 50, opacity: 0,
        duration: 0.8,
        delay: i * 0.08,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 88%',
          once: true
        }
      });
    });

    // Team cards
    document.querySelectorAll('.team-card').forEach((card, i) => {
      gsap.from(card, {
        y: 40, opacity: 0, scale: 0.95,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Value cards
    document.querySelectorAll('.value-card').forEach((card, i) => {
      gsap.from(card, {
        y: 30, opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Timeline items
    document.querySelectorAll('.timeline-item').forEach((item, i) => {
      gsap.from(item, {
        y: 40, opacity: 0,
        duration: 0.8,
        delay: i * 0.15,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 85%',
          once: true
        }
      });
    });

    // Contact cards
    document.querySelectorAll('.contact-card').forEach((card, i) => {
      gsap.from(card, {
        x: 30, opacity: 0,
        duration: 0.7,
        delay: i * 0.1,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: card,
          start: 'top 85%',
          once: true
        }
      });
    });
  }

  /* ─── COUNTER ANIMATION ─── */
  function countUp(el) {
    const target = parseInt(el.dataset.target);
    const suffix = el.dataset.suffix || '';
    const dur = 2000;
    let start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / dur, 1);
      const ease = 1 - Math.pow(1 - p, 4);
      el.textContent = Math.round(ease * target) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  /* ─── MAGNETIC BUTTONS ─── */
  function initMagnetic() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate(0, 0)';
      });
    });
  }

  /* ─── TILT EFFECT ON CARDS ─── */
  function initTilt() {
    if (window.matchMedia('(pointer: coarse)').matches) return;

    document.querySelectorAll('.tilt').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `perspective(600px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)';
        card.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1)';
      });
      card.addEventListener('mouseenter', () => {
        card.style.transition = 'none';
      });
    });
  }

  /* ─── FAQ ACCORDION ─── */
  function initAccordion() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.closest('.faq-item');
        const answer = item.querySelector('.faq-answer');
        const isOpen = item.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-item.open').forEach(openItem => {
          if (openItem !== item) {
            openItem.classList.remove('open');
            openItem.querySelector('.faq-answer').style.maxHeight = '0';
          }
        });

        // Toggle current
        item.classList.toggle('open');
        if (!isOpen) {
          answer.style.maxHeight = answer.scrollHeight + 'px';
        } else {
          answer.style.maxHeight = '0';
        }
      });
    });
  }

  /* ─── PORTFOLIO FILTER ─── */
  function initPortfolioFilter() {
    const filterBtns = document.querySelectorAll('.port-filter-btn');
    const filterGrid = document.getElementById('port-filter-grid');
    const items = filterGrid ? filterGrid.querySelectorAll('.port-case') : document.querySelectorAll('.port-case');
    if (!filterBtns.length || !items.length) return;

    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        // Update active state
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;
        items.forEach(item => {
          const cats = item.dataset.category || '';
          if (filter === 'all' || cats.includes(filter)) {
            item.classList.remove('hiding');
            item.classList.add('showing');
            item.style.display = '';
          } else {
            item.classList.add('hiding');
            item.classList.remove('showing');
            setTimeout(() => { item.style.display = 'none'; }, 400);
          }
        });
      });
    });
  }

  /* ─── CONTACT FORM ─── */
  function initContactForm() {
    const form = document.getElementById('contactForm');
    if (!form) return;

    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Basic validation
      let valid = true;
      form.querySelectorAll('[required]').forEach(input => {
        if (!input.value.trim()) {
          valid = false;
          input.style.borderColor = '#D44638';
          input.addEventListener('input', () => {
            input.style.borderColor = '';
          }, { once: true });
        }
      });

      // Email validation
      const emailInput = form.querySelector('input[type="email"]');
      if (emailInput && emailInput.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput.value)) {
        valid = false;
        emailInput.style.borderColor = '#D44638';
      }

      if (!valid) return;

      // Show success
      const formWrap = form.closest('.contact-form') || form;
      const success = document.querySelector('.form-success');
      if (success) {
        formWrap.style.display = 'none';
        success.classList.add('show');
      }
    });
  }

  /* ─── PAGE TRANSITIONS ─── */
  function initPageTransitions() {
    const overlay = document.querySelector('.page-transition');
    if (!overlay) return;

    // Reveal page on load
    overlay.classList.add('leaving');

    // Intercept internal links
    document.querySelectorAll('a[href]').forEach(a => {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:') ||
          href.startsWith('tel:') || href.startsWith('http') || a.target === '_blank') return;

      a.addEventListener('click', (e) => {
        e.preventDefault();
        overlay.classList.remove('leaving');
        overlay.classList.add('entering');
        setTimeout(() => {
          window.location.href = href;
        }, 500);
      });
    });
  }

  /* ─── ACTIVE NAV LINK ─── */
  function setActiveNav() {
    const path = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-links a').forEach(a => {
      const href = a.getAttribute('href');
      if (href === path || (path === 'index.html' && (href === '/' || href === 'index.html'))) {
        a.classList.add('active');
      }
    });
  }

  /* ─── INIT ─── */
  function init() {
    initPreloader();
    initLenis();
    initCursor();
    initNav();
    initHeroSlider();
    initMobileMenu();
    initScrollReveal();
    initGSAPAnimations();
    initMagnetic();
    initTilt();
    initAccordion();
    initPortfolioFilter();
    initContactForm();
    initPageTransitions();
    setActiveNav();
  }

  // Run when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
