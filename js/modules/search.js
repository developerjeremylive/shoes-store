// search.js — Búsqueda global con dropdown, navegación por teclado e historial.

import { qs, qsa, createEl, debounce, saveLS, loadLS } from './utils.js';
import { products, categories } from '../data/products.js';

const HISTORY_KEY = 'solestyle_search_history';
const MAX_RESULTS = 5;

export class GlobalSearch {
  constructor(inputEl, dropdownEl) {
    this.input = inputEl;
    this.dropdown = dropdownEl;
    this.results = [];
    this.activeIndex = -1;
    if (!this.input || !this.dropdown) return;
    this._bind();
  }

  // Cablea input, foco, teclado y cierre por clic fuera.
  _bind() {
    const run = debounce(() => this._onInput(), 250);
    this.input.addEventListener('input', run);
    this.input.addEventListener('focus', () => {
      if (!this.input.value.trim()) this._showHistory();
    });
    this.input.addEventListener('keydown', (e) => this._onKeydown(e));
    document.addEventListener('click', (e) => {
      if (!this.dropdown.contains(e.target) && e.target !== this.input) this._close();
    });
  }

  // Filtra productos por nombre/marca/categoría (mínimo 2 caracteres).
  _onInput() {
    const term = this.input.value.trim();
    if (term.length < 2) {
      this._close();
      return;
    }
    this.results = products
      .filter(p => `${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(term.toLowerCase()))
      .slice(0, MAX_RESULTS);
    this._renderResults(term);
  }

  // Pinta hasta 5 resultados + enlace "Ver todos los resultados".
  _renderResults(term) {
    this.dropdown.innerHTML = '';
    this.activeIndex = -1;
    this.input.removeAttribute('aria-activedescendant');
    if (!this.results.length) {
      this._close();
      return;
    }
    this.results.forEach((p, i) => {
      const a = createEl('a', 'search-result-item');
      a.href = `producto.html?id=${p.id}`;
      a.id = `search-opt-${i}`;
      a.setAttribute('role', 'option');
      const img = createEl('img');
      img.src = p.images[0];
      img.alt = p.name;
      img.width = 40;
      img.height = 40;
      img.loading = 'lazy';
      const catName = categories.find(c => c.id === p.category)?.name ?? p.category;
      const info = createEl('div');
      info.innerHTML = `<p class="search-result-item__name">${p.name}</p><p class="search-result-item__meta">${p.brand} · ${catName}</p>`;
      a.append(img, info);
      a.addEventListener('click', () => this._pushHistory(term));
      this.dropdown.appendChild(a);
    });
    const all = createEl('a', 'search-result-all');
    all.href = `tienda.html?q=${encodeURIComponent(term)}`;
    all.textContent = 'Ver todos los resultados';
    all.addEventListener('click', () => this._pushHistory(term));
    this.dropdown.appendChild(all);
    this.dropdown.classList.add('is-open');
  }

  // Navegación con flechas, Enter y Escape.
  _onKeydown(e) {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!this.dropdown.classList.contains('is-open')) {
        this._onInput();
        return;
      }
      this.activeIndex = Math.min(this.activeIndex + 1, this.results.length - 1);
      this._setActive();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activeIndex = Math.max(this.activeIndex - 1, 0);
      this._setActive();
    } else if (e.key === 'Enter') {
      if (this.activeIndex >= 0 && this.results[this.activeIndex]) {
        e.preventDefault();
        const p = this.results[this.activeIndex];
        this._pushHistory(this.input.value.trim());
        window.location.href = `producto.html?id=${p.id}`;
      }
    } else if (e.key === 'Escape') {
      this._close();
      this.input.blur();
    }
  }

  // Marca el resultado activo y actualiza aria-activedescendant.
  _setActive() {
    qsa('.search-result-item', this.dropdown).forEach((el, i) => {
      el.classList.toggle('is-active', i === this.activeIndex);
    });
    const active = qs(`#search-opt-${this.activeIndex}`, this.dropdown);
    if (active) this.input.setAttribute('aria-activedescendant', active.id);
  }

  // Historial de búsquedas (últimos 5) al enfocar con el input vacío.
  _showHistory() {
    const history = this._getHistory().slice(0, 5);
    if (!history.length) return;
    this.dropdown.innerHTML = '';
    history.forEach(term => {
      const btn = createEl('button', 'search-history-item');
      btn.type = 'button';
      btn.textContent = term;
      btn.addEventListener('click', () => {
        this.input.value = term;
        this._pushHistory(term);
        this._onInput();
      });
      this.dropdown.appendChild(btn);
    });
    this.dropdown.classList.add('is-open');
  }

  // Lee el historial guardado.
  _getHistory() {
    const h = loadLS(HISTORY_KEY, []);
    return Array.isArray(h) ? h : [];
  }

  // Guarda un término al frente del historial (dedupe, máx 10).
  _pushHistory(term) {
    if (!term) return;
    const h = this._getHistory().filter(t => t.toLowerCase() !== term.toLowerCase());
    h.unshift(term);
    saveLS(HISTORY_KEY, h.slice(0, 10));
  }

  // Cierra el dropdown y limpia el estado activo.
  _close() {
    this.dropdown.classList.remove('is-open');
    this.dropdown.innerHTML = '';
    this.activeIndex = -1;
    this.input.removeAttribute('aria-activedescendant');
  }
}