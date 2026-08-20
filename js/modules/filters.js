// filters.js — Filtros, orden y paginación del catálogo (tienda.html).

import { qs, qsa, createEl, debounce, formatPrice, createProductCard } from './utils.js';
import { products, categories } from '../data/products.js';
import { setParams, onPopState } from './router.js';

const PAGE_SIZE = 12;
const DEFAULT_MAX = 6000;

export class FilterSystem {
  constructor() {
    this.state = this._readState();
  }

  // Lee el estado inicial desde la query string (listas separadas por coma).
  _readState() {
    const params = new URLSearchParams(window.location.search);
    const list = (name) => (params.get(name) ? params.get(name).split(',').filter(Boolean) : []);
    return {
      categories: list('category'),
      brand: params.get('brand') || '',
      sizes: list('size').map(Number),
      colors: list('color'),
      min: Number(params.get('min')) || 0,
      max: Number(params.get('max')) || DEFAULT_MAX,
      sort: params.get('sort') || 'relevance',
      page: Number(params.get('page')) || 1,
      q: params.get('q') || '',
    };
  }

  // Precio efectivo: descuento si existe, si no el precio base.
  _effectivePrice(p) {
    return p.discountPrice ?? p.price;
  }

  // Filtra, ordena y pagina los productos según el estado actual.
  getFiltered() {
    const s = this.state;
    let list = products.filter(p => {
      if (s.categories.length && !s.categories.includes(p.category)) return false;
      if (s.brand && p.brand !== s.brand) return false;
      if (s.sizes.length && !p.sizes.some(sz => s.sizes.includes(sz))) return false;
      if (s.colors.length && !p.colors.some(c => s.colors.includes(c.name))) return false;
      const price = this._effectivePrice(p);
      if (price < s.min || price > s.max) return false;
      if (s.q && !`${p.name} ${p.brand} ${p.category}`.toLowerCase().includes(s.q.toLowerCase())) return false;
      return true;
    });

    switch (s.sort) {
      case 'price-asc':
        list.sort((a, b) => this._effectivePrice(a) - this._effectivePrice(b));
        break;
      case 'price-desc':
        list.sort((a, b) => this._effectivePrice(b) - this._effectivePrice(a));
        break;
      case 'newest':
        list.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || b.id - a.id);
        break;
      default:
        list.sort((a, b) => (b.isBestseller ? 1 : 0) - (a.isBestseller ? 1 : 0) || b.rating - a.rating);
    }

