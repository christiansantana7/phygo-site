/**
 * Phygo Solucoes Hero — Cinematic Enhancement
 * Effects: parallax layers, capital flow particles, Ken Burns + duotone
 * Budget: <25KB gzipped | 60fps target | Mobile + reduced-motion fallback
 */
(function () {
  'use strict';

  /* ---------- Feature detection ---------- */
  // Only TRUE mobile — narrow viewport (smartphone)
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReduced) {
    document.documentElement.classList.add('solucoes-static');
    return;
  }

  /* ---------- Config ---------- */
  const CONFIG = {
    particleCount: 30,
    particleColor: '0, 55, 35',
    flowSpeed: 0.4,
    parallaxStrength: 40,
    kenBurnsScaleStart: 1.0,
    kenBurnsScaleEnd: 1.08,
  };

  /* ---------- Elements ---------- */
  const heroSection = document.querySelector('.solucoes-hero');
  const heroImage = document.querySelector('.solucoes-hero-img');

  /* ---------- Capital flow particles canvas ---------- */
  function initFlowParticles() {
    if (!heroSection) return;

    const canvas = document.createElement('canvas');
    canvas.className = 'solucoes-flow-canvas';
    canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;opacity:1;';
    heroSection.insertBefore(canvas, heroSection.firstChild);

    const ctx = canvas.getContext('2d', { alpha: true });
    let W, H, dpr;
    let particles = [];
    let rafId;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = heroSection.offsetWidth;
      H = heroSection.offsetHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      particles = [];
      for (let i = 0; i < CONFIG.particleCount; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          length: 20 + Math.random() * 60,
          speed: (0.3 + Math.random() * 0.5) * CONFIG.flowSpeed,
          opacity: 0.03 + Math.random() * 0.06,
          width: 0.5 + Math.random() * 0.8,
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Move horizontally (capital flow direction)
        p.x += p.speed;

        // Wrap around
        if (p.x > W + p.length) {
          p.x = -p.length;
          p.y = Math.random() * H;
        }

        // Draw flow line
        const grad = ctx.createLinearGradient(p.x, p.y, p.x + p.length, p.y);
        grad.addColorStop(0, `rgba(${CONFIG.particleColor}, 0)`);
        grad.addColorStop(0.3, `rgba(${CONFIG.particleColor}, ${p.opacity})`);
        grad.addColorStop(0.7, `rgba(${CONFIG.particleColor}, ${p.opacity})`);
        grad.addColorStop(1, `rgba(${CONFIG.particleColor}, 0)`);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x + p.length, p.y);
        ctx.strokeStyle = grad;
        ctx.lineWidth = p.width;
        ctx.stroke();
      }

      rafId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => { resize(); createParticles(); });

    // Cleanup
    document.addEventListener('pageTransitionOut', function () {
      if (rafId) cancelAnimationFrame(rafId);
    });
  }

  /* ---------- Parallax on hero image ---------- */
  function initParallax() {
    if (!heroImage || typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Parallax: image moves slower than scroll
    gsap.to(heroImage, {
      y: CONFIG.parallaxStrength,
      ease: 'none',
      scrollTrigger: {
        trigger: heroSection,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.8,
      }
    });
  }

  /* ---------- Ken Burns on hero image ---------- */
  function initKenBurns() {
    if (!heroImage || typeof gsap === 'undefined') return;

    gsap.fromTo(heroImage,
      { scale: CONFIG.kenBurnsScaleStart },
      {
        scale: CONFIG.kenBurnsScaleEnd,
        ease: 'none',
        scrollTrigger: {
          trigger: heroSection,
          start: 'top bottom',
          end: 'bottom top',
          scrub: 1.5,
        }
      }
    );
  }

  /* ---------- Text reveal entrance ---------- */
  function initTextReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    const tl = gsap.timeline({ delay: 0.2 });

    const label = heroSection.querySelector('.solucoes-label');
    if (label) {
      tl.fromTo(label,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        0
      );
    }

    const words = heroSection.querySelectorAll('.solucoes-word');
    if (words.length) {
      tl.fromTo(words,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: 'power2.out' },
        0.15
      );
    }

    const desc = heroSection.querySelector('.solucoes-desc');
    if (desc) {
      tl.fromTo(desc,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0.4
      );
    }

    // Scroll-based fade out
    gsap.to(heroSection.querySelector('.solucoes-content'), {
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: '+=50%',
        scrub: 0.5,
      },
      opacity: 0,
      y: -40,
      ease: 'none'
    });
  }

  /* ---------- Init ---------- */
  function init() {
    initFlowParticles();
    initParallax();
    initKenBurns();

    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        initTextReveal();
      });
    } else {
      setTimeout(initTextReveal, 500);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
