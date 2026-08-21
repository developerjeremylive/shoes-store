// compare.js — Comparador de productos (hasta 4).
// Contrato §10.3: initCompare() — barra flotante + modal comparativo.

import { qs, qsa, createEl, formatPrice, notify } from './utils.js';
import { getProductById } from '../data/products.js';

const COMPARE_KEY = 'solestyle_compare';

// ---- STORAGE ----

function getCompare() {
  try {
    return JSON.parse(sessionStorage.getItem(COMPARE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveCompare(ids) {
  try {
    sessionStorage.setItem(COMPARE_KEY, JSON.stringify(ids));
  } catch {
    /* sessionStorage no disponible */
  }
  window.dispatchEvent(new CustomEvent('compare:changed'));
}

// ---- AÑADIR/QUITAR ----

function addToCompare(productId) {
  const ids = getCompare();
  if (ids.includes(productId)) {
    notify('Ya está en comparación', 'warning');
    return;
  }
  if (ids.length >= 4) {
    notify('Máximo 4 productos', 'error');
    return;
  }
  ids.push(productId);
  saveCompare(ids);
  notify('Añadido a comparación', 'success');
  renderBar();
}

function removeFromCompare(productId) {
  const ids = getCompare().filter(id => id !== productId);
  saveCompare(ids);
  renderBar();
}

// ---- BARRA FLOTANTE ----

function renderBar() {
  const ids = getCompare();
  const existing = qs('#cm-bar');

  if (ids.length < 2) {
    if (existing) existing.remove();
    return;
  }

  let bar = existing;
  if (!bar) {
    bar = createEl('div', 'cm-bar');
    bar.id = 'cm-bar';
    document.body.appendChild(bar);
  }

  const products = ids.map(id => getProductById(id)).filter(Boolean);
  bar.innerHTML = `
    <div class="cm-bar__content">
      <div class="cm-bar__chips">
        ${products.map(p => `
          <span class="cm-bar__chip">
            ${p.name}
            <button class="cm-bar__remove" data-cm-remove="${p.id}" aria-label="Quitar ${p.name}">&times;</button>
          </span>
        `).join('')}
      </div>
      <div class="cm-bar__actions">
        <button class="btn btn-primary btn-sm cm-compare-btn" ${products.length < 2 ? 'disabled' : ''}>Comparar ahora</button>
        <button class="btn btn-outline btn-sm cm-clear-btn">Limpiar</button>
      </div>
    </div>
  `;

  // Eventos.
  bar.querySelectorAll('[data-cm-remove]').forEach(btn => {
    btn.addEventListener('click', () => removeFromCompare(parseInt(btn.dataset.cmRemove, 10)));
  });

  const compareBtn = qs('.cm-compare-btn', bar);
  if (compareBtn) compareBtn.addEventListener('click', openCompareModal);

  const clearBtn = qs('.cm-clear-btn', bar);
  if (clearBtn) clearBtn.addEventListener('click', () => {
    saveCompare([]);
    renderBar();
  });
}

// ---- MODAL COMPARATIVO ----

function openCompareModal() {
  const ids = getCompare();
  const products = ids.map(id => getProductById(id)).filter(Boolean);
  if (products.length < 2) return;

  let modal = qs('#cm-modal');
  if (!modal) {
    modal = createEl('div', 'cm-modal');
    modal.id = 'cm-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'Comparar productos');
    document.body.appendChild(modal);
  }

  // Encontrar el más barato.
  const prices = products.map(p => p.discountPrice ?? p.price);
  const minPrice = Math.min(...prices);

  // Filas de comparación.
  const rows = [
    { label: 'Imagen', render: p => `<img src="${p.images[0]}" alt="${p.name}" class="cm-table-img">` },
    { label: 'Nombre', render: p => `<strong>${p.name}</strong>` },
    { label: 'Precio', render: p => {
      const price = p.discountPrice ?? p.price;
      const isBest = price === minPrice;
      return `<span class="${isBest ? 'cm-best' : ''}">${formatPrice(price)}</span>`;
    }},
    { label: 'Descuento', render: p => p.discountPrice ? `-${Math.round((1 - p.discountPrice / p.price) * 100)}%` : '—' },
    { label: 'Rating', render: p => `${p.rating} ★ (${p.reviews})` },
    { label: 'Categoría', render: p => p.category },
    { label: 'Colores', render: p => p.colors.map(c => c.name).join(', ') },
    { label: 'Tallas', render: p => p.sizes.join(', ') },
    { label: 'Especificaciones', render: p => {
      if (!p.specs) return '—';
      return Object.entries(p.specs).map(([k, v]) => `${k}: ${v}`).join('<br>');
    }}
  ];

  let tableHtml = '<table class="cm-table"><tbody>';
  rows.forEach(row => {
    tableHtml += `<tr><td class="cm-table__label">${row.label}</td>`;
    products.forEach(p => {
      tableHtml += `<td class="cm-table__cell">${row.render(p)}</td>`;
    });
    tableHtml += '</tr>';
  });
  tableHtml += '</tbody></table>';

  // Botones de añadir al carrito.
  let actionsHtml = '<div class="cm-table__actions">';
  products.forEach(p => {
    const firstSize = p.sizes[0] || null;
    actionsHtml += `<button class="btn btn-primary btn-sm cm-add-btn" data-cm-add="${p.id}" data-cm-size="${firstSize || ''}">Añadir al carrito</button>`;
  });
  actionsHtml += '</div>';

  modal.innerHTML = `
    <div class="cm-modal__content">
      <div class="cm-modal__header">
        <h2>Comparar productos</h2>
        <button class="cm-modal__close" aria-label="Cerrar">&times;</button>
      </div>
      <div class="cm-modal__body">
        ${tableHtml}
        ${actionsHtml}
      </div>
    </div>
  `;

  // Eventos.
  const closeBtn = qs('.cm-modal__close', modal);
  const close = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };
  if (closeBtn) closeBtn.onclick = close;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  // Añadir al carrito desde comparación.
  modal.querySelectorAll('.cm-add-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const { cmAdd, cmSize } = btn.dataset;
      const { cart } = window.__solestyle_cart || {};
      if (typeof cart !== 'undefined') {
        const res = cart.add(parseInt(cmAdd, 10), cmSize ? parseInt(cmSize, 10) : null);
        notify(res.ok ? 'Añadido al carrito' : 'Sin stock', res.ok ? 'success' : 'error');
      }
    });
  });

  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  const onKey = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}

