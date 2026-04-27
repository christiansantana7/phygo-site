/**
 * Phygo Home Hero — Cinematic Enhancement
 * Effects: film grain canvas, particle field, mouse parallax, text reveal, scroll indicator
 * Budget: <30KB gzipped | 60fps target | Mobile + reduced-motion fallback
 */
(function () {
  'use strict';

  /* ---------- Feature detection ---------- */
  // Only TRUE mobile — narrow viewport (smartphone)
  const isMobile = window.matchMedia('(max-width: 640px)').matches;
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isMobile || prefersReduced) {
    // Static fallback: ensure content is visible immediately
    document.documentElement.classList.add('hero-static');
    return;
  }

  /* ---------- Config ---------- */
  const CONFIG = {
    grainOpacity: 0.035,
    grainSize: 1.5,
    particleCount: 45,
    particleBaseRadius: 1.2,
    particleColor: '0, 55, 35',
    mouseRadius: 120,
    mouseForce: 0.4,
    parallaxStrength: 8,
    textRevealDelay: 0.3,
    textRevealStagger: 0.08,
  };

  /* ---------- Elements ---------- */
  const heroSection = document.querySelector('.hero-wrapper');
  const videoWrap = document.querySelector('.hero-video-wrap');
  if (!heroSection) return;

  /* ---------- Canvas overlay (grain + particles) ---------- */
  const canvas = document.createElement('canvas');
  canvas.className = 'hero-fx-canvas';
  canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;opacity:1;';
  heroSection.insertBefore(canvas, heroSection.firstChild);

  const ctx = canvas.getContext('2d', { alpha: true });
  let W, H, dpr;
  let particles = [];
  let mouse = { x: -9999, y: -9999, vx: 0, vy: 0 };
  let lastMouse = { x: -9999, y: -9999 };
  let frame = 0;
  let rafId;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = heroSection.offsetWidth;
    H = heroSection.offsetHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------- Particles ---------- */
  function createParticles() {
    particles = [];
    for (let i = 0; i < CONFIG.particleCount; i++) {
      particles.push({
        x: Math.random() * W,
        y: Math.random() * H,
        ox: Math.random() * W,
        oy: Math.random() * H,
        r: CONFIG.particleBaseRadius + Math.random() * 0.8,
        vx: 0,
        vy: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.15 + Math.random() * 0.2,
      });
    }
  }

  /* ---------- Grain noise ---------- */
  function drawGrain() {
    const imageData = ctx.createImageData(Math.ceil(W / CONFIG.grainSize), Math.ceil(H / CONFIG.grainSize));
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = Math.random() * 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = CONFIG.grainOpacity * 255;
    }
    ctx.putImageData(imageData, 0, 0);
    // Stretch to fill
    if (CONFIG.grainSize > 1) {
      ctx.save();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    }
  }

  /* ---------- Draw frame ---------- */
  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Particles
    frame++;
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // Gentle orbital drift
      p.ox += Math.sin(frame * 0.003 + p.phase) * p.speed;
      p.oy += Math.cos(frame * 0.002 + p.phase) * p.speed;

      // Wrap
      if (p.ox < -20) p.ox = W + 20;
      if (p.ox > W + 20) p.ox = -20;
      if (p.oy < -20) p.oy = H + 20;
      if (p.oy > H + 20) p.oy = -20;

      // Mouse repulsion (subtle)
      const dx = p.x - mouse.x;
      const dy = p.y - mouse.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < CONFIG.mouseRadius && dist > 0) {
        const force = (CONFIG.mouseRadius - dist) / CONFIG.mouseRadius;
        p.vx += (dx / dist) * force * CONFIG.mouseForce;
        p.vy += (dy / dist) * force * CONFIG.mouseForce;
      }

      // Spring back to origin
      p.vx += (p.ox - p.x) * 0.02;
      p.vy += (p.oy - p.y) * 0.02;

      // Damping
      p.vx *= 0.94;
      p.vy *= 0.94;

      p.x += p.vx;
      p.y += p.vy;

      // Draw
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${CONFIG.particleColor}, ${0.15 + Math.sin(frame * 0.01 + p.phase) * 0.08})`;
      ctx.fill();
    }

    // Draw connecting lines for nearby particles (very subtle)
    ctx.strokeStyle = `rgba(${CONFIG.particleColor}, 0.04)`;
    ctx.lineWidth = 0.5;
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Grain overlay (every 2nd frame for performance)
    if (frame % 2 === 0) {
      drawGrain();
    }

    rafId = requestAnimationFrame(draw);
  }

  /* ---------- Mouse tracking ---------- */
  function onMouseMove(e) {
    const rect = heroSection.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    mouse.vx = x - lastMouse.x;
    mouse.vy = y - lastMouse.y;
    lastMouse.x = x;
    lastMouse.y = y;
    mouse.x = x;
    mouse.y = y;

    // Parallax on video
    if (videoWrap) {
      const px = ((x / W) - 0.5) * CONFIG.parallaxStrength;
      const py = ((y / H) - 0.5) * CONFIG.parallaxStrength;
      videoWrap.style.transform = `translate(${px}px, ${py}px) scale(1.05)`;
    }
  }

  function onMouseLeave() {
    mouse.x = -9999;
    mouse.y = -9999;
    if (videoWrap) {
      videoWrap.style.transform = 'translate(0, 0) scale(1)';
    }
  }

  /* ---------- Text reveal with GSAP ---------- */
  function initTextReveal() {
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

    gsap.registerPlugin(ScrollTrigger);

    // Hero entrance timeline
    const tl = gsap.timeline({ delay: 0.2 });

    // 1. Badge fade in
    const badge = heroSection.querySelector('.hero-badge');
    if (badge) {
      tl.fromTo(badge,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        0
      );
    }

    // 2. Headline word-by-word reveal
    const headlineWords = heroSection.querySelectorAll('.hero-headline-word');
    if (headlineWords.length) {
      tl.fromTo(headlineWords,
        { opacity: 0, y: 40, rotateX: -15 },
        {
          opacity: 1, y: 0, rotateX: 0,
          duration: 0.6,
          stagger: CONFIG.textRevealStagger,
          ease: 'power2.out'
        },
        CONFIG.textRevealDelay
      );
    }

    // 3. Subtitle
    const subtitle = heroSection.querySelector('.hero-subtitle');
    if (subtitle) {
      tl.fromTo(subtitle,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' },
        CONFIG.textRevealDelay + 0.3
      );
    }

    // 4. CTAs
    const ctaWrap = heroSection.querySelector('.hero-cta-wrap');
    if (ctaWrap) {
      tl.fromTo(ctaWrap,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' },
        CONFIG.textRevealDelay + 0.5
      );
    }

    // 5. Stats
    const statItems = heroSection.querySelectorAll('.hero-stat-item');
    if (statItems.length) {
      tl.fromTo(statItems,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: 0.6, stagger: 0.12, ease: 'power2.out' },
        CONFIG.textRevealDelay + 0.4
      );
    }

    // Scroll-based fade out for hero
    gsap.to(heroSection.querySelector('.hero-content'), {
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: '+=60%',
        scrub: 0.5,
      },
      opacity: 0,
      y: -60,
      ease: 'none'
    });
  }

  /* ---------- Scroll indicator ---------- */
  function initScrollIndicator() {
    const indicator = heroSection.querySelector('.hero-scroll-indicator');
    if (!indicator) return;

    // Fade in after text reveal
    gsap.fromTo(indicator,
      { opacity: 0 },
      { opacity: 1, duration: 1, delay: 1.5 }
    );

    // Hide on scroll
    gsap.to(indicator, {
      scrollTrigger: {
        trigger: heroSection,
        start: 'top top',
        end: '+=20%',
        scrub: true,
      },
      opacity: 0,
      ease: 'none'
    });

    // Bounce animation
    gsap.to(indicator.querySelector('.scroll-arrow'), {
      y: 8,
      duration: 1.2,
      repeat: -1,
      yoyo: true,
      ease: 'power1.inOut'
    });
  }

  /* ---------- Init ---------- */
  function init() {
    resize();
    createParticles();
    draw();

    heroSection.addEventListener('mousemove', onMouseMove, { passive: true });
    heroSection.addEventListener('mouseleave', onMouseLeave);
    window.addEventListener('resize', () => { resize(); createParticles(); });

    // Wait for fonts + GSAP
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        initTextReveal();
        initScrollIndicator();
      });
    } else {
      setTimeout(() => {
        initTextReveal();
        initScrollIndicator();
      }, 500);
    }
  }

  // Cleanup on page transition out
  document.addEventListener('pageTransitionOut', function () {
    if (rafId) cancelAnimationFrame(rafId);
    heroSection.removeEventListener('mousemove', onMouseMove);
    heroSection.removeEventListener('mouseleave', onMouseLeave);
  });

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
