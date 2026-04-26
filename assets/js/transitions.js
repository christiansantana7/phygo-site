/**
 * Phygo — GSAP Page Transitions
 *
 * SOTA implementation:
 *  - Diagonal clip-path reveal (Phygo green) instead of brutal slide
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
  const BG = '#f9f9f7';

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

  // Logo mark inside overlay (subtle)
  const mark = document.createElement('div');
  mark.style.cssText = `
    position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
    opacity: 0; transform: translateY(20px);
  `;
  mark.innerHTML = `
    <svg width="72" height="72" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="none" stroke="${BRAND_LIGHT}" stroke-width="2" stroke-dasharray="264" stroke-dashoffset="0" id="phygo-pt-ring"/>
      <text x="50" y="60" text-anchor="middle" font-family="'Newsreader', serif" font-style="italic" font-size="38" fill="${BRAND_LIGHT}">P</text>
    </svg>
  `;
  overlay.appendChild(mark);

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
  // Mark elements with class="gsap-reveal" and they animate on page enter
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

  // ─── ScrollTrigger reveals (if available) ────────────────────────────────
  function setupScrollReveals() {
    if (typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    // Sections with class="gsap-section" or just <section>
    const sections = document.querySelectorAll('.gsap-section, section:not(.no-reveal)');
    sections.forEach((sec) => {
      // Find direct text/card children to stagger
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
      .to(mark, { autoAlpha: 1, y: 0, duration: 0.3 }, '-=0.25')
      .to('#phygo-pt-ring', {
        strokeDashoffset: 264,
        duration: 0.6,
        ease: 'power2.inOut'
      }, '-=0.35')
      .to(bar, { scaleX: 0.85, duration: 0.4, ease: 'power2.out' }, 0)
      .add(() => { window.location.href = url; });

    // Failsafe — if nav cancelled (back/blocked), reset after 1.5s
    setTimeout(() => {
      if (!transitioning) return;
      transitioning = false;
      gsap.set(overlay, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' });
      gsap.set(mark, { autoAlpha: 0, y: 20 });
      gsap.set(bar, { scaleX: 0 });
    }, 1500);
  }

  function enterFromTransition() {
    // Coming from previous page — overlay starts covering, retract
    gsap.set(overlay, { clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' });
    gsap.set(mark, { autoAlpha: 1, y: 0 });
    gsap.set(bar, { scaleX: 1 });

    const tl = gsap.timeline({
      defaults: { ease: 'power3.inOut' },
      onComplete: () => {
        gsap.set(overlay, { clipPath: 'polygon(0 0, 100% 0, 100% 0, 0 0)' });
        gsap.set(mark, { autoAlpha: 0, y: 20 });
      }
    });

    tl.to(bar, { scaleX: 1.0, duration: 0.15, ease: 'none' })
      .to(mark, { autoAlpha: 0, y: -10, duration: 0.25 }, '+=0.05')
      .to(overlay, {
        clipPath: 'polygon(0 100%, 100% 100%, 100% 100%, 0 100%)',
        duration: 0.55
      }, '-=0.1')
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
    // Skip same-page anchors
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
        // Skip all animations — just instant nav
        // Still consume the sessionStorage flag so no overlay appears
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
      // Wait for fonts/layout to settle
      requestAnimationFrame(() => {
        setTimeout(() => {
          entranceAnimation();
          setupScrollReveals();
        }, 50);
      });

      return () => {
        gsap.killTweensOf([overlay, mark, bar, '.gsap-reveal', '.gsap-section', 'section', 'h1', '.hero-content > *']);
        if (typeof ScrollTrigger !== 'undefined') {
          ScrollTrigger.getAll().forEach(t => t.kill());
        }
      };
    }
  );

  // Cleanup on unload (good practice for SPA-style nav handlers)
  window.addEventListener('beforeunload', () => {
    // No need to mm.revert() — page will be destroyed
  });
})();
