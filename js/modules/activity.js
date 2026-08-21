// activity.js — Vistos recientemente + aviso de stock para SoleStyle.
// Contrato §10.5: initRecentlyViewed() + initStockNotify()

import { qs, qsa, createEl, formatPrice, notify, EVENTS, saveLS, loadLS, createProductCard } from './utils.js';
import { getParam } from './router.js';
import { getProductById } from '../data/products.js';

// ---- RECIENTEMENTE VISTOS ----

// Registra un producto como visto recientemente.
function recordRecentlyViewed(productId) {
  if (!productId) return;
  const ids = loadLS('solestyle_recently_viewed', []);
  // Eliminar si ya existe para moverlo al frente.
  const filtered = ids.filter(id => id !== productId);
  // Insertar al inicio, máximo 8.
  filtered.unshift(productId);
  const trimmed = filtered.slice(0, 8);
  saveLS('solestyle_recently_viewed', trimmed);
  window.dispatchEvent(new CustomEvent(EVENTS.RECENTLY_CHANGED || 'recently:changed'));
}

// Renderiza la sección "Vistos recientemente" en la página home.
function renderRecentlyHome() {
  const ids = loadLS('solestyle_recently_viewed', []);
  if (!ids.length) return;

  // Evitar duplicar si ya existe.
  const existing = qs('#act-recently');
  if (existing) existing.remove();

  const section = createEl('section', 'section act-recently', '');
  section.id = 'act-recently';
  const container = createEl('div', 'container');
  const title = createEl('h2', 'section-title');
  title.textContent = 'Vistos recientemente';
  container.appendChild(title);
  const grid = createEl('div', 'product-grid');
  grid.id = 'act-recently-grid';
  ids.forEach(id => {
    const product = getProductById(id);
    if (product) grid.appendChild(createProductCard(product));
  });
  container.appendChild(grid);
  section.appendChild(container);

  // Insertar antes del footer o antes del newsletter si existen.
  const footer = qs('footer') || qs('.site-footer');
  const newsletter = qs('#newsletter') || qs('.newsletter');
  const insertBefore = newsletter || footer;
  if (insertBefore && insertBefore.parentNode) {
    insertBefore.parentNode.insertBefore(section, insertBefore);
  }
}

// Renderiza "Vistos recientemente" en la página producto (debajo de relatedGrid).
function renderRecentlyProduct(currentProductId) {
  const ids = loadLS('solestyle_recently_viewed', []);
  // Excluir el producto actual.
  const filtered = ids.filter(id => id !== currentProductId);
  if (!filtered.length) return;

  const existing = qs('#act-recently-product');
  if (existing) existing.remove();

  const section = createEl('section', 'section act-recently');
  section.id = 'act-recently-product';
  const title = createEl('h2', 'section-title');
  title.textContent = 'Vistos recientemente';
  section.appendChild(title);
  const grid = createEl('div', 'product-grid');
  grid.id = 'act-recently-product-grid';
  filtered.slice(0, 4).forEach(id => {
    const product = getProductById(id);
    if (product) grid.appendChild(createProductCard(product));
  });
  section.appendChild(grid);

  // Insertar después de #relatedGrid si existe, o al final de .product-detail.
  const relatedGrid = qs('#relatedGrid');
  const detail = qs('.product-detail') || qs('main');
  if (relatedGrid && relatedGrid.parentNode) {
    relatedGrid.parentNode.insertBefore(section, relatedGrid.nextSibling);
  } else if (detail) {
    detail.appendChild(section);
  }
}

// ---- AVISO DE STOCK ----

// Renderiza botones de "Avísame" para tallas sin stock.
function renderStockNotify(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const sizeSelector = qs('#sizeSelector');
  if (!sizeSelector) return;

  // Verificar si hay tallas sin stock.
  const disabledChips = qsa('.chip.is-disabled', sizeSelector);
  if (!disabledChips.length) return;

  // Evitar duplicar.
  const existing = qs('#act-notify-container');
  if (existing) existing.remove();

  const container = createEl('div', 'act-notify-container');
  container.id = 'act-notify-container';

  const btn = createEl('button', 'act-notify');
  btn.type = 'button';
  btn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg> Avísame cuando haya stock';
  container.appendChild(btn);

  // Mini modal con email.
  const modal = createEl('div', 'act-notify-modal');
  modal.innerHTML = `
    <div class="act-notify-modal__content">
      <h4>Avísame cuando haya stock</h4>
      <p>Ingresa tu email y te notificaremos cuando esté disponible.</p>
      <div class="act-notify-modal__form">
        <input type="email" class="act-notify-input" placeholder="tu@email.com" required>
        <button class="btn btn-primary btn-sm act-notify-submit" type="button">Notificarme</button>
      </div>
      <button class="act-notify-close" type="button" aria-label="Cerrar">&times;</button>
    </div>
  `;
  container.appendChild(modal);

  // Insertar después del sizeSelector.
  if (sizeSelector.parentNode) {
    sizeSelector.parentNode.insertBefore(container, sizeSelector.nextSibling);
  }

  // Eventos del modal.
  const openModal = () => modal.classList.add('is-open');
  const closeModal = () => modal.classList.remove('is-open');

  btn.addEventListener('click', openModal);
  const closeBtn = qs('.act-notify-close', modal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Enviar notificación.
  const submitBtn = qs('.act-notify-submit', modal);
  const emailInput = qs('.act-notify-input', modal);
  if (submitBtn && emailInput) {
    submitBtn.addEventListener('click', () => {
      const email = emailInput.value.trim();
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        notify('Ingresa un email válido', 'error');
        return;
      }
      // Obtener tallas sin stock.
      const outOfStockSizes = disabledChips.map(chip => parseInt(chip.dataset.size, 10)).filter(Boolean);
      const alerts = loadLS('solestyle_stock_alerts', []);
      alerts.push({
        productId,
        sizes: outOfStockSizes,
        email,
        date: new Date().toISOString()
      });
      saveLS('solestyle_stock_alerts', alerts);
      notify('Te avisaremos cuando haya stock', 'success');
      closeModal();
      emailInput.value = '';
    });
  }
}

// ---- EXPORTS ----

// Inicializa la funcionalidad de vistos recientemente.
export function initRecentlyViewed() {
  const page = qs('script[data-page]')?.dataset.page || 'home';

  if (page === 'home') {
    // Renderizar la sección de recientes.
    renderRecentlyHome();
    // Escuchar cambios para re-renderizar.
    window.addEventListener('recently:changed', renderRecentlyHome);
  }

  if (page === 'producto') {
    const id = parseInt(getParam('id'), 10);
    if (id) {
      // Registrar como visto.
      recordRecentlyViewed(id);
      // Renderizar la sección de recientes (excluyendo el actual).
      renderRecentlyProduct(id);
    }
  }
}

// Inicializa la funcionalidad de aviso de stock.
export function initStockNotify() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'producto') return;

  const id = parseInt(getParam('id'), 10);
  if (id) {
    renderStockNotify(id);
  }
}
