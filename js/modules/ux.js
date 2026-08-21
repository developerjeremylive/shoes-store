// ux.js — UX core: modo oscuro, back-to-top, sticky header, shortcuts, offline, sync, skeleton, lightbox, sticky add-to-cart.
// Contrato §10.6: initUX() — detecta página y activa lo aplicable.

import { qs, qsa, createEl, EVENTS, prefersReducedMotion, notify, saveLS, loadLS } from './modules/utils.js';
import { cart } from './modules/cart.js';
import { favorites } from './modules/favorites.js';
import { getParam } from './modules/router.js';
import { getProductById } from './data/products.js';

// ---- MODO OSCURO ----

function initDarkMode() {
  const current = loadLS('solestyle_theme', null);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (current === 'dark' || (current === null && prefersDark)) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }

  // Crear botón de tema en el header.
  const headerInner = qs('.site-header__inner');
  if (!headerInner) return;

  const btn = createEl('button', 'ux-theme');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Cambiar tema');
  btn.innerHTML = document.documentElement.getAttribute('data-theme') === 'dark'
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';

  btn.addEventListener('click', () => {
    const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
    if (isDark) {
      document.documentElement.removeAttribute('data-theme');
      saveLS('solestyle_theme', 'light');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>';
    } else {
      document.documentElement.setAttribute('data-theme', 'dark');
      saveLS('solestyle_theme', 'dark');
      btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>';
    }
    window.dispatchEvent(new CustomEvent('theme:changed'));
  });

  // Insertar al inicio de las acciones del header.
  const headerActions = qs('.header-actions', headerInner);
  if (headerActions) {
    headerActions.insertBefore(btn, headerActions.firstChild);
  }
}

// ---- BACK-TO-TOP ----

function initBackToTop() {
  const btn = createEl('button', 'ux-top');
  btn.type = 'button';
  btn.setAttribute('aria-label', 'Volver arriba');
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>';
  document.body.appendChild(btn);

  const toggle = () => {
    btn.classList.toggle('is-visible', window.scrollY > 600);
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ---- STICKY HEADER ----

function initStickyHeader() {
  const header = qs('#siteHeader');
  if (!header) return;

  const toggle = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 10);
  };
  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

// ---- SHORTCUTS DE TECLADO ----

function initShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ignorar si el foco está en un input/textarea/select.
    const tag = e.target.tagName.toLowerCase();
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return;

    // "/" enfoca el buscador.
    if (e.key === '/') {
      e.preventDefault();
      const searchInput = qs('#searchInput');
      if (searchInput) searchInput.focus();
    }

    // "c" abre el carrito.
    if (e.key === 'c' || e.key === 'C') {
      const cartButton = qs('#cartButton');
      if (cartButton) cartButton.click();
    }
  });
}

// ---- OFFLINE ----

function initOffline() {
  window.addEventListener('offline', () => {
    notify('Sin conexión — los cambios se guardarán localmente', 'warning');
  });
  window.addEventListener('online', () => {
    notify('Conexión restaurada', 'success');
  });
}

// ---- SYNC ENTRE PESTAÑAS ----

function initSyncTabs() {
  window.addEventListener('storage', (e) => {
    if (e.key === 'solestyle_cart') cart.render();
    if (e.key === 'solestyle_favorites') favorites.render();
  });
}

// ---- SKELETON LOADERS (TIENDA) ----

function initSkeletons() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'tienda') return;

  const grid = qs('#productGrid');
  if (!grid || grid.children.length > 0) return;

  // Crear 8 skeletons.
  for (let i = 0; i < 8; i++) {
    const skeleton = createEl('div', 'ux-skeleton');
    skeleton.innerHTML = '<div class="ux-skeleton__image"></div><div class="ux-skeleton__text"></div><div class="ux-skeleton__text ux-skeleton__text--short"></div>';
    grid.appendChild(skeleton);
  }

  // Eliminar skeletons después de 400ms o al detectar .product-card.
  const cleanup = () => {
    const skeletons = qsa('.ux-skeleton', grid);
    skeletons.forEach(s => s.remove());
  };

  setTimeout(() => {
    if (grid.querySelector('.product-card')) cleanup();
    else cleanup();
  }, 400);

  // Observer por si se renderizan tarjetas después.
  const observer = new MutationObserver(() => {
    if (grid.querySelector('.product-card')) {
      cleanup();
      observer.disconnect();
    }
  });
  observer.observe(grid, { childList: true });
}

