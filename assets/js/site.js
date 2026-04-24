/* Phygo — site.js
   Comum a todas as páginas. Execução após DOMContentLoaded quando aplicável.
   Nenhum script inline — CSP script-src 'self' strict. */


// Mobile menu toggle
const menuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
const bar1 = document.getElementById('bar1');
const bar2 = document.getElementById('bar2');
const bar3 = document.getElementById('bar3');
let menuOpen = false;

if (menuBtn) {
  menuBtn.addEventListener('click', () => {
    menuOpen = !menuOpen;
    if (menuOpen) {
      mobileMenu.classList.remove('opacity-0', 'pointer-events-none');
      mobileMenu.classList.add('opacity-100');
      bar1.style.transform = 'rotate(45deg) translate(4px, 4px)';
      bar2.style.opacity = '0';
      bar3.style.transform = 'rotate(-45deg) translate(4px, -4px)';
      document.body.style.overflow = 'hidden';
    } else {
      mobileMenu.classList.add('opacity-0', 'pointer-events-none');
      mobileMenu.classList.remove('opacity-100');
      bar1.style.transform = '';
      bar2.style.opacity = '1';
      bar3.style.transform = '';
      document.body.style.overflow = '';
    }
  });
}



// ============================================================
// Scroll Reveal Animation
// ============================================================
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale, .stagger-children').forEach(el => {
    revealObserver.observe(el);
});

// ============================================================
// Counter Animation
// ============================================================
function animateCounter(element, target, suffix, prefix, duration) {
    let start = 0;
    const isFloat = target % 1 !== 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        // Ease out cubic
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.floor(eased * target);
        
        element.textContent = prefix + current.toLocaleString('pt-BR') + suffix;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = prefix + target.toLocaleString('pt-BR') + suffix;
        }
    }
    requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && !entry.target.dataset.counted) {
            entry.target.dataset.counted = 'true';
            const target = parseInt(entry.target.dataset.target);
            const suffix = entry.target.dataset.suffix || '';
            const prefix = entry.target.dataset.prefix || '';
            const duration = parseInt(entry.target.dataset.duration) || 2000;
            animateCounter(entry.target, target, suffix, prefix, duration);
            entry.target.classList.add('counter-glow');
        }
    });
}, { threshold: 0.5 });

document.querySelectorAll('[data-counter]').forEach(el => {
    counterObserver.observe(el);
});



// Cookie consent & Analytics loader (LGPD-compliant)
function loadGA() {
    if (localStorage.getItem('phygo_cookie_consent') !== 'accepted') return;
    var GA_ID = ''; // TODO: GA4 Measurement ID quando ativar analytics
    if (!GA_ID || GA_ID.indexOf('X') !== -1) return;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID);
}
function cookieAccept() {
    localStorage.setItem('phygo_cookie_consent', 'accepted');
    var el = document.getElementById('cookieBanner');
    if (el) el.style.display = 'none';
    loadGA();
}
function cookieDecline() {
    localStorage.setItem('phygo_cookie_consent', 'declined');
    var el = document.getElementById('cookieBanner');
    if (el) el.style.display = 'none';
}
(function() {
    var consent = localStorage.getItem('phygo_cookie_consent');
    if (consent === 'accepted') {
        loadGA();
    } else if (!consent) {
        setTimeout(function() {
            var el = document.getElementById('cookieBanner');
            if (!el) return;
            el.style.display = 'block';
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            setTimeout(function() {
                el.style.opacity = '1';
                el.style.transform = 'translateY(0)';
            }, 50);
        }, 1500);
    }
})();



/* =============================================================
   Event listeners (substituem handlers inline pra satisfazer CSP strict)
   ============================================================= */
document.addEventListener('DOMContentLoaded', function() {
    // --- Cookie banner buttons ---
    var decline = document.getElementById('cookie-decline');
    var accept  = document.getElementById('cookie-accept');
    if (decline) {
        decline.addEventListener('click', function(){ cookieDecline(); });
        decline.addEventListener('mouseover', function(){
            this.style.borderColor = 'rgba(249,249,247,0.3)';
            this.style.color = 'rgba(249,249,247,0.8)';
        });
        decline.addEventListener('mouseout', function(){
            this.style.borderColor = 'rgba(249,249,247,0.12)';
            this.style.color = 'rgba(249,249,247,0.5)';
        });
    }
    if (accept) {
        accept.addEventListener('click', function(){ cookieAccept(); });
        accept.addEventListener('mouseover', function(){ this.style.background = '#004d30'; });
        accept.addEventListener('mouseout',  function(){ this.style.background = '#003723'; });
    }

    // --- WhatsApp contact form (contato.html) ---
    var waForm = document.querySelector('form[data-wa-form="true"]');
    if (waForm) {
        waForm.addEventListener('submit', function(e){
            e.preventDefault();
            if (typeof sendToWhatsApp === 'function') sendToWhatsApp();
        });
    }
});