    this._total = list.length;
    const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
    if (s.page > totalPages) s.page = totalPages;
    const start = (s.page - 1) * PAGE_SIZE;
    return list.slice(start, start + PAGE_SIZE);
  }

  // Total de productos tras filtrar (sin paginar).
  getTotalCount() {
    return this._total ?? 0;
  }

  // Nombre legible de una categoría.
  _categoryName(id) {
    const cat = categories.find(c => c.id === id);
    return cat ? cat.name : id;
  }

  // Escribe el estado en la URL (solo valores no default).
  _syncURL() {
    const s = this.state;
    const params = {};
    if (s.categories.length) params.category = s.categories.join(',');
    if (s.brand) params.brand = s.brand;
    if (s.sizes.length) params.size = s.sizes.join(',');
    if (s.colors.length) params.color = s.colors.join(',');
    if (s.min > 0) params.min = String(s.min);
    if (s.max < DEFAULT_MAX) params.max = String(s.max);
    if (s.sort !== 'relevance') params.sort = s.sort;
    if (s.page > 1) params.page = String(s.page);
    if (s.q) params.q = s.q;
    setParams(params);
  }

  // Aplica un cambio de estado, sincroniza URL y re-renderiza.
  _update(patch) {
    this.state = { ...this.state, ...patch };
    this._syncURL();
    this.render();
  }

  // Quita un filtro activo desde su chip.
  _removeFilter(type, value) {
    const s = this.state;
    switch (type) {
      case 'category': this._update({ categories: s.categories.filter(c => c !== value), page: 1 }); break;
      case 'brand': this._update({ brand: '', page: 1 }); break;
      case 'size': this._update({ sizes: s.sizes.filter(sz => String(sz) !== value), page: 1 }); break;
      case 'color': this._update({ colors: s.colors.filter(c => c !== value), page: 1 }); break;
      case 'price': this._update({ min: 0, max: DEFAULT_MAX, page: 1 }); break;
      case 'q': this._update({ q: '', page: 1 }); break;
    }
  }

  // Pinta rejilla, contador, paginación, chips de filtros y controles del sidebar.
  render() {
    const grid = qs('#productGrid');
    if (!grid) return;
    const items = this.getFiltered();
    const total = this.getTotalCount();
    const s = this.state;

    grid.innerHTML = '';
    if (items.length) {
      items.forEach(p => grid.appendChild(createProductCard(p)));
    } else {
      const empty = createEl('div', 'empty-state');
      empty.innerHTML = '<i data-lucide="search"></i><p>No se encontraron productos</p>';
      grid.appendChild(empty);
    }

    const count = qs('#resultsCount');
    if (count) {
      let text = total === 1 ? '1 producto' : `${total} productos`;
      if (s.q) text += ` · Resultados para «${s.q}»`;
      count.textContent = text;
    }

    this._renderPagination(total);
    this._renderActiveFilters();
    this._syncControls();
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Paginación: anterior, números con elipsis y siguiente.
  _renderPagination(total) {
    const pagination = qs('#pagination');
    if (!pagination) return;
    pagination.innerHTML = '';
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    if (totalPages <= 1) return;
    const s = this.state;

    const prev = createEl('button', 'page-btn' + (s.page <= 1 ? ' is-disabled' : ''));
    prev.type = 'button';
    prev.setAttribute('aria-label', 'Página anterior');
    prev.innerHTML = '<i data-lucide="chevron-left"></i>';
    prev.dataset.page = String(s.page - 1);
    if (s.page <= 1) prev.disabled = true;
    pagination.appendChild(prev);

    this._pageList(s.page, totalPages).forEach(p => {
      if (p === '…') {
        const dots = createEl('span', 'page-btn is-disabled');
        dots.textContent = '…';
        pagination.appendChild(dots);
        return;
      }
      const btn = createEl('button', 'page-btn' + (p === s.page ? ' is-active' : ''));
      btn.type = 'button';
      btn.textContent = String(p);
      btn.dataset.page = String(p);
      if (p === s.page) btn.setAttribute('aria-current', 'page');
      pagination.appendChild(btn);
    });

    const next = createEl('button', 'page-btn' + (s.page >= totalPages ? ' is-disabled' : ''));
    next.type = 'button';
    next.setAttribute('aria-label', 'Página siguiente');
    next.innerHTML = '<i data-lucide="chevron-right"></i>';
    next.dataset.page = String(s.page + 1);
    if (s.page >= totalPages) next.disabled = true;
    pagination.appendChild(next);
  }

  // Lista de páginas a mostrar con elipsis cuando hay muchas.
  _pageList(current, total) {
    if (total <= 7) {
      const all = [];
      for (let i = 1; i <= total; i++) all.push(i);
      return all;
    }
    const pages = [1];
    if (current > 3) pages.push('…');
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
    if (current < total - 2) pages.push('…');
    pages.push(total);
    return pages;
  }

  // Chips de filtros activos con botón × para quitarlos.
  _renderActiveFilters() {
    const container = qs('#activeFilters');
    if (!container) return;
    container.innerHTML = '';
    const s = this.state;
    const chips = [];
    s.categories.forEach(c => chips.push({ type: 'category', value: c, label: this._categoryName(c) }));
    if (s.brand) chips.push({ type: 'brand', value: s.brand, label: s.brand });
    s.sizes.forEach(sz => chips.push({ type: 'size', value: String(sz), label: `Talla ${sz}` }));
    s.colors.forEach(c => chips.push({ type: 'color', value: c, label: c }));
    if (s.min > 0 || s.max < DEFAULT_MAX) chips.push({ type: 'price', value: `${s.min}-${s.max}`, label: `$${s.min} – $${s.max}` });
    if (s.q) chips.push({ type: 'q', value: s.q, label: `«${s.q}»` });
    chips.forEach(chip => {
      const btn = createEl('button', 'filter-chip');
      btn.type = 'button';
      btn.dataset.filter = chip.type;
      btn.dataset.value = chip.value;
      btn.innerHTML = `${chip.label} <span aria-hidden="true">×</span>`;
      btn.setAttribute('aria-label', `Quitar filtro ${chip.label}`);
      container.appendChild(btn);
    });
  }

  // Sincroniza checkboxes, selects, ranges, chips y swatches con el estado.
  _syncControls() {
    const s = this.state;
    qsa('input[data-filter="category"]').forEach(cb => {
      cb.checked = s.categories.includes(cb.dataset.value);
    });
    const brand = qs('#brandFilter');
    if (brand) brand.value = s.brand;
    const sort = qs('#sortSelect');
    if (sort) sort.value = s.sort;
    const min = qs('#priceMin');
    const max = qs('#priceMax');
    if (min) min.value = String(s.min);
    if (max) max.value = String(s.max);
    const minVal = qs('#priceMinVal');
    if (minVal) minVal.textContent = formatPrice(s.min);
    const maxVal = qs('#priceMaxVal');
    if (maxVal) maxVal.textContent = formatPrice(s.max);
    qsa('.chip[data-size]').forEach(chip => {
      const active = s.sizes.includes(Number(chip.dataset.size));
      chip.classList.toggle('is-active', active);
      chip.setAttribute('aria-pressed', String(active));
    });
    qsa('.swatch[data-color-name]').forEach(sw => {
      sw.classList.toggle('is-active', s.colors.includes(sw.dataset.colorName));
    });
  }

  // Delegación global: cambios y clics en sidebar, toolbar y paginación.
  bind() {
    const commitRange = debounce(() => {
      this._update({
        min: Number(qs('#priceMin')?.value) || 0,
        max: Number(qs('#priceMax')?.value) || DEFAULT_MAX,
        page: 1,
      });
    }, 300);

    document.addEventListener('change', (e) => {
      const t = e.target;
      if (t.matches('input[data-filter="category"]')) {
        const value = t.dataset.value;
        const list = [...this.state.categories];
        if (t.checked) {
          if (!list.includes(value)) list.push(value);
        } else {
          const i = list.indexOf(value);
          if (i >= 0) list.splice(i, 1);
        }
        this._update({ categories: list, page: 1 });
      } else if (t.id === 'brandFilter') {
        this._update({ brand: t.value, page: 1 });
      } else if (t.id === 'sortSelect') {
        this._update({ sort: t.value, page: 1 });
      } else if (t.id === 'priceMin' || t.id === 'priceMax') {
        commitRange();
      }
    });

    // Actualiza los valores visibles del rango mientras se arrastra.
    const updateRangeVals = debounce(() => {
      const min = qs('#priceMin');
      const max = qs('#priceMax');
      const minVal = qs('#priceMinVal');
      const maxVal = qs('#priceMaxVal');
      if (min && minVal) minVal.textContent = formatPrice(Number(min.value));
      if (max && maxVal) maxVal.textContent = formatPrice(Number(max.value));
    }, 50);
    document.addEventListener('input', (e) => {
      if (e.target.id === 'priceMin' || e.target.id === 'priceMax') updateRangeVals();
    });

    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.chip[data-size]');
      if (chip) {
        const sz = Number(chip.dataset.size);
        const list = [...this.state.sizes];
        const i = list.indexOf(sz);
        if (i >= 0) list.splice(i, 1); else list.push(sz);
        this._update({ sizes: list, page: 1 });
        return;
      }
      const swatch = e.target.closest('.swatch[data-color-name]');
      if (swatch) {
        const color = swatch.dataset.colorName;
        const list = [...this.state.colors];
        const i = list.indexOf(color);
        if (i >= 0) list.splice(i, 1); else list.push(color);
        this._update({ colors: list, page: 1 });
        return;
      }
      const pageBtn = e.target.closest('.page-btn[data-page]');
      if (pageBtn) {
        const p = Number(pageBtn.dataset.page);
        if (p >= 1 && p !== this.state.page) this._update({ page: p });
        return;
      }
      if (e.target.closest('#clearFilters')) {
        this.state = { categories: [], brand: '', sizes: [], colors: [], min: 0, max: DEFAULT_MAX, sort: 'relevance', page: 1, q: '' };
        setParams({});
        this.render();
        return;
      }
      const filterChip = e.target.closest('.filter-chip');
      if (filterChip) this._removeFilter(filterChip.dataset.filter, filterChip.dataset.value);
    });

    // Navegación atrás/adelante: re-lee la URL y re-renderiza.
    onPopState(() => {
      this.state = this._readState();
      this.render();
    });
  }
}