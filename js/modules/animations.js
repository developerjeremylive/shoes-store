// animations.js — Animaciones GSAP + CSS: announcement bar, stats, reveals, scroll progress, hero intro.
// Contrato §10.7: initAnimations() — detecta GSAP y aplica animaciones.

import { qs, qsa, createEl, prefersReducedMotion } from './modules/utils.js';

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

  // Seleccionar elementos con data-reveal o selectores específicos.
  const selectors = '[data-reveal], .section-title, .category-card, .product-card, .testimonial-slide, .footer-col';
  const elements = qsa(selectors);

  elements.forEach((el, i) => {
    // Obtener delay personalizado o usar stagger.
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
        start: 'top 85%',
        once: true
      }
    });
  });
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

  const heroTitle = qs('.hero-title');
  const heroSubtitle = qs('.hero-subtitle');

  if (heroTitle) {
    gsap.from(heroTitle, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      ease: 'power2.out'
    });
  }
  if (heroSubtitle) {
    gsap.from(heroSubtitle, {
      y: 40,
      opacity: 0,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out'
    });
  }
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
  initCountUp();
  initScrollProgress();
  initHeroIntro();
  initTestimonialsAutoplay();
}
