/**
 * Phygo — GSAP Page Transitions
 *
 * SOTA implementation:
 *  - Diagonal clip-path reveal (Phygo green) instead of brutal slide
 *  - REAL Phygo logo (white transparent) centered during overlay
 *  - Stagger entrance for hero/section headers (.gsap-reveal)
 *  - ScrollTrigger reveals for sections (.gsap-section)
 *  - prefers-reduced-motion honored via gsap.matchMedia()
 *  - SPA-feel without SPA — uses vanilla nav + sessionStorage handshake
 *  - Loading progress bar (top) for slow pages
 *  - Failsafe: if nav cancelled, auto-clears overlay
 */
(function () {
  'use strict';
  if (typeof gsap === 'undefined') {
    console.warn('[Phygo] GSAP not loaded — page transitions disabled');
    return;
  }

  // Brand
  const BRAND_DARK = '#003723';
  const BRAND_LIGHT = '#91d5b1';
  const LOGO_PATH = 'assets/logo-white-transparent.png';

  // ─── Build overlay DOM ───────────────────────────────────────────────────
  const overlay = document.createElement('div');
  overlay.id = 'phygo-pt-overlay';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.style.cssText = `
    position: fixed; inset: 0; z-index: 9998; pointer-events: none;
    background: ${BRAND_DARK};
    clip-path: polygon(0 0, 100% 0, 100% 0, 0 0);
    will-change: clip-path;
  `;

  // Real Phygo logo (white transparent)
  const logoWrap = document.createElement('div');
  logoWrap.style.cssText = `
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: translateY(20px) scale(0.92);
  `;
  const logoImg = document.createElement('img');
  logoImg.src = LOGO_PATH;
  logoImg.alt = 'Phygo';
  logoImg.style.cssText = `
    height: clamp(48px, 7vw, 84px); width: auto;
    filter: drop-shadow(0 4px 20px rgba(145, 213, 177, 0.25));
  `;
  // Fallback if image fails (e.g. relative path edge case)
  logoImg.onerror = () => {
    // Try absolute from origin
    if (!logoImg.dataset.fallbackTried) {
      logoImg.dataset.fallbackTried = '1';
      logoImg.src = '/assets/logo-white-transparent.png';
    }
  };
  logoWrap.appendChild(logoImg);
  overlay.appendChild(logoWrap);

  // Loading bar (separate, on top)
  const bar = document.createElement('div');
  bar.id = 'phygo-pt-bar';
  bar.style.cssText = `
    position: fixed; top: 0; left: 0; right: 0; height: 2px; z-index: 9999;
    background: linear-gradient(90deg, ${BRAND_LIGHT}, ${BRAND_DARK}, ${BRAND_LIGHT});
    transform: scaleX(0); transform-origin: left center;
    pointer-events: none; will-change: transform;
  `;

  document.body.appendChild(overlay);
  document.body.appendChild(bar);

  // ─── Reveal entrance — staggered hero/section headers ────────────────────
  function entranceAnimation() {
    const reveals = document.querySelectorAll('.gsap-reveal, h1, .hero-content > *');
    if (reveals.length === 0) return;
    gsap.set(reveals, { autoAlpha: 0, y: 24 });
    gsap.to(reveals, {
      autoAlpha: 1,
      y: 0,
      duration: 0.8,
      stagger: { each: 0.08, from: 'start' },
      ease: 'power3.out',
      delay: 0.15
    });
  }

  // ─── ScrollTrigger reveals ───────────────────────────────────────────────
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

  // ─── Transition state machine ─────────────────────────────────────────────
  let transitioning = false;

  function exitTo(url) {
    if (transitioning) return;
    transitioning = true;

    sessionStorage.setItem('phygo_pt_enter', '1');
    sessionStorage.setItem('phygo_pt_at', String(Date.now()));

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' }
    });

    // Diagonal sweep cover (top-left → bottom-right)
    tl.to(overlay, {
      clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
      duration: 0.55
    })
      .to(logoWrap, {
        autoAlpha: 1, y: 0, scale: 1,
        duration: 0.4,
        ease: 'back.out(1.4)'
      }, '-=0.3')
      .to(bar, { scaleX: 0.85, duration: 0.4, ease: 'power2.out' }, 0)
      .add(() => { window.location.href = url; });

    // Failsafe — if nav cancelled (back/blocked), reset after 1.5s
    setTimeout(() => {
      if (!transitioning) return;
      transitioning = false;
      gsap.set(overlay, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' });
      gsap.set(logoWrap, { autoAlpha: 0, y: 20, scale: 0.92 });
      gsap.set(bar, { scaleX: 0 });
    }, 1500);
  }

  function enterFromTransition() {
    // Coming from previous page — overlay starts covering, retract
    gsap.set(overlay, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' });
    gsap.set(logoWrap, { autoAlpha: 1, y: 0, scale: 1 });
    gsap.set(bar, { scaleX: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        gsap.set(overlay, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' });
        gsap.set(logoWrap, { autoAlpha: 0, y: 20, scale: 0.92 });
      }
    });

    tl.to(bar, { scaleX: 1.0, duration: 0.15, ease: 'none' })
      .to(logoWrap, {
        autoAlpha: 0, y: -10, scale: 0.95,
        duration: 0.3, ease: 'power2.in'
      }, '+=0.05')
      .to(overlay, {
        clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.55
      }, '-=0.15')
      .to(bar, { scaleX: 0, duration: 0.3, ease: 'power2.in' }, '-=0.3');
  }

  // ─── Wire up nav clicks ──────────────────────────────────────────────────
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented) return;
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
    const a = e.target.closest && e.target.closest('a');
    if (!a) return;
    if (a.target === '_blank' || a.hasAttribute('download')) return;
    const href = a.getAttribute('href');
    if (!href) return;
    if (/^(https?:|mailto:|tel:|javascript:|#)/i.test(href)) return;
    if (href.startsWith('#')) return;

    e.preventDefault();
    exitTo(href);
  });

  // ─── Main: matchMedia for reduced-motion ─────────────────────────────────
  const mm = gsap.matchMedia();
  mm.add(
    {
      reduceMotion: '(prefers-reduced-motion: reduce)',
      desktop: '(min-width: 768px)',
      mobile: '(max-width: 767px)'
    },
    (ctx) => {
      const { reduceMotion } = ctx.conditions;

      if (reduceMotion) {
        if (sessionStorage.getItem('phygo_pt_enter') === '1') {
          sessionStorage.removeItem('phygo_pt_enter');
        }
        return;
      }

      // Enter animation if coming from another page
      if (sessionStorage.getItem('phygo_pt_enter') === '1') {
        sessionStorage.removeItem('phygo_pt_enter');
        enterFromTransition();
      }

      // Setup entrance + scroll reveals
      requestAnimationFrame(() => {
        setTimeout(() => {
          entranceAnimation();
          setupScrollReveals();
        }, 50);
      });

      return () => {
        gsap.killTweensOf([overlay, logoWrap, bar, '.gsap-reveal', '.gsap-section', 'section', 'h1', '.hero-content > *']);
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.getAll().forEach(t => t.kill());
        }
      };
    }
  );
})();
