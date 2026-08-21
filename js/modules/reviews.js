// reviews.js — Reseñas de clientes (página producto).
// Contrato §10.4: initReviews() — renderiza reseñas en #tabReviews con localStorage.

import { qs, qsa, createEl, formatPrice, notify, saveLS, loadLS } from './utils.js';
import { getParam } from './router.js';
import { getProductById, getReviews } from '../data/products.js';

// ---- RENDERIZADO DE RESEÑAS ----

function renderReviews(productId) {
  const product = getProductById(productId);
  if (!product) return;

  const panel = qs('#tabReviews');
  if (!panel) return;

  // Limpiar contenido mock existente.
  panel.innerHTML = '';

  // Combinar reseñas base + las guardadas en localStorage.
  const baseReviews = getReviews(productId);
  const savedReviews = loadLS(`solestyle_reviews_${productId}`, []);
  const allReviews = [...baseReviews, ...savedReviews];

  // Resumen: rating promedio + distribución.
  const avgRating = allReviews.length
    ? allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length
    : product.rating;
  const distribution = [0, 0, 0, 0, 0];
  allReviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) distribution[r.rating - 1]++;
  });
  const total = allReviews.length || 1;

  const summary = createEl('div', 'rv-summary');
  summary.innerHTML = `
    <div class="rv-summary__avg">
      <span class="rv-summary__number">${avgRating.toFixed(1)}</span>
      <span class="rv-summary__stars">${'★'.repeat(Math.round(avgRating))}${'☆'.repeat(5 - Math.round(avgRating))}</span>
      <span class="rv-summary__count">${allReviews.length} reseñas</span>
    </div>
    <div class="rv-summary__bars">
      ${[5, 4, 3, 2, 1].map(stars => {
        const count = distribution[stars - 1];
        const pct = total > 0 ? (count / total) * 100 : 0;
        return `
          <div class="rv-bar">
            <span class="rv-bar__label">${stars} ★</span>
            <div class="rv-bar__track"><div class="rv-bar__fill" style="width: ${pct}%"></div></div>
            <span class="rv-bar__count">${count}</span>
          </div>
        `;
      }).join('')}
    </div>
  `;
  panel.appendChild(summary);

  // Controles: orden + botón escribir.
  const controls = createEl('div', 'rv-controls');
  controls.innerHTML = `
    <select class="rv-sort">
      <option value="recent">Más recientes</option>
      <option value="best">Mejores</option>
      <option value="worst">Peores</option>
    </select>
    <button class="btn btn-primary btn-sm rv-write-btn" type="button">Escribir reseña</button>
  `;
  panel.appendChild(controls);

  // Lista de reseñas.
  const list = createEl('div', 'rv-list');
  list.id = 'rv-list';
  panel.appendChild(list);

  const renderList = (sort = 'recent') => {
    list.innerHTML = '';
    let sorted = [...allReviews];
    if (sort === 'best') sorted.sort((a, b) => b.rating - a.rating);
    else if (sort === 'worst') sorted.sort((a, b) => a.rating - b.rating);
    else sorted.reverse(); // recientes: los guardados van al final, los base al principio.

    sorted.forEach(r => {
      const item = createEl('div', 'rv-item');
      const initial = r.name ? r.name.charAt(0).toUpperCase() : '?';
      item.innerHTML = `
        <div class="rv-item__header">
          <div class="rv-item__avatar">${initial}</div>
          <div class="rv-item__meta">
            <span class="rv-item__name">${r.name}</span>
            <span class="rv-item__date">${r.date}</span>
          </div>
          <div class="rv-item__stars">${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}</div>
        </div>
        ${r.title ? `<h4 class="rv-item__title">${r.title}</h4>` : ''}
        <p class="rv-item__text">${r.text}</p>
      `;
      list.appendChild(item);
    });
  };

  renderList();

  // Evento de orden.
  const sortSelect = qs('.rv-sort', controls);
  if (sortSelect) {
    sortSelect.addEventListener('change', () => renderList(sortSelect.value));
  }

  // Formulario de reseña.
  const writeBtn = qs('.rv-write-btn', controls);
  const formContainer = createEl('div', 'rv-form-container');
  formContainer.innerHTML = `
    <form class="rv-form" id="rv-form">
      <div class="rv-form__group">
        <label class="rv-form__label" for="rv-name">Tu nombre *</label>
        <input class="rv-form__input" type="text" id="rv-name" required>
      </div>
      <div class="rv-form__group">
        <label class="rv-form__label" for="rv-title">Título *</label>
        <input class="rv-form__input" type="text" id="rv-title" required>
      </div>
      <div class="rv-form__group">
        <label class="rv-form__label" for="rv-text">Tu reseña *</label>
        <textarea class="rv-form__textarea" id="rv-text" rows="4" required></textarea>
      </div>
      <div class="rv-form__group">
        <label class="rv-form__label">Calificación *</label>
        <div class="rv-form__stars" id="rv-rating-stars">
          ${[1, 2, 3, 4, 5].map(n => `<button type="button" class="rv-star-btn" data-rating="${n}">☆</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary btn-sm rv-submit-btn" type="submit">Enviar reseña</button>
    </form>
  `;
  panel.appendChild(formContainer);

  let selectedRating = 0;
  const starBtns = qsa('.rv-star-btn', formContainer);
  starBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      selectedRating = parseInt(btn.dataset.rating, 10);
      starBtns.forEach(b => {
        b.textContent = parseInt(b.dataset.rating, 10) <= selectedRating ? '★' : '☆';
        b.classList.toggle('is-active', parseInt(b.dataset.rating, 10) <= selectedRating);
      });
    });
  });

  if (writeBtn) {
    writeBtn.addEventListener('click', () => {
      formContainer.classList.toggle('is-open');
    });
  }

  const form = qs('#rv-form', formContainer);
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = qs('#rv-name', form).value.trim();
      const title = qs('#rv-title', form).value.trim();
      const text = qs('#rv-text', form).value.trim();
      if (!name || !title || !text || !selectedRating) {
        notify('Completa todos los campos', 'error');
        return;
      }
      const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
      const now = new Date();
      const dateStr = `${now.getDate()} de ${months[now.getMonth()]}, ${now.getFullYear()}`;

      const newReview = { name, title, text, rating: selectedRating, date: dateStr };
      const saved = loadLS(`solestyle_reviews_${productId}`, []);
      saved.push(newReview);
      saveLS(`solestyle_reviews_${productId}`, saved);

      notify('¡Gracias por tu reseña!', 'success');
      form.reset();
      selectedRating = 0;
      starBtns.forEach(b => {
        b.textContent = '☆';
        b.classList.remove('is-active');
      });
      formContainer.classList.remove('is-open');

      // Re-render con la nueva reseña.
      renderReviews(productId);
    });
  }
}

// ---- EXPORT ----

export function initReviews() {
  const page = qs('script[data-page]')?.dataset.page || 'home';
  if (page !== 'producto') return;

  const id = parseInt(getParam('id'), 10);
  if (id) renderReviews(id);
}
