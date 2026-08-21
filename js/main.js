// main.js — Punto de entrada de SoleStyle: chrome global, scroll, delegación e init por página.

import { qs, qsa, createEl, EVENTS, prefersReducedMotion, notify, createProductCard, formatPrice } from './modules/utils.js';
import { cart } from './modules/cart.js';
import { favorites } from './modules/favorites.js';
import { FilterSystem } from './modules/filters.js';
import { GlobalSearch } from './modules/search.js';
import { getParam } from './modules/router.js';
import { getProductById, getFeaturedProducts, getRelatedProducts } from './data/products.js';
import { initScene as initCategoryCubes } from './three/category-cubes.js';
import { initScene as initShowcase, setShowcaseColor } from './three/product-showcase.js';
import { initScene as initTimeline } from './three/timeline-line.js';
import { initScene as initFooterWaves } from './three/footer-waves.js';
import { initCheckout } from './modules/checkout.js';
import { initRecentlyViewed, initStockNotify } from './modules/activity.js';
import { initUX } from './modules/ux.js';
import { initAnimations } from './modules/animations.js';

// Página actual desde el data-page del script (fallback: home).
const page = (document.currentScript && document.currentScript.dataset.page) || qs('script[data-page]')?.dataset.page || 'home';

// Iconos iniciales de lucide (global del CDN).
if (typeof lucide !== 'undefined') lucide.createIcons();

// Movimiento reducido: clase en <html> y sin escenas Three.
const reducedMotion = prefersReducedMotion();
if (reducedMotion) document.documentElement.classList.add('reduce-motion');