// ---- LIGHTBOX DE GALERÍA (PRODUCTO) ----

function initLightbox() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'producto') return;

  const mainImg = qs('#galleryMainImg');
  if (!mainImg) return;

  const id = parseInt(getParam('id'), 10);
  const product = getProductById(id);
  if (!product) return;

  // Crear overlay del lightbox.
  const overlay = createEl('div', 'ux-lightbox');
  overlay.innerHTML = `
    <div class="ux-lightbox__content">
      <button class="ux-lightbox__close" aria-label="Cerrar">&times;</button>
      <button class="ux-lightbox__prev" aria-label="Imagen anterior">&lsaquo;</button>
      <button class="ux-lightbox__next" aria-label="Imagen siguiente">&rsaquo;</button>
      <img class="ux-lightbox__image" src="" alt="">
    </div>
  `;
  document.body.appendChild(overlay);

  const lightboxImg = qs('.ux-lightbox__image', overlay);
  const closeBtn = qs('.ux-lightbox__close', overlay);
  const prevBtn = qs('.ux-lightbox__prev', overlay);
  const nextBtn = qs('.ux-lightbox__next', overlay);
  let currentIndex = 0;

  const openLightbox = (index) => {
    currentIndex = index;
    lightboxImg.src = product.images[index];
    lightboxImg.alt = `${product.name} imagen ${index + 1}`;
    overlay.classList.add('is-open');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    overlay.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  const navigate = (dir) => {
    currentIndex = (currentIndex + dir + product.images.length) % product.images.length;
    lightboxImg.src = product.images[currentIndex];
    lightboxImg.alt = `${product.name} imagen ${currentIndex + 1}`;
  };

  // Eventos.
  mainImg.addEventListener('click', () => openLightbox(0));
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', () => navigate(-1));
  if (nextBtn) nextBtn.addEventListener('click', () => navigate(1));
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeLightbox();
  });

  // Teclado.
  document.addEventListener('keydown', (e) => {
    if (!overlay.classList.contains('is-open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

// ---- STICKY ADD-TO-CART (PRODUCTO) ----

function initStickyAddToCart() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'producto') return;

  const addBtn = qs('#addToCartBtn');
  if (!addBtn) return;

  // Crear barra sticky.
  const sticky = createEl('div', 'ux-sticky-add');
  sticky.innerHTML = `
    <div class="ux-sticky-add__content">
      <span class="ux-sticky-add__price"></span>
      <button class="btn btn-primary btn-sm ux-sticky-add__btn">Añadir al carrito</button>
    </div>
  `;
  document.body.appendChild(sticky);

  const priceEl = qs('.ux-sticky-add__price', sticky);
  const stickyBtn = qs('.ux-sticky-add__btn', sticky);

  // Obtener precio del producto.
  const id = parseInt(getParam('id'), 10);
  const product = getProductById(id);
  if (product && priceEl) {
    priceEl.textContent = '$' + (product.discountPrice ?? product.price).toLocaleString('es-MX');
  }

  // Replica el click del botón original.
  if (stickyBtn) {
    stickyBtn.addEventListener('click', () => addBtn.click());
  }

  // Mostrar/ocultar basado en scroll.
  const toggle = () => {
    const rect = addBtn.getBoundingClientRect();
    const footer = qs('footer') || qs('.site-footer');
    const footerRect = footer ? footer.getBoundingClientRect() : null;
    const show = rect.bottom < 0 && (!footerRect || footerRect.top > window.innerHeight);
    sticky.classList.toggle('is-visible', show);
  };

  window.addEventListener('scroll', toggle, { passive: true });
  toggle();
}

// ---- EXPORT ----

export function initUX() {
  initDarkMode();
  initBackToTop();
  initStickyHeader();
  initShortcuts();
  initOffline();
  initSyncTabs();
  initSkeletons();
  initLightbox();
  initStickyAddToCart();
}
