// quickview.js — Vista rápida de productos.
// Contrato §10.2: initQuickView() — modal con info del producto y opción de añadir al carrito.

import { qs, qsa, createEl, formatPrice, notify } from './utils.js';
import { cart } from './cart.js';
import { getProductById } from '../data/products.js';

// ---- MODAL QUICKVIEW ----

function createQuickViewModal() {
  const existing = qs('#qv-modal');
  if (existing) return existing;

  const modal = createEl('div', 'qv-modal');
  modal.id = 'qv-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Vista rápida');
  modal.innerHTML = `
    <div class="qv-modal__content">
      <button class="qv-modal__close" aria-label="Cerrar">&times;</button>
      <div class="qv-modal__body">
        <div class="qv-modal__image">
          <img src="" alt="">
        </div>
        <div class="qv-modal__info">
          <p class="qv-modal__brand"></p>
          <h3 class="qv-modal__name"></h3>
          <div class="qv-modal__rating"></div>
          <div class="qv-modal__price"></div>
          <div class="qv-modal__sizes"></div>
          <div class="qv-modal__colors"></div>
          <div class="qv-modal__qty">
            <button class="btn btn-outline btn-sm qv-qty-minus" type="button">-</button>
            <input type="number" class="qv-qty-input" value="1" min="1" max="10">
            <button class="btn btn-outline btn-sm qv-qty-plus" type="button">+</button>
          </div>
          <div class="qv-modal__actions">
            <button class="btn btn-primary qv-add-btn" type="button">Añadir al carrito</button>
            <a class="btn btn-outline qv-detail-link" href="#">Ver detalles</a>
          </div>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// ---- RENDERIZADO DEL MODAL ----

function renderQuickView(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const modal = createQuickViewModal();
  const price = product.discountPrice ?? product.price;

  // Imagen.
  const imgEl = qs('.qv-modal__image img', modal);
  if (imgEl) {
    imgEl.src = product.images[0];
    imgEl.alt = product.name;
  }

  // Info básica.
  const brandEl = qs('.qv-modal__brand', modal);
  if (brandEl) brandEl.textContent = product.brand;
  const nameEl = qs('.qv-modal__name', modal);
  if (nameEl) nameEl.textContent = product.name;

  // Rating.
  const ratingEl = qs('.qv-modal__rating', modal);
  if (ratingEl) {
    const full = Math.floor(product.rating);
    const half = product.rating - full >= 0.5 ? 1 : 0;
    let starsHtml = '<span class="qv-stars">';
    for (let i = 0; i < 5; i++) {
      starsHtml += i < full ? '★' : (i === full && half ? '★' : '☆');
    }
    starsHtml += `</span><span class="qv-review-count">(${product.reviews})</span>`;
    ratingEl.innerHTML = starsHtml;
  }

  // Precio.
  const priceEl = qs('.qv-modal__price', modal);
  if (priceEl) {
    priceEl.innerHTML = `<span class="qv-price-new">${formatPrice(price)}</span>`;
    if (product.discountPrice) {
      priceEl.innerHTML += `<span class="qv-price-old">${formatPrice(product.price)}</span>`;
    }
  }

  // Tallas.
  const sizesEl = qs('.qv-modal__sizes', modal);
  let selectedSize = product.sizes[0] || null;
  if (sizesEl) {
    sizesEl.innerHTML = '<p class="qv-label">Talla:</p><div class="qv-size-chips"></div>';
    const chipsContainer = qs('.qv-size-chips', sizesEl);
    product.sizes.forEach(sz => {
      const chip = createEl('button', 'chip');
      chip.type = 'button';
      chip.textContent = String(sz);
      chip.dataset.size = String(sz);
      const stock = product.stock[`${sz}-${product.colors[0]?.name}`] ?? 0;
      if (stock <= 0) {
        chip.classList.add('is-disabled');
        chip.disabled = true;
      }
      if (sz === selectedSize) chip.classList.add('is-active');
      chip.addEventListener('click', () => {
        selectedSize = sz;
        qsa('.chip', chipsContainer).forEach(c => c.classList.remove('is-active'));
        chip.classList.add('is-active');
      });
      chipsContainer.appendChild(chip);
    });
  }

  // Colores.
  const colorsEl = qs('.qv-modal__colors', modal);
  let selectedColor = product.colors[0]?.name || null;
  if (colorsEl && product.colors.length > 1) {
    colorsEl.innerHTML = '<p class="qv-label">Color:</p><div class="qv-color-swatches"></div>';
    const swatchesContainer = qs('.qv-color-swatches', colorsEl);
    product.colors.forEach(color => {
      const swatch = createEl('button', 'swatch');
      swatch.type = 'button';
      swatch.style.backgroundColor = color.hex;
      swatch.setAttribute('aria-label', color.name);
      swatch.dataset.color = color.name;
      if (color.name === selectedColor) swatch.classList.add('is-active');
      swatch.addEventListener('click', () => {
        selectedColor = color.name;
        qsa('.swatch', swatchesContainer).forEach(s => s.classList.remove('is-active'));
        swatch.classList.add('is-active');
        // Actualizar imagen.
        if (imgEl) imgEl.src = color.image;
      });
      swatchesContainer.appendChild(swatch);
    });
  } else if (colorsEl) {
    colorsEl.innerHTML = '';
  }

  // Cantidad.
  const qtyInput = qs('.qv-qty-input', modal);
  const qtyMinus = qs('.qv-qty-minus', modal);
  const qtyPlus = qs('.qv-qty-plus', modal);
  let qty = 1;
  const setQty = (v) => {
    qty = Math.min(10, Math.max(1, v));
    if (qtyInput) qtyInput.value = String(qty);
  };
  if (qtyMinus) qtyMinus.addEventListener('click', () => setQty(qty - 1));
  if (qtyPlus) qtyPlus.addEventListener('click', () => setQty(qty + 1));
  if (qtyInput) qtyInput.addEventListener('change', () => setQty(parseInt(qtyInput.value, 10) || 1));
  setQty(1);

  // Link a detalles.
  const detailLink = qs('.qv-detail-link', modal);
  if (detailLink) detailLink.href = `producto.html?id=${product.id}`;

  // Botón añadir al carrito.
  const addBtn = qs('.qv-add-btn', modal);
  if (addBtn) {
    addBtn.onclick = () => {
      const res = cart.add(product.id, selectedSize, selectedColor, qty);
      notify(res.ok ? 'Producto añadido al carrito' : 'Sin stock disponible', res.ok ? 'success' : 'error');
      if (res.ok) closeModal();
    };
  }

  // Abrir modal.
  openModal(modal);
}

// ---- CONTROL DEL MODAL ----

function openModal(modal) {
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';
  const closeBtn = qs('.qv-modal__close', modal);
  if (closeBtn) closeBtn.focus();

  const close = () => closeModal(modal);
  closeBtn.onclick = close;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  const onKey = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}

function closeModal(modal) {
  modal.classList.remove('is-open');
  document.body.style.overflow = '';
}

// ---- DELEGACIÓN GLOBAL ----

function initQuickViewDelegation() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-quickview]');
    if (!btn) return;
    e.preventDefault();
    const id = parseInt(btn.dataset.quickview, 10);
    if (id) renderQuickView(id);
  });
}

// ---- INYECTAR BOTONES EN TARJETAS ----

function injectQuickViewButtons() {
  const cards = qsa('.product-card');
  cards.forEach(card => {
    if (card.querySelector('.qv-btn')) return;
    const addToCartBtn = card.querySelector('[data-add-to-cart]');
    if (!addToCartBtn) return;
    const productId = addToCartBtn.dataset.addToCart;
    const qvBtn = createEl('button', 'qv-btn');
    qvBtn.type = 'button';
    qvBtn.dataset.quickview = productId;
    qvBtn.setAttribute('aria-label', 'Vista rápida');
    qvBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>';
    addToCartBtn.parentNode.insertBefore(qvBtn, addToCartBtn.nextSibling);
  });
}

// Observer para inyectar botones en tarjetas nuevas.
function observeNewCards() {
  const grids = qsa('#productGrid, #featuredGrid, #relatedGrid, #favoritesGrid');
  grids.forEach(grid => {
    if (!grid) return;
    const observer = new MutationObserver(() => injectQuickViewButtons());
    observer.observe(grid, { childList: true });
  });
}

// ---- EXPORT ----

export function initQuickView() {
  initQuickViewDelegation();
  injectQuickViewButtons();
  observeNewCards();
}
