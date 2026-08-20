// favorites.js — Favoritos singleton con persistencia en localStorage.

import { qs, qsa, saveLS, loadLS, EVENTS, createProductCard } from './utils.js';
import { getProductById } from '../data/products.js';

const STORAGE_KEY = 'solestyle_favorites';

class Favorites {
  constructor() {
    const saved = loadLS(STORAGE_KEY, []);
    this.ids = Array.isArray(saved) ? saved : [];
  }

  // Persiste la lista de ids en localStorage.
  _persist() {
    saveLS(STORAGE_KEY, this.ids);
  }

  // Alterna un id; devuelve true si ahora está guardado.
  toggle(id) {
    const index = this.ids.indexOf(id);
    if (index >= 0) {
      this.ids.splice(index, 1);
      this._persist();
      return false;
    }
    this.ids.push(id);
    this._persist();
    return true;
  }

  // Indica si un id está guardado.
  has(id) {
    return this.ids.includes(id);
  }

  // Elimina un id de la lista.
  remove(id) {
    const index = this.ids.indexOf(id);
    if (index >= 0) {
      this.ids.splice(index, 1);
      this._persist();
    }
  }

  // Copia de los ids guardados.
  getIds() {
    return [...this.ids];
  }

  // Sincroniza botones, badge y la rejilla de la página de favoritos.
  render() {
    qsa('.favorite-btn[data-favorite]').forEach(btn => {
      const id = parseInt(btn.dataset.favorite, 10);
      const active = this.has(id);
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
      btn.setAttribute('aria-label', active ? 'Quitar de favoritos' : 'Añadir a favoritos');
    });

    const badge = qs('#favoritesBadge');
    if (badge) {
      badge.textContent = String(this.ids.length);
      badge.classList.toggle('is-hidden', this.ids.length === 0);
    }

    const grid = qs('#favoritesGrid');
    if (grid) {
      const items = this.ids.map(getProductById).filter(Boolean);
      grid.innerHTML = '';
      items.forEach(p => grid.appendChild(createProductCard(p, { showMoveToCart: true })));
      const empty = qs('#favoritesEmpty');
      if (empty) empty.classList.toggle('is-hidden', items.length > 0);
    }

    window.dispatchEvent(new CustomEvent(EVENTS.FAVORITES_CHANGED));
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

export const favorites = new Favorites();