// ---- DELEGACIÓN GLOBAL ----

function initCompareDelegation() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-compare]');
    if (!btn) return;
    e.preventDefault();
    const id = parseInt(btn.dataset.compare, 10);
    if (id) addToCompare(id);
  });
}

// ---- INYECTAR BOTONES EN TARJETAS ----

function injectCompareButtons() {
  const cards = qsa('.product-card');
  cards.forEach(card => {
    if (card.querySelector('.cm-btn')) return;
    const addToCartBtn = card.querySelector('[data-add-to-cart]');
    if (!addToCartBtn) return;
    const productId = addToCartBtn.dataset.addToCart;
    const cmBtn = createEl('button', 'cm-btn');
    cmBtn.type = 'button';
    cmBtn.dataset.compare = productId;
    cmBtn.setAttribute('aria-label', 'Comparar');
    cmBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>';
    addToCartBtn.parentNode.insertBefore(cmBtn, addToCartBtn.nextSibling);
  });
}

function observeNewCards() {
  const grids = qsa('#productGrid, #featuredGrid, #relatedGrid, #favoritesGrid');
  grids.forEach(grid => {
    if (!grid) return;
    const observer = new MutationObserver(() => injectCompareButtons());
    observer.observe(grid, { childList: true });
  });
}

// ---- EXPORT ----

export function initCompare() {
  initCompareDelegation();
  injectCompareButtons();
  observeNewCards();
  renderBar();
}