// Contador de bloqueos de scroll del body (menú, drawer, sidebar).
let bodyLockCount = 0;
let bodyLockY = 0;
function setBodyLock(locked) {
  bodyLockCount = Math.max(0, bodyLockCount + (locked ? 1 : -1));
  if (bodyLockCount > 0) {
    bodyLockY = window.scrollY;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    document.documentElement.style.overflow = 'hidden';
    document.body.style.position = 'fixed';
    document.body.style.top = `-${bodyLockY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.paddingRight = `${scrollbarWidth}px`;
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.position = '';
    document.body.style.top = '';
    document.body.style.left = '';
    document.body.style.right = '';
    document.body.style.paddingRight = '';
    window.scrollTo(0, bodyLockY);
  }
}

// ScrollManager: emite globalScroll con {scrollY, velocity} throttled por rAF.
class ScrollManager {
  constructor() {
    this.scrollY = window.scrollY;
    this.velocity = 0;
    this._lastY = this.scrollY;
    this._lastT = performance.now();
    this._raf = null;
    this._onScroll = () => {
      if (!this._raf) this._raf = requestAnimationFrame(() => this._tick());
    };
    window.addEventListener('scroll', this._onScroll, { passive: true });
    this._tick();
  }

  // Calcula velocidad por frame (~16.67ms) y despacha el evento.
  _tick() {
    this._raf = null;
    const y = window.scrollY;
    const now = performance.now();
    const dt = Math.max(now - this._lastT, 1);
    this.velocity = ((y - this._lastY) / dt) * 16.67;
    this.scrollY = y;
    this._lastY = y;
    this._lastT = now;
    window.dispatchEvent(new CustomEvent(EVENTS.SCROLL, { detail: { scrollY: y, velocity: this.velocity } }));
  }
}

// ---------- Chrome global ----------

cart.render();
favorites.render();
new ScrollManager();

// Menú móvil (hamburguesa).
const hamburger = qs('#hamburger');
const mobileMenu = qs('#mobileMenu');
function closeMobileMenu() {
  if (!mobileMenu) return;
  mobileMenu.classList.remove('is-open');
  if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  setBodyLock(false);
}
if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = mobileMenu.classList.toggle('is-open');
    hamburger.setAttribute('aria-expanded', String(open));
    setBodyLock(open);
  });
}

// Buscador global.
const searchToggle = qs('#searchToggle');
const searchBox = qs('#searchBox');
if (searchToggle && searchBox) {
  searchToggle.addEventListener('click', () => {
    const open = searchBox.classList.toggle('is-open');
    searchToggle.setAttribute('aria-expanded', String(open));
    if (open) qs('#searchInput')?.focus();
  });
}
new GlobalSearch(qs('#searchInput'), qs('#searchDropdown'));

// Drawer del carrito con focus trap básico.
const cartButton = qs('#cartButton');
const cartClose = qs('#cartClose');
const cartOverlay = qs('#cartOverlay');
const cartDrawer = qs('#cartDrawer');
let lastFocused = null;

function openCart() {
  if (!cartDrawer) return;
  lastFocused = document.activeElement;
  cartDrawer.classList.add('is-open');
  if (cartOverlay) cartOverlay.classList.add('is-open');
  setBodyLock(true);
  if (cartClose) cartClose.focus();
}
function closeCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove('is-open');
  if (cartOverlay) cartOverlay.classList.remove('is-open');
  setBodyLock(false);
  if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
}
if (cartButton) cartButton.addEventListener('click', openCart);
if (cartClose) cartClose.addEventListener('click', closeCart);
if (cartOverlay) cartOverlay.addEventListener('click', closeCart);
if (cartDrawer) {
  cartDrawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = qsa('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])', cartDrawer)
      .filter(el => el.offsetParent !== null);
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}

// Modal de compra completada.
const checkoutModal = qs('#checkoutModal');
const modalClose = qs('#modalClose');
function openModal() {
  if (checkoutModal) checkoutModal.classList.add('is-open');
}
function closeModal() {
  if (checkoutModal) checkoutModal.classList.remove('is-open');
}
if (modalClose) modalClose.addEventListener('click', closeModal);
if (checkoutModal) checkoutModal.addEventListener('click', (e) => { if (e.target === checkoutModal) closeModal(); });

// Checkout: solo si hay items y ninguno sin stock.
const checkoutBtn = qs('#checkoutBtn');
if (checkoutBtn) {
  checkoutBtn.addEventListener('click', () => {
    const items = cart.getItems();
    if (!items.length || items.some(i => cart.isOutOfStock(i))) return;
    openModal();
    cart.clear();
    notify('¡Gracias por tu compra!');
  });
}

// Escape cierra drawer, modal, menú móvil y sidebar de filtros.
document.addEventListener('keydown', (e) => {
  if (e.key !== 'Escape') return;
  closeCart();
  closeModal();
  closeMobileMenu();
  const sidebar = qs('#filtersSidebar');
  const overlay = qs('#filtersOverlay');
  const toggle = qs('#filtersToggle');
  if (sidebar && sidebar.classList.contains('is-open')) {
    sidebar.classList.remove('is-open');
    if (overlay) overlay.classList.remove('is-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    setBodyLock(false);
  }
});

// Delegación global de clics: añadir al carrito, favoritos y mover al carrito.
document.addEventListener('click', (e) => {
  const addBtn = e.target.closest('[data-add-to-cart]');
  if (addBtn) {
    const res = cart.add(parseInt(addBtn.dataset.addToCart, 10));
    notify(res.ok ? 'Producto añadido al carrito' : 'Sin stock disponible', res.ok ? 'success' : 'error');
    return;
  }
  const favBtn = e.target.closest('[data-favorite]');
  if (favBtn) {
    const now = favorites.toggle(parseInt(favBtn.dataset.favorite, 10));
    favorites.render();
    notify(now ? 'Añadido a favoritos' : 'Eliminado de favoritos');
    return;
  }
  const moveBtn = e.target.closest('[data-move-to-cart]');
  if (moveBtn) {
    const res = cart.add(parseInt(moveBtn.dataset.moveToCart, 10));
    if (res.ok) {
      favorites.remove(parseInt(moveBtn.dataset.moveToCart, 10));
      favorites.render();
      notify('Movido al carrito');
    } else {
      notify('Sin stock disponible', 'error');
    }
  }
});

// ---------- Inicialización por página ----------

function initHome() {
  if (!reducedMotion) {
    initCategoryCubes(qsa('.category-cube'));
    initShowcase(qs('#showcaseCanvas'), { productId: 1 });
    initTimeline(qs('#timelineCanvas'));
    initFooterWaves(qs('#footerWaves'));
  }

  // Info del producto destacado (id 1).
  const featured = getProductById(1);
  if (featured) {
    const nameEl = qs('#showcaseName');
    if (nameEl) nameEl.textContent = featured.name;
    const descEl = qs('#showcaseDesc');
    if (descEl) descEl.textContent = featured.description;
    const priceEl = qs('#showcasePrice');
    if (priceEl) priceEl.textContent = formatPrice(featured.discountPrice ?? featured.price);
  }

  // Swatches del showcase: cambian el color de la escena Three.
  qsa('.showcase .color-swatch').forEach(sw => {
    sw.addEventListener('click', () => {
      qsa('.showcase .color-swatch').forEach(s => s.classList.remove('is-active'));
      sw.classList.add('is-active');
      if (typeof setShowcaseColor === 'function') setShowcaseColor(sw.dataset.hex);
    });
  });

  // Rejilla de destacados.
  const featuredGrid = qs('#featuredGrid');
  if (featuredGrid) {
    getFeaturedProducts(4).forEach(p => featuredGrid.appendChild(createProductCard(p)));
  }

  // Newsletter con validación por regex.
  const newsletterForm = qs('#newsletterForm');
  if (newsletterForm) {
    newsletterForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = qs('#newsletterEmail')?.value.trim() || '';
      const msg = qs('#newsletterMsg');
      if (!msg) return;
      const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      msg.textContent = ok ? '¡Gracias por suscribirte!' : 'Ingresa un email válido';
      msg.classList.toggle('is-success', ok);
      msg.classList.toggle('is-error', !ok);
      clearTimeout(newsletterForm._timer);
      newsletterForm._timer = setTimeout(() => {
        msg.textContent = '';
        msg.classList.remove('is-success', 'is-error');
      }, 4000);
    });
  }

  // Carrusel de testimonios con wrap-around 0..2.
  const track = qs('.testimonial-track');
  const prevArrow = qs('.testimonial-arrow.prev');
  const nextArrow = qs('.testimonial-arrow.next');
  if (track && prevArrow && nextArrow) {
    let index = 0;
    const slides = qsa('.testimonial-slide', track).length;
    const go = (i) => {
      index = (i + slides) % slides;
      track.style.transform = `translateX(-${index * 100}%)`;
    };
    prevArrow.addEventListener('click', () => go(index - 1));
    nextArrow.addEventListener('click', () => go(index + 1));
  }
}

function initTienda() {
  const fs = new FilterSystem();
  fs.bind();
  fs.render();

  // Sidebar de filtros en móvil.
  const filtersToggle = qs('#filtersToggle');
  const filtersClose = qs('#filtersClose');
  const filtersOverlay = qs('#filtersOverlay');
  const filtersSidebar = qs('#filtersSidebar');
  const setFiltersOpen = (open) => {
    if (filtersSidebar) filtersSidebar.classList.toggle('is-open', open);
    if (filtersOverlay) filtersOverlay.classList.toggle('is-open', open);
    if (filtersToggle) filtersToggle.setAttribute('aria-expanded', String(open));
    setBodyLock(open);
  };
  if (filtersToggle) filtersToggle.addEventListener('click', () => setFiltersOpen(true));
  if (filtersClose) filtersClose.addEventListener('click', () => setFiltersOpen(false));
  if (filtersOverlay) filtersOverlay.addEventListener('click', () => setFiltersOpen(false));

  // Alternar vista cuadrícula/lista con persistencia en sessionStorage.
  const gridViewBtn = qs('#gridViewBtn');
  const listViewBtn = qs('#listViewBtn');
  const productGrid = qs('#productGrid');
  const applyView = (list) => {
    if (productGrid) productGrid.classList.toggle('list-view', list);
    if (gridViewBtn) gridViewBtn.classList.toggle('is-active', !list);
    if (listViewBtn) listViewBtn.classList.toggle('is-active', list);
    try {
      sessionStorage.setItem('solestyle_view', list ? 'list' : 'grid');
    } catch (err) {
      /* sessionStorage no disponible: silencioso */
    }
  };
  if (gridViewBtn) gridViewBtn.addEventListener('click', () => applyView(false));
  if (listViewBtn) listViewBtn.addEventListener('click', () => applyView(true));
  let savedView = 'grid';
  try {
    savedView = sessionStorage.getItem('solestyle_view') || 'grid';
  } catch (err) {
    /* sessionStorage no disponible: silencioso */
  }
  applyView(savedView === 'list');
}

function initProducto() {
  const id = parseInt(getParam('id'), 10);
  const product = getProductById(id);
  const detail = qs('.product-detail');
  if (!product || !detail) {
    // Producto inexistente: estado vacío con enlace a la tienda.
    if (detail) {
      detail.innerHTML = '';
      const empty = createEl('div', 'empty-state');
      empty.innerHTML = '<i data-lucide="search"></i><p>Producto no encontrado</p><a href="tienda.html" class="btn btn-primary">Ir a la tienda</a>';
      detail.appendChild(empty);
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
    return;
  }

  // Galería: imagen principal + 3 thumbs con fade.
  const mainImg = qs('#galleryMainImg');
  const thumbs = qs('#galleryThumbs');
  const setMainImage = (src) => {
    if (!mainImg) return;
    mainImg.classList.add('is-fading');
    mainImg.style.transition = 'opacity .15s ease';
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = src;
      mainImg.alt = product.name;
      mainImg.classList.remove('is-fading');
      mainImg.style.opacity = '1';
    }, 150);
  };
  if (mainImg) {
    mainImg.src = product.images[0];
    mainImg.alt = product.name;
  }
  if (thumbs) {
    product.images.forEach((imgSrc, i) => {
      const btn = createEl('button', 'thumb' + (i === 0 ? ' is-active' : ''));
      btn.type = 'button';
      btn.setAttribute('aria-label', `Ver imagen ${i + 1}`);
      const thumbImg = createEl('img');
      thumbImg.src = imgSrc;
      thumbImg.alt = `${product.name} imagen ${i + 1}`;
      thumbImg.loading = 'lazy';
      btn.appendChild(thumbImg);
      btn.addEventListener('click', () => {
        qsa('.thumb', thumbs).forEach(t => t.classList.remove('is-active'));
        btn.classList.add('is-active');
        setMainImage(imgSrc);
      });
      thumbs.appendChild(btn);
    });
  }

  // Info básica.
  const brandEl = qs('#productBrand');
  if (brandEl) brandEl.textContent = product.brand;
  const nameEl = qs('#productName');
  if (nameEl) nameEl.textContent = product.name;
  const descEl = qs('#productDescription');
  if (descEl) descEl.textContent = product.description;

  // Estrellas de rating + conteo de reseñas.
  const ratingEl = qs('#productRating');
  if (ratingEl) {
    ratingEl.innerHTML = '';
    const stars = createEl('span', 'stars');
    const full = Math.floor(product.rating);
    const half = product.rating - full >= 0.5 ? 1 : 0;
    for (let i = 0; i < 5; i++) {
      const icon = createEl('i');
      icon.setAttribute('data-lucide', i < full ? 'star' : (i === full && half ? 'star-half' : 'star'));
      stars.appendChild(icon);
    }
    ratingEl.appendChild(stars);
    const count = createEl('span');
    count.textContent = ` (${product.reviews} reseñas)`;
    ratingEl.appendChild(count);
  }

  // Precio: nuevo, anterior tachado y badge de ahorro.
  const priceNew = qs('#priceNew');
  const priceOld = qs('#priceOld');
  const saveBadge = qs('#saveBadge');
  if (priceNew) priceNew.textContent = formatPrice(product.discountPrice ?? product.price);
  if (product.discountPrice) {
    if (priceOld) {
      priceOld.textContent = formatPrice(product.price);
      priceOld.classList.remove('is-hidden');
    }
    if (saveBadge) {
      saveBadge.textContent = `-${Math.round((1 - product.discountPrice / product.price) * 100)}%`;
      saveBadge.classList.remove('is-hidden');
    }
  } else {
    if (priceOld) priceOld.classList.add('is-hidden');
    if (saveBadge) saveBadge.classList.add('is-hidden');
  }

  // Selector de tallas (chips deshabilitados sin stock para el color activo).
  const sizeSelector = qs('#sizeSelector');
  let selectedSize = null;
  let selectedColor = product.colors[0] ? product.colors[0].name : null;
  let qty = 1;

  const renderSizes = () => {
    if (!sizeSelector) return;
    sizeSelector.innerHTML = '';
    product.sizes.forEach(sz => {
      const chip = createEl('button', 'chip');
      chip.type = 'button';
      chip.textContent = String(sz);
      chip.dataset.size = String(sz);
      const stock = selectedColor ? (product.stock[`${sz}-${selectedColor}`] ?? 0) : 0;
      if (stock <= 0) {
        chip.classList.add('is-disabled');
        chip.setAttribute('aria-disabled', 'true');
        chip.disabled = true;
      }
      chip.setAttribute('aria-pressed', String(sz === selectedSize));
      if (sz === selectedSize) chip.classList.add('is-active');
      chip.addEventListener('click', () => {
        if (stock <= 0) return;
        selectedSize = sz;
        renderSizes();
      });
      sizeSelector.appendChild(chip);
    });
  };

  // Selector de colores: cambia imagen principal y re-renderiza tallas.
  const colorSelector = qs('#colorSelector');
  if (colorSelector) {
    product.colors.forEach(color => {
      const sw = createEl('button', 'swatch' + (color.name === selectedColor ? ' is-active' : ''));
      sw.type = 'button';
      sw.dataset.colorName = color.name;
      sw.dataset.hex = color.hex;
      sw.style.backgroundColor = color.hex;
      sw.setAttribute('aria-label', color.name);
      sw.addEventListener('click', () => {
        selectedColor = color.name;
        selectedSize = null;
        qsa('.swatch', colorSelector).forEach(s => s.classList.remove('is-active'));
        sw.classList.add('is-active');
        setMainImage(color.image);
        renderSizes();
      });
      colorSelector.appendChild(sw);
    });
  }
  renderSizes();

  // Cantidad 1..10.
  const qtyInput = qs('#qtyInput');
  const qtyMinus = qs('#qtyMinus');
  const qtyPlus = qs('#qtyPlus');
  const setQty = (v) => {
    qty = Math.min(10, Math.max(1, v));
    if (qtyInput) qtyInput.value = String(qty);
    if (qtyMinus) qtyMinus.disabled = qty <= 1;
  };
  if (qtyMinus) qtyMinus.addEventListener('click', () => setQty(qty - 1));
  if (qtyPlus) qtyPlus.addEventListener('click', () => setQty(qty + 1));
  if (qtyInput) qtyInput.addEventListener('change', () => setQty(parseInt(qtyInput.value, 10) || 1));
  setQty(1);

  // Añadir al carrito con talla/color/cantidad seleccionados.
  const addToCartBtn = qs('#addToCartBtn');
  if (addToCartBtn) {
    addToCartBtn.addEventListener('click', () => {
      const res = cart.add(product.id, selectedSize, selectedColor, qty);
      notify(res.ok ? 'Producto añadido al carrito' : 'Sin stock disponible', res.ok ? 'success' : 'error');
    });
  }

  // Botón de favoritos con texto alternante.
  const favoriteBtn = qs('#favoriteBtn');
  const updateFavoriteBtn = () => {
    if (!favoriteBtn) return;
    const active = favorites.has(product.id);
    favoriteBtn.classList.toggle('is-active', active);
    favoriteBtn.textContent = active ? 'En favoritos ✓' : 'Guardar en favoritos';
  };
  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
      favorites.toggle(product.id);
      favorites.render();
      updateFavoriteBtn();
    });
  }
  updateFavoriteBtn();

  // Tabs: clic y teclado (Enter/Espacio).
  const tabBtns = qsa('.tab-btn');
  const tabPanels = qsa('.tab-panel');
  const activateTab = (name) => {
    tabBtns.forEach(btn => {
      const active = btn.dataset.tab === name;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('is-active', panel.id === `tab${name.charAt(0).toUpperCase()}${name.slice(1)}`);
    });
  };
  tabBtns.forEach(btn => {
    const activate = () => activateTab(btn.dataset.tab);
    btn.addEventListener('click', activate);
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });
  activateTab('description');

  // Panel de especificaciones: tabla Upper/Suela/Peso.
  const specsPanel = qs('#tabSpecs');
  if (specsPanel && product.specs) {
    const table = createEl('table', 'spec-table');
    [['Upper', product.specs.upper], ['Suela', product.specs.sole], ['Peso', product.specs.weight]].forEach(([label, value]) => {
      const tr = createEl('tr');
      tr.innerHTML = `<td>${label}</td><td>${value}</td>`;
      table.appendChild(tr);
    });
    specsPanel.appendChild(table);
  }

  // Panel de opiniones: 3 reseñas mock.
  const reviewsPanel = qs('#tabReviews');
  if (reviewsPanel) {
    const mock = [
      { name: 'María González', date: '12 de mayo, 2026', rating: 5, text: `Excelente ${product.name}, muy cómodo y con buen agarre. Lo uso a diario.` },
      { name: 'Carlos Ramírez', date: '3 de abril, 2026', rating: 4, text: 'Muy buena calidad y la talla es exacta. Lo recomiendo ampliamente.' },
      { name: 'Lucía Fernández', date: '21 de marzo, 2026', rating: 5, text: 'El diseño es espectacular y llegó rapidísimo. Volveré a comprar.' },
    ];
    mock.forEach(r => {
      const item = createEl('div', 'review-item');
      const header = createEl('div', 'review-item__header');
      header.innerHTML = `<span class="review-item__name">${r.name}</span><span class="review-item__date">${r.date}</span>`;
      const stars = createEl('div', 'stars');
      stars.innerHTML = '<i data-lucide="star"></i>'.repeat(r.rating);
      const text = createEl('p');
      text.textContent = r.text;
      item.append(header, stars, text);
      reviewsPanel.appendChild(item);
    });
  }

  // Productos relacionados.
  const relatedGrid = qs('#relatedGrid');
  if (relatedGrid) {
    getRelatedProducts(product, 4).forEach(p => relatedGrid.appendChild(createProductCard(p)));
  }

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function initFavoritos() {
  favorites.render();
}

// Arranque según la página actual.
if (page === 'home') initHome();
else if (page === 'tienda') initTienda();
else if (page === 'producto') initProducto();
else if (page === 'favoritos') initFavoritos();

// Features v2: se inicializan en todas las páginas.
initCheckout();
initUX();
initAnimations();
if (page === 'home' || page === 'producto') initRecentlyViewed();
if (page === 'producto') initStockNotify();