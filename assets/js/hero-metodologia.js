/**
 * Phygo Metodologia Hero — Cinematic Enhancement
 * Effects: Ken Burns, duotone overlay, geometric wireframe lines, animated numbering
 * Budget: <20KB gzipped | 60fps target | Mobile + reduced-motion fallback
 */
(function () {
  'use strict';

  /* ---------- Feature detection ---------- */
  // Only TRUE mobile — narrow viewport (smartphone)
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReduced) {
    document.documentElement.classList.add('metodo-static');
    return;
  }

  /* ---------- Config ---------- */
  const CONFIG = {
    kenBurnsScaleStart: 1.0,
    kenBurnsScaleEnd: 1.12,
    kenBurnsDuration: 20, // seconds
    wireframeOpacity: 0.06,
    sectionStagger: 0.15,
  };

  /* ---------- Elements ---------- */
  const heroSection = document.querySelector('.metodo-hero');
  const visualSection = document.querySelector('.metodo-visual');

  /* ---------- Ken Burns on visual anchor ---------- */
  function initKenBurns() {
    if (!visualSection || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const img = visualSection.querySelector('.ken-burns-target');
    if (!img) return;

    gsap.registerPlugin(ScrollTrigger);

    // Slow zoom while scrolling through the section
    gsap.fromTo(img,
      { scale: CONFIG.kenBurnsScaleStart },
      {
        scale: CONFIG.kenBurnsScaleEnd,
        ease: 'none',
        scrollTrigger: {
          trigger: visualSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1,
        }
      }
    );
  }

  /* ---------- Geometric wireframe lines ---------- */
  function initWireframe() {
    if (!heroSection) return;

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'metodo-wireframe');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;overflow:visible;';

    // Create a perspective grid of lines
    const lines = [];
    const numHoriz = 6;
    const numVert = 8;

    // Horizontal lines with perspective
    for (let i = 0; i < numHoriz; i++) {
      const y = 10 + (i / numHoriz) * 80;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', '0');
      line.setAttribute('y1', String(y));
      line.setAttribute('x2', '100');
      line.setAttribute('y2', String(y));
      line.setAttribute('stroke', 'rgba(0, 55, 35, ' + CONFIG.wireframeOpacity + ')');
      line.setAttribute('stroke-width', '0.08');
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);
      lines.push({ el: line, type: 'h', idx: i });
    }

    // Vertical converging lines
    const vanishingX = 50;
    const vanishingY = 30;
    for (let i = 0; i < numVert; i++) {
      const xBottom = 5 + (i / (numVert - 1)) * 90;
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', String(vanishingX));
      line.setAttribute('y1', String(vanishingY));
      line.setAttribute('x2', String(xBottom));
      line.setAttribute('y2', '100');
      line.setAttribute('stroke', 'rgba(0, 55, 35, ' + (CONFIG.wireframeOpacity * 0.6) + ')');
      line.setAttribute('stroke-width', '0.06');
      line.setAttribute('vector-effect', 'non-scaling-stroke');
      svg.appendChild(line);
      lines.push({ el: line, type: 'v', idx: i });
    }

    // Set viewBox
    svg.setAttribute('viewBox', '0 0 100 100');
    heroSection.appendChild(svg);

    // Animate lines drawing in
    if (typeof gsap !== 'undefined') {
      lines.forEach((l, i) => {
        const length = l.el.getTotalLength ? l.el.getTotalLength() : 200;
        l.el.style.strokeDasharray = String(length);
        l.el.style.strokeDashoffset = String(length);

        gsap.to(l.el, {
          strokeDashoffset: 0,
          duration: 1.5,
          delay: 0.5 + i * 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: heroSection,
            start: 'top 80%',
            toggleActions: 'play none none reverse',
          }
        });
      });
    }
  }

  /* ---------- Animated section numbering ---------- */
  function initNumbering() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const numbers = document.querySelectorAll('.metodo-number');
    numbers.forEach((num) => {
      const target = parseInt(num.dataset.target, 10);
      if (isNaN(target)) return;

      const obj = { val: 0 };
      gsap.to(obj, {
        val: target,
        duration: 1.2,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: num,
          start: 'top 85%',
          toggleActions: 'play none none none',
        },
        onUpdate: function () {
          num.textContent = String(Math.floor(obj.val)).padStart(2, '0');
        }
      });
    });
  }

  /* ---------- Section reveals ---------- */
  function initSectionReveals() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const sections = document.querySelectorAll('.metodo-reveal');
    sections.forEach((sec) => {
      gsap.fromTo(sec,
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: sec,
            start: 'top 85%',
            toggleActions: 'play none none none',
          }
        }
      );
    });
  }

  /* ---------- Duotone shift on scroll for images ---------- */
  function initDuotoneShift() {
    const duotoneImages = document.querySelectorAll('.metodo-duotone');
    if (!duotoneImages.length || typeof gsap === 'undefined') return;

    duotoneImages.forEach((img) => {
      gsap.fromTo(img,
        { filter: 'grayscale(100%) brightness(0.9)' },
        {
          filter: 'grayscale(60%) brightness(1)',
          ease: 'none',
          scrollTrigger: {
            trigger: img,
            start: 'top bottom',
            end: 'center center',
            scrub: 1,
          }
        }
      );
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initKenBurns();
    initWireframe();
    initNumbering();
    initSectionReveals();
    initDuotoneShift();
  }

  // Cleanup
  document.addEventListener('pageTransitionOut', function () {
    // ScrollTrigger instances cleaned by transitions.js
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
