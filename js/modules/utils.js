// utils.js — Utilidades compartidas de SoleStyle: formato, DOM, almacenamiento, toast y tarjetas de producto.

// Formatea un número como precio en pesos mexicanos: "$2,319".
export const formatPrice = (n) => '$' + n.toLocaleString('es-MX');

// Retrasa la ejecución de una función hasta que pasen `ms` sin nuevas llamadas.
export function debounce(fn, ms = 250) {
  let timer = null;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Atajo para querySelector con contexto opcional.
export function qs(sel, ctx = document) {
  return ctx.querySelector(sel);
}

// Atajo para querySelectorAll devolviendo un array real.
export function qsa(sel, ctx = document) {
  return Array.from(ctx.querySelectorAll(sel));
}

// Crea un elemento con clase y HTML interno opcionales.
export function createEl(tag, className = '', html = '') {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html) el.innerHTML = html;
  return el;
}

// Guarda un valor JSON en localStorage (silencioso si no está disponible).
export function saveLS(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    /* almacenamiento no disponible: no romper la app */
  }
}

// Lee y parsea un valor JSON de localStorage con respaldo.
export function loadLS(key, fallback = null) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    return fallback;
  }
}

// Nombres de eventos globales usados por toda la app.
export const EVENTS = {
  SCROLL: 'globalScroll',
  CART_CHANGED: 'cart:changed',
  FAVORITES_CHANGED: 'favorites:changed',
};

// Detecta si el usuario prefiere movimiento reducido.
export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

// Muestra un toast en #toast con auto-ocultado a los 3 segundos.
export function notify(msg, type = 'success') {
  const toast = qs('#toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.toggle('toast--error', type === 'error');
  toast.classList.add('is-visible');
  clearTimeout(notify._timer);
  notify._timer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

// Construye la tarjeta de producto completa (contrato §4/§7).
export function createProductCard(product, { list = false, showMoveToCart = false } = {}) {
  if (!product) return null;
  const card = createEl('article', 'product-card' + (list ? ' product-list' : ''));
  const price = product.discountPrice ?? product.price;

  // Media: imagen lazy, badge (Nuevo o -X%) y botón de favoritos.
  const media = createEl('div', 'product-card__media');
  const img = createEl('img', 'product-card__image');
  img.src = product.images[0];
  img.alt = product.name;
  img.loading = 'lazy';
  media.appendChild(img);

  if (product.isNew) {
    const badge = createEl('span', 'product-card__badge badge-new');
    badge.textContent = 'Nuevo';
    media.appendChild(badge);
  } else if (product.discountPrice) {
    const pct = Math.round((1 - product.discountPrice / product.price) * 100);
    const badge = createEl('span', 'product-card__badge badge-discount');
    badge.textContent = `-${pct}%`;
    media.appendChild(badge);
  }

  const favBtn = createEl('button', 'favorite-btn');
  favBtn.type = 'button';
  favBtn.dataset.favorite = String(product.id);
  favBtn.setAttribute('aria-label', 'Añadir a favoritos');
  favBtn.setAttribute('aria-pressed', 'false');
  favBtn.innerHTML = '<i data-lucide="heart"></i>';
  media.appendChild(favBtn);

  // Cuerpo: marca, nombre (link al detalle), precios y acciones.
  const body = createEl('div', 'product-card__body');
  const brand = createEl('p', 'product-card__brand');
  brand.textContent = product.brand;
  const nameWrap = createEl('h3', 'product-card__name');
  const link = createEl('a');
  link.href = `producto.html?id=${product.id}`;
  link.textContent = product.name;
  nameWrap.appendChild(link);
  const priceWrap = createEl('div', 'product-card__price');
  const priceNew = createEl('span', 'price-new');
  priceNew.textContent = formatPrice(price);
  priceWrap.appendChild(priceNew);
  if (product.discountPrice) {
    const priceOld = createEl('span', 'price-old');
    priceOld.textContent = formatPrice(product.price);
    priceWrap.appendChild(priceOld);
  }
  const addBtn = createEl('button', 'btn btn-primary btn-sm btn-add');
  addBtn.type = 'button';
  addBtn.dataset.addToCart = String(product.id);
  addBtn.textContent = 'Añadir al carrito';
  body.append(brand, nameWrap, priceWrap, addBtn);

  if (showMoveToCart) {
    const moveBtn = createEl('button', 'btn btn-outline btn-sm btn-move-to-cart');
    moveBtn.type = 'button';
    moveBtn.dataset.moveToCart = String(product.id);
    moveBtn.textContent = 'Mover al carrito';
    body.appendChild(moveBtn);
  }

  card.append(media, body);
  if (typeof lucide !== 'undefined') lucide.createIcons();
  return card;
}