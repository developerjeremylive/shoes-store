// animations.js — Animaciones GSAP + CSS: announcement bar, stats, reveals, scroll progress, hero intro.
// Contrato §10.7: initAnimations() — detecta GSAP y aplica animaciones.

import { qs, qsa, createEl, prefersReducedMotion } from './utils.js';

// ---- ANNOUNCEMENT BAR (SOLO INDEX) ----

function initAnnouncementBar() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'home') return;

  // Evitar duplicar.
  if (qs('#an-announce')) return;

  const bar = createEl('div', 'an-announce');
  bar.id = 'an-announce';
  bar.innerHTML = `
    <div class="an-announce__track">
      <span class="an-announce__text">ENVÍO GRATIS en compras desde $2,000 &middot; Cupón SOLE10 10% OFF &middot; Cupón WELCOME $200 OFF</span>
      <span class="an-announce__text">ENVÍO GRATIS en compras desde $2,000 &middot; Cupón SOLE10 10% OFF &middot; Cupón WELCOME $200 OFF</span>
    </div>
  `;

  // Insertar al inicio de body.
  document.body.insertBefore(bar, document.body.firstChild);
}

// ---- SECCIÓN STATS (SOLO INDEX) ----

function initStatsSection() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'home') return;

  // Evitar duplicar.
  if (qs('#an-stats')) return;

  const statsData = [
    { value: '120+', label: 'Modelos' },
    { value: '40K+', label: 'Clientes' },
    { value: '4.9', label: 'Rating promedio' },
    { value: '8', label: 'Años de experiencia' }
  ];

  const section = createEl('section', 'an-stats');
  section.id = 'an-stats';
  const container = createEl('div', 'container');
  const grid = createEl('div', 'an-stats__grid');

  statsData.forEach(stat => {
    const item = createEl('div', 'an-stats__item');
    item.innerHTML = `
      <span class="an-stats__value" data-count="${stat.value}">0</span>
      <span class="an-stats__label">${stat.label}</span>
    `;
    grid.appendChild(item);
  });

  container.appendChild(grid);
  section.appendChild(container);

  // Insertar antes de testimonios.
  const testimonios = qs('#testimonios') || qs('.testimonials');
  if (testimonios && testimonios.parentNode) {
    testimonios.parentNode.insertBefore(section, testimonios);
  }
}

// ---- REVEALS SCROLLTRIGGER ----

function initReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (prefersReducedMotion()) return;

  gsap.registerPlugin(ScrollTrigger);

  const selectors = '[data-reveal], .section-title, .category-card, .product-card, .testimonial-slide, .footer-col';
  const elements = qsa(selectors);

  elements.forEach((el, i) => {
    const delayAttr = el.dataset.revealDelay;
    const delay = delayAttr ? parseFloat(delayAttr) : (i % 5) * 0.1;

    gsap.from(el, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 95%',
        once: true
      }
    });
  });
}

// ---- TIMELINE REVEALS (sección Nuestra Historia) ----

function initTimelineReveals() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (prefersReducedMotion()) return;

  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'home') return;

  const timeline = qs('#timeline') || qs('.timeline');
  if (!timeline) return;

  gsap.registerPlugin(ScrollTrigger);

  const milestones = qsa('.timeline-milestone', timeline);
  milestones.forEach((ms, i) => {
    gsap.from(ms, {
      opacity: 0,
      x: i % 2 === 0 ? -30 : 30,
      duration: 0.5,
      delay: i * 0.1,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: ms,
        start: 'top 90%',
        once: true
      }
    });
  });

  const timelineTitle = qs('.section-title', timeline.closest('.section'));
  if (timelineTitle) {
    gsap.from(timelineTitle, {
      y: 30,
      opacity: 0,
      duration: 0.6,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: timelineTitle,
        start: 'top 95%',
        once: true
      }
    });
  }
}

// ---- COUNT-UP STATS ----

function initCountUp() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  if (prefersReducedMotion()) return;

  gsap.registerPlugin(ScrollTrigger);

  const statsValues = qsa('.an-stats__value[data-count]');
  statsValues.forEach(el => {
    const raw = el.dataset.count;
    const suffix = raw.replace(/[\d.]/g, '');
    const target = parseFloat(raw);
    if (isNaN(target)) return;

    const obj = { val: 0 };
    gsap.to(obj, {
      val: target,
      duration: 2,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 80%',
        once: true
      },
      onUpdate: () => {
        if (suffix === 'K+') {
          el.textContent = Math.round(obj.val) + 'K+';
        } else if (suffix === '+') {
          el.textContent = Math.round(obj.val) + '+';
        } else if (raw.includes('.')) {
          el.textContent = obj.val.toFixed(1);
        } else {
          el.textContent = Math.round(obj.val);
        }
      }
    });
  });
}

// ---- SCROLL PROGRESS BAR ----

function initScrollProgress() {
  if (prefersReducedMotion()) return;

  const bar = createEl('div', 'an-progress');
  document.body.appendChild(bar);

  const update = () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = progress + '%';
  };

  window.addEventListener('scroll', update, { passive: true });
  update();
}

// ---- HERO INTRO (SOLO INDEX) ----

function initHeroIntro() {
  if (typeof gsap === 'undefined') return;
  if (prefersReducedMotion()) return;

  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'home') return;

  const hero = qs('#hero');
  const heroTitle = qs('.hero-title');
  const heroSubtitle = qs('.hero-subtitle');
  const heroCta = qs('.hero-cta');
  const heroEyebrow = qs('.hero .eyebrow');
  const heroScrollHint = qs('.hero-scroll-hint');

  if (!hero) return;

  // Elementos a animar con estado inicial oculto.
  const animElements = [heroEyebrow, heroTitle, heroSubtitle, heroCta, heroScrollHint].filter(Boolean);

  // Establecer estado inicial: invisibles.
  animElements.forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(40px)';
  });

  // Animar cuando la sección hero sea visible.
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // Hero visible → animar inmediatamente.
        animElements.forEach((el, i) => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            delay: i * 0.15,
            ease: 'power2.out'
          });
        });
        observer.disconnect();
      }
    });
  }, { threshold: 0.1 });

  observer.observe(hero);
}

// ---- AUTO-PLAY TESTIMONIOS (SOLO INDEX) ----

function initTestimonialsAutoplay() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'home') return;
  if (prefersReducedMotion()) return;

  const nextBtn = qs('.testimonial-arrow.next');
  if (!nextBtn) return;

  let interval = null;
  const start = () => {
    interval = setInterval(() => nextBtn.click(), 6000);
  };
  const stop = () => clearInterval(interval);

  // Pausar al hover.
  const container = qs('.testimonials') || nextBtn.closest('.testimonials');
  if (container) {
    container.addEventListener('mouseenter', stop);
    container.addEventListener('mouseleave', start);
  }

  start();
}

// ---- EXPORT ----

export function initAnimations() {
  initAnnouncementBar();
  initStatsSection();
  initReveals();
  initTimelineReveals();
  initCountUp();
  initScrollProgress();
  initHeroIntro();
  initTestimonialsAutoplay();
}
