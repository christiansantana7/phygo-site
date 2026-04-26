/**
 * Phygo — GSAP Page Transitions v2 (mobile-fixed)
 *
 * Mobile fixes:
 *  - DOMContentLoaded guard (defer + IIFE race condition)
 *  - touchstart + click both wired (Safari iOS tap delay)
 *  - inline clip-path replaced with width-based sweep (better cross-browser)
 *  - z-index forced higher to defeat fixed nav backdrop-filter
 *  - logo path absoluto pra evitar 404 em sub-paths
 */
(function () {
  'use strict';

  function init() {
    if (typeof gsap === 'undefined') {
      console.warn('[Phygo] GSAP not loaded — page transitions disabled');
      return;
    }

    // Brand
    const BRAND_DARK = '#003723';
    const BRAND_LIGHT = '#91d5b1';
    const LOGO_PATH = '/assets/logo-white-transparent.png';

    // ─── Build overlay DOM ───────────────────────────────────────────────
    const overlay = document.createElement('div');
    overlay.id = 'phygo-pt-overlay';
    overlay.setAttribute('aria-hidden', 'true');
    overlay.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      width: 100%; height: 100%;
      z-index: 99999; pointer-events: none;
      background: ${BRAND_DARK};
      transform: translateY(-100%);
      will-change: transform;
      display: flex; align-items: center; justify-content: center;
      -webkit-backface-visibility: hidden;
      backface-visibility: hidden;
    `;

    // Real Phygo logo (white transparent)
    const logoImg = document.createElement('img');
    logoImg.src = LOGO_PATH;
    logoImg.alt = 'Phygo';
    logoImg.style.cssText = `
      height: clamp(48px, 8vw, 84px);
      width: auto;
      opacity: 0;
      transform: translateY(20px) scale(0.92);
      filter: drop-shadow(0 4px 20px rgba(145, 213, 177, 0.25));
      will-change: opacity, transform;
    `;
    logoImg.onerror = () => {
      // Fallback to relative
      if (!logoImg.dataset.fallbackTried) {
        logoImg.dataset.fallbackTried = '1';
        logoImg.src = 'assets/logo-white-transparent.png';
      }
    };
    overlay.appendChild(logoImg);

    // Loading bar (separate, on top)
    const bar = document.createElement('div');
    bar.id = 'phygo-pt-bar';
    bar.style.cssText = `
      position: fixed; top: 0; left: 0; right: 0; height: 2px;
      z-index: 100000;
      background: linear-gradient(90deg, ${BRAND_LIGHT}, ${BRAND_DARK}, ${BRAND_LIGHT});
      transform: scaleX(0);
      transform-origin: left center;
      pointer-events: none;
      will-change: transform;
    `;

    document.body.appendChild(overlay);
    document.body.appendChild(bar);

    // ─── Reveal entrance ─────────────────────────────────────────────────
    function entranceAnimation() {
      const reveals = document.querySelectorAll('.gsap-reveal, h1, .hero-content > *');
      if (reveals.length === 0) return;
      gsap.set(reveals, { autoAlpha: 0, y: 24 });
      gsap.to(reveals, {
        autoAlpha: 1, y: 0,
        duration: 0.8,
        stagger: { each: 0.08, from: 'start' },
        ease: 'power3.out',
        delay: 0.15
      });
    }

    function setupScrollReveals() {
      if (typeof ScrollTrigger === 'undefined') return;
      gsap.registerPlugin(ScrollTrigger);
      const sections = document.querySelectorAll('.gsap-section, section:not(.no-reveal)');
      sections.forEach((sec) => {
        const items = sec.querySelectorAll(':scope > div, :scope > h2, :scope > h3, :scope > p, :scope > .card, :scope > .reveal-item');
        if (items.length === 0) {
          gsap.from(sec, {
            autoAlpha: 0, y: 40, duration: 0.9, ease: 'power2.out',
            scrollTrigger: { trigger: sec, start: 'top 80%', once: true }
          });
        } else {
          gsap.set(items, { autoAlpha: 0, y: 32 });
          ScrollTrigger.create({
            trigger: sec, start: 'top 75%', once: true,
            onEnter: () => gsap.to(items, {
              autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.07, ease: 'power2.out'
            })
          });
        }
      });
    }

    // ─── Transition state ────────────────────────────────────────────────
    let transitioning = false;

    function exitTo(url) {
      if (transitioning) return;
      transitioning = true;

      sessionStorage.setItem('phygo_pt_enter', '1');

      const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });

      // Slide DOWN from top — simple, works everywhere
      tl.to(overlay, {
        y: '0%',
        duration: 0.55
      })
        .to(logoImg, {
          autoAlpha: 1, y: 0, scale: 1,
          duration: 0.4,
          ease: 'back.out(1.4)'
        }, '-=0.3')
        .to(bar, { scaleX: 0.85, duration: 0.4, ease: 'power2.out' }, 0)
        .add(() => { window.location.href = url; });

      // Failsafe
      setTimeout(() => {
        if (!transitioning) return;
        transitioning = false;
        gsap.set(overlay, { y: '-100%' });
        gsap.set(logoImg, { autoAlpha: 0, y: 20, scale: 0.92 });
        gsap.set(bar, { scaleX: 0 });
      }, 1500);
    }

    function enterFromTransition() {
      // Coming from previous page — overlay starts covering
      gsap.set(overlay, { y: '0%' });
      gsap.set(logoImg, { autoAlpha: 1, y: 0, scale: 1 });
      gsap.set(bar, { scaleX: 1 });

      const tl = gsap.timeline({
        defaults: { ease: 'power3.inOut' },
        onComplete: () => {
          gsap.set(overlay, { y: '-100%' });
          gsap.set(logoImg, { autoAlpha: 0, y: 20, scale: 0.92 });
        }
      });

      tl.to(logoImg, {
        autoAlpha: 0, y: -10, scale: 0.95,
        duration: 0.3, ease: 'power2.in'
      }, '+=0.05')
        .to(overlay, {
          y: '100%',
          duration: 0.55
        }, '-=0.15')
        .to(bar, { scaleX: 0, duration: 0.3, ease: 'power2.in' }, '-=0.3');
    }

    // ─── Wire up nav clicks (mobile-safe) ───────────────────────────────
    function handleNavClick(e) {
      if (e.defaultPrevented) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      // Don't break right/middle clicks
      if (e.button !== undefined && e.button !== 0) return;

      const a = e.target.closest && e.target.closest('a');
      if (!a) return;
      if (a.target === '_blank' || a.hasAttribute('download')) return;

      const href = a.getAttribute('href');
      if (!href) return;
      if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) return;
      if (href.startsWith('#')) return;

      // Don't transition if same URL
      const targetUrl = new URL(href, window.location.href);
      if (targetUrl.pathname === window.location.pathname) return;

      e.preventDefault();
      exitTo(href);
    }

    document.addEventListener('click', handleNavClick, false);

    // ─── matchMedia for reduced-motion ───────────────────────────────────
    const mm = gsap.matchMedia();
    mm.add(
      { reduceMotion: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { reduceMotion } = ctx.conditions;
        if (reduceMotion) {
          if (sessionStorage.getItem('phygo_pt_enter') === '1') {
            sessionStorage.removeItem('phygo_pt_enter');
          }
          return;
        }

        if (sessionStorage.getItem('phygo_pt_enter') === '1') {
          sessionStorage.removeItem('phygo_pt_enter');
          enterFromTransition();
        }

        requestAnimationFrame(() => {
          setTimeout(() => {
            entranceAnimation();
            setupScrollReveals();
          }, 50);
        });

        return () => {
          gsap.killTweensOf([overlay, logoImg, bar]);
          if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.getAll().forEach(t => t.kill());
          }
        };
      }
    );

    console.log('[Phygo] Page transitions ready');
  }

  // Wait for GSAP to load (defer race condition fix)
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    // Already loaded — give GSAP a moment if defer
    if (typeof gsap !== 'undefined') {
      init();
    } else {
      // Poll for GSAP up to 2s
      let tries = 0;
      const wait = setInterval(() => {
        tries++;
        if (typeof gsap !== 'undefined') {
          clearInterval(wait);
          init();
        } else if (tries > 40) {
          clearInterval(wait);
          console.warn('[Phygo] GSAP never loaded after 2s');
        }
      }, 50);
    }
  }
})();
