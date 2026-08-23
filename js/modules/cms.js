// ============================================================
// SoleStyle CMS — Panel de Administración
// CRUD completo: Productos, Páginas, Categorías
// Persistencia en localStorage · Sin frameworks
// ============================================================

import { products as defaultProducts, categories as defaultCategories } from '../data/products.js';
import { isLoggedIn, getCurrentUser, logout } from './auth.js';
import { formatPrice, createEl, qs, qsa, saveLS, loadLS, notify } from './utils.js';

// ── Keys de localStorage ─────────────────────────────────────
const LS_PRODUCTS = 'solestyle_cms_products';
const LS_PAGES = 'solestyle_cms_pages';
const LS_CATEGORIES = 'solestyle_cms_categories';
const LS_SITE_CONTENT = 'solestyle_cms_site_content';

// ── Secciones del CMS ────────────────────────────────────────
const SECTIONS = [
  { id: 'dashboard', title: 'Dashboard' },
  { id: 'products', title: 'Productos' },
  { id: 'product-edit', title: 'Editar Producto' },
  { id: 'pages', title: 'Páginas' },
  { id: 'categories', title: 'Categorías' },
  { id: 'site-content', title: 'Contenido del Sitio' }
];

const ALL_SIZES = [35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45];

// ── Data Layer ───────────────────────────────────────────────

function getProducts() {
  let stored = loadLS(LS_PRODUCTS, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    stored = defaultProducts.map(p => JSON.parse(JSON.stringify(p)));
    saveLS(LS_PRODUCTS, stored);
  }
  return stored;
}

function saveProducts(arr) {
  saveLS(LS_PRODUCTS, arr);
}

function getPages() {
  let stored = loadLS(LS_PAGES, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    stored = seedPages();
    saveLS(LS_PAGES, stored);
  }
  return stored;
}

function savePages(arr) {
  saveLS(LS_PAGES, arr);
}

function getCategories() {
  let stored = loadLS(LS_CATEGORIES, null);
  if (!stored || !Array.isArray(stored) || stored.length === 0) {
    stored = defaultCategories.map(c => ({ ...c }));
    saveLS(LS_CATEGORIES, stored);
  }
  return stored;
}

function saveCategories(arr) {
  saveLS(LS_CATEGORIES, arr);
}

function generateId() {
  const products = getProducts();
  if (products.length === 0) return 1;
  return Math.max(...products.map(p => p.id)) + 1;
}

function seedPages() {
  return [
    {
      id: 'index',
      title: 'Inicio',
      slug: 'index.html',
      content: '<h1>Bienvenido a SoleStyle</h1><p>Tu tienda de zapatillas premium.</p>',
      sections: [
        { key: 'hero_title', label: 'Título Hero', content: 'Paso, Estilo, Actitud' },
        { key: 'hero_subtitle', label: 'Subtítulo Hero', content: 'Zapatillas premium que combinan tecnología y diseño.' },
        { key: 'featured_title', label: 'Título Destacados', content: 'Los Más Vendidos' },
        { key: 'featured_desc', label: 'Descripción Destacados', content: 'Descubre nuestros modelos más populares.' }
      ]
    },
    {
      id: 'tienda',
      title: 'Tienda',
      slug: 'tienda.html',
      content: '<h1>Catálogo de Productos</h1><p>Explora nuestra colección completa.</p>',
      sections: [
        { key: 'catalog_title', label: 'Título Catálogo', content: 'Nuestra Colección' },
        { key: 'catalog_desc', label: 'Descripción Catálogo', content: 'Encuentra la zapatilla perfecta para cada ocasión.' },
        { key: 'filter_label', label: 'Etiqueta de Filtros', content: 'Filtrar por:' },
        { key: 'empty_msg', label: 'Mensaje sin resultados', content: 'No se encontraron productos con estos filtros.' }
      ]
    },
    {
      id: 'producto',
      title: 'Producto',
      slug: 'producto.html',
      content: '<h1>Detalle de Producto</h1><p>Conoce cada detalle de tu próxima zapatilla.</p>',
      sections: [
        { key: 'related_title', label: 'Título Relacionados', content: 'También Te Puede Gustar' },
        { key: 'specs_title', label: 'Título Especificaciones', content: 'Especificaciones' },
        { key: 'reviews_title', label: 'Título Reseñas', content: 'Reseñas de Clientes' },
        { key: 'warranty_text', label: 'Texto de Garantía', content: 'Garantía de 12 meses contra defectos de fabricación.' }
      ]
    },
    {
      id: 'favoritos',
      title: 'Favoritos',
      slug: 'favoritos.html',
      content: '<h1>Tus Favoritos</h1><p>Los productos que marcaste como favoritos.</p>',
      sections: [
        { key: 'empty_title', label: 'Título Vacío', content: 'Tu lista de favoritos está vacía' },
        { key: 'empty_desc', label: 'Descripción Vacía', content: 'Explora nuestro catálogo y guarda los productos que más te gusten.' },
        { key: 'move_to_cart', label: 'Texto Botón Mover', content: 'Mover al carrito' },
        { key: 'remove_label', label: 'Etiqueta Eliminar', content: 'Eliminar de favoritos' }
      ]
    }
  ];
}

// ── Reviews Data Layer ───────────────────────────────────────

function getReviews(productId) {
  const key = `solestyle_cms_reviews_${productId}`;
  let stored = loadLS(key, null);
  if (!stored || !Array.isArray(stored)) {
    stored = seedReviews(productId);
    saveLS(key, stored);
  }
  return stored;
}

function saveReviews(productId, reviews) {
  const key = `solestyle_cms_reviews_${productId}`;
  saveLS(key, reviews);
}

function seedReviews(productId) {
  const product = getProducts().find(p => p.id === productId);
  if (!product || !product.reviews || product.reviews === 0) return [];
  const mockPool = [
    { author: 'Carlos Mendoza', rating: 5, title: 'Excelente para entrenar', text: 'Las usé en mi último maratón y la amortiguación es increíble. Muy ligeras y con gran soporte.' },
    { author: 'Lucía Fernández', rating: 4, title: 'Muy bonitas y cómodas', text: 'Las combino con outfits casuales y formales. El material de alta calidad se nota desde el primer uso.' },
    { author: 'Andrés Ruiz', rating: 5, title: 'Perfectas para viajar', text: 'Las llevé en un viaje de 3 semanas y nunca me molestaron. Empaque muy bien presentado.' },
    { author: 'María Torres', rating: 5, title: 'Recomendadas 100%', text: 'Mis clientes siempre me preguntan qué calzado uso. Estas son mis favoritas para sesiones de alto impacto.' },
    { author: 'Diego Herrera', rating: 4, title: 'Relación calidad-precio', text: 'Para el precio que tienen, la calidad es insuperable. Las uso todos los días en la universidad.' },
    { author: 'Ana García', rating: 5, title: 'Las amo', text: 'Súper fotogénicas y cómodas. Ya las recomendé en mi canal y mis seguidoras las aman.' }
  ];
  const count = Math.min(product.reviews, mockPool.length);
  const reviews = [];
  for (let i = 0; i < count; i++) {
    reviews.push({
      id: `r${Date.now()}_${i}`,
      author: mockPool[i].author,
      date: `2026-0${Math.min(i + 1, 9)}-${String(Math.floor(Math.random() * 28) + 1).padStart(2, '0')}`,
      rating: mockPool[i].rating,
      title: mockPool[i].title,
      text: mockPool[i].text
    });
  }
  return reviews;
}

// ── Site Content Data Layer ──────────────────────────────────

function getSiteContent() {
  let stored = loadLS(LS_SITE_CONTENT, null);
  if (!stored || typeof stored !== 'object') {
    stored = seedSiteContent();
    saveLS(LS_SITE_CONTENT, stored);
  }
  return stored;
}

function saveSiteContentData(data) {
  saveLS(LS_SITE_CONTENT, data);
}

function seedSiteContent() {
  return {
    siteName: 'SoleStyle',
    accentColor: '#FF6B35',
    navLinks: [
      { label: 'Inicio', href: 'index.html' },
      { label: 'Tienda', href: 'tienda.html' },
      { label: 'Colecciones', href: 'index.html#colecciones' },
      { label: 'Contacto', href: 'index.html#contacto' }
    ],
    heroEyebrow: 'Colección 2026',
    heroTitle: 'Pisa',
    heroTitleAccent: 'Fuerte',
    heroSubtitle: 'Tecnología, diseño y comodidad en cada paso. Calzado premium hecho para moverte.',
    heroCtaText: 'Explorar Colección',
    heroImageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    heroStat1: 'Envío gratis desde $2,000',
    heroStat2: '30 días de devolución',
    heroStat3: 'Garantía de 2 años',
    categoriesEyebrow: 'Categorías',
    categoriesTitle: 'Encuentra tu estilo',
    categoriesSubtitle: 'Explora nuestras colecciones diseñadas para cada ritmo de vida.',
    featuredEyebrow: 'Destacados',
    featuredTitle: 'Los más buscados',
    showcaseEyebrow: 'Producto destacado',
    showcaseProductId: 1,
    timelineEyebrow: 'Nuestra Historia',
    timelineTitle: 'Un paso a la vez',
    testimonialsEyebrow: 'Testimonios',
    testimonialsTitle: 'Lo que dicen nuestros clientes',
    testimonials: [
      { name: 'Carlos Mendoza', role: 'Corredor amateur', photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80', rating: 5, text: 'Las AirRunner Pro cambiaron por completo mis entrenamientos. Ligereza y amortiguación que no había probado en ninguna otra marca.' },
      { name: 'Lucía Fernández', role: 'Diseñadora', photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80', rating: 4.5, text: 'Combinan estilo y comodidad a la perfección. Los uso todos los días en la oficina y siguen impecables después de meses.' },
      { name: 'Andrés Ruiz', role: 'Viajero frecuente', photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&auto=format&fit=crop&q=80', rating: 5, text: 'Pedí desde el extranjero y llegó en tiempo récord. La calidad es superior y el servicio al cliente, excelente.' }
    ],
    newsletterEyebrow: 'Newsletter',
    newsletterTitle: 'Únete a SoleStyle',
    newsletterSubtitle: 'Recibe novedades, lanzamientos y ofertas exclusivas directamente en tu correo.',
    newsletterCtaText: 'Suscribirme',
    footerDescription: 'Calzado premium con tecnología, diseño y comodidad en cada paso.',
    footerSocial: { facebook: '#', instagram: '#', twitter: '#' },
    footerTiendaTitle: 'Tienda',
    footerTiendaLinks: [
      { label: 'Running', href: 'tienda.html?category=running' },
      { label: 'Casual', href: 'tienda.html?category=casual' },
      { label: 'Formal', href: 'tienda.html?category=formal' },
      { label: 'Outdoor', href: 'tienda.html?category=outdoor' }
    ],
    footerAyudaTitle: 'Ayuda',
    footerAyudaLinks: [
      { label: 'Envíos', href: '#' },
      { label: 'Devoluciones', href: '#' },
      { label: 'Tallas', href: '#' },
      { label: 'Contacto', href: '#' }
    ],
    footerPagosTitle: 'Pagos',
    footerPagosBadges: ['Visa', 'Mastercard', 'Amex', 'PayPal'],
    footerCopyright: '© 2026 SoleStyle. Todos los derechos reservados.'
  };
}

// ── Toast ────────────────────────────────────────────────────

function showToast(msg, type = 'success') {
  let toast = qs('.cms-toast');
  if (!toast) {
    toast = createEl('div', 'cms-toast');
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.className = 'cms-toast';
  toast.classList.add(`cms-toast--${type}`);
  toast.classList.add('is-visible');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove('is-visible'), 3000);
}

// ── Auth Guard ───────────────────────────────────────────────

function checkAuth() {
  if (!isLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// ── Navigation ───────────────────────────────────────────────

let currentSection = 'dashboard';
let navHistory = ['dashboard'];

function navigateTo(sectionId, options = {}) {
  const { addToHistory = true } = options;
  if (sectionId === currentSection && addToHistory) return;
  if (addToHistory) {
    navHistory.push(sectionId);
    if (navHistory.length > 20) navHistory.shift();
  }
  currentSection = sectionId;

  // Actualizar links activos
  qsa('.cms-sidebar__link').forEach(link => {
    const target = link.dataset.section;
    link.classList.toggle('is-active', target === sectionId);
  });

  // Ocultar todas las secciones, mostrar la actual
  qsa('.cms-section').forEach(sec => {
    sec.style.display = sec.id === `section-${sectionId}` ? 'block' : 'none';
  });

  // Actualizar título del header
  const section = SECTIONS.find(s => s.id === sectionId);
  const titleEl = qs('.cms-header__title');
  if (titleEl && section) titleEl.textContent = section.title;

  // Renderizar contenido de la sección
  renderSection(sectionId);
}

function goBack() {
  if (navHistory.length > 1) {
    navHistory.pop();
    const prev = navHistory[navHistory.length - 1];
    navigateTo(prev, { addToHistory: false });
  } else {
    navigateTo('dashboard', { addToHistory: false });
  }
}

function renderSection(id) {
  switch (id) {
    case 'dashboard': renderDashboard(); break;
    case 'products': renderProductList(); break;
    case 'pages': renderPageList(); break;
    case 'categories': renderCategoryList(); break;
    case 'site-content': renderSiteContent(); break;
    // product-edit se renderiza directamente al hacer clic en editar/nuevo
  }
}

// ── Sidebar Toggle (Mobile) ──────────────────────────────────

function initSidebar() {
  const toggle = qs('.cms-sidebar-toggle');
  const sidebar = qs('.cms-sidebar');
  const overlay = qs('.cms-sidebar-overlay');

  if (toggle && sidebar) {
    toggle.addEventListener('click', () => {
      sidebar.classList.toggle('is-open');
      if (overlay) overlay.classList.toggle('is-open');
    });
  }
  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar?.classList.remove('is-open');
      overlay.classList.remove('is-open');
    });
  }
}

// ── Dashboard ────────────────────────────────────────────────

function renderDashboard() {
  const container = qs('#section-dashboard');
  if (!container) return;

  const products = getProducts();
  const categories = getCategories();

  const totalProducts = products.length;
  const totalCategories = categories.length;
  const totalStock = products.reduce((sum, p) => {
    return sum + Object.values(p.stock || {}).reduce((s, v) => s + v, 0);
  }, 0);
  const avgRating = totalProducts > 0
    ? (products.reduce((sum, p) => sum + (p.rating || 0), 0) / totalProducts).toFixed(1)
    : '0.0';

  const recentProducts = [...products].sort((a, b) => b.id - a.id).slice(0, 5);

  container.innerHTML = `
    <div class="cms-stats">
      <div class="cms-stat-card">
        <div class="cms-stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        </div>
        <div>
          <div class="cms-stat-card__value">${totalProducts}</div>
          <div class="cms-stat-card__label">Total Productos</div>
        </div>
      </div>
      <div class="cms-stat-card">
        <div class="cms-stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10h10V2z"/><path d="M12 12H2v10h10V12z"/><path d="M22 2h-6v6h6V2z"/><path d="M22 12h-6v10h6V12z"/></svg>
        </div>
        <div>
          <div class="cms-stat-card__value">${totalCategories}</div>
          <div class="cms-stat-card__label">Categorías</div>
        </div>
      </div>
      <div class="cms-stat-card">
        <div class="cms-stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
        </div>
        <div>
          <div class="cms-stat-card__value">${totalStock.toLocaleString()}</div>
          <div class="cms-stat-card__label">Stock Total</div>
        </div>
      </div>
      <div class="cms-stat-card">
        <div class="cms-stat-card__icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
        </div>
        <div>
          <div class="cms-stat-card__value">${avgRating}</div>
          <div class="cms-stat-card__label">Rating Promedio</div>
        </div>
      </div>
    </div>

    <div style="margin-top: var(--space-xl);">
      <h3 style="font-family: var(--font-display); font-size: var(--fs-md); font-weight: 700; color: var(--color-text-primary); margin-bottom: var(--space-md);">Productos Recientes</h3>
      <div class="cms-table-container">
        <table class="cms-table">
          <thead>
            <tr>
              <th>Imagen</th>
              <th>Nombre</th>
              <th>Marca</th>
              <th>Categoría</th>
              <th>Precio</th>
            </tr>
          </thead>
          <tbody>
            ${recentProducts.map(p => `
              <tr>
                <td><img src="${p.images[0]}" alt="${p.name}" class="cms-table__image" loading="lazy"></td>
                <td>${p.name}</td>
                <td>${p.brand}</td>
                <td><span class="cms-table__badge cms-table__badge--accent">${p.category}</span></td>
                <td>${formatPrice(p.discountPrice || p.price)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

// ── Product List ─────────────────────────────────────────────

function renderProductList(searchTerm = '') {
  const container = qs('#section-products');
  if (!container) return;

  const products = getProducts();
  const categories = getCategories();
  const lowerSearch = searchTerm.toLowerCase();
  const filtered = lowerSearch
    ? products.filter(p => p.name.toLowerCase().includes(lowerSearch) || p.brand.toLowerCase().includes(lowerSearch))
    : products;

  container.innerHTML = `
    <div class="cms-table-toolbar">
      <div class="cms-search">
        <svg class="cms-search__icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input type="text" class="cms-search__input" placeholder="Buscar por nombre o marca..." id="cms-product-search" value="${searchTerm}">
      </div>
      <button class="cms-btn cms-btn--primary" id="btn-new-product">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nuevo producto
      </button>
    </div>
    <div class="cms-table-info" style="margin-bottom: var(--space-md);">${filtered.length} producto${filtered.length !== 1 ? 's' : ''} encontrado${filtered.length !== 1 ? 's' : ''}</div>
    <div class="cms-table-container">
      <table class="cms-table" id="cms-products-table">
        <thead>
          <tr>
            <th>Imagen</th>
            <th>Nombre</th>
            <th>Marca</th>
            <th>Categoría</th>
            <th>Precio</th>
            <th>Stock</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.length === 0 ? `
            <tr><td colspan="7" style="text-align: center; padding: var(--space-xl); color: var(--color-text-muted);">No se encontraron productos.</td></tr>
          ` : filtered.map(p => {
            const stockTotal = Object.values(p.stock || {}).reduce((s, v) => s + v, 0);
            return `
              <tr>
                <td><img src="${p.images[0]}" alt="${p.name}" class="cms-table__image" loading="lazy"></td>
                <td data-label="Nombre">${p.name}</td>
                <td data-label="Marca">${p.brand}</td>
                <td data-label="Categoría"><span class="cms-table__badge cms-table__badge--accent">${p.category}</span></td>
                <td data-label="Precio">${formatPrice(p.discountPrice || p.price)}</td>
                <td data-label="Stock">
                  <span class="cms-table__badge ${stockTotal === 0 ? 'cms-table__badge--error' : stockTotal < 10 ? 'cms-table__badge--warning' : 'cms-table__badge--active'}">${stockTotal}</span>
                </td>
                <td data-label="Acciones">
                  <div class="cms-table__actions">
                    <button class="cms-table__action-btn" title="Editar" data-edit-product="${p.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button class="cms-table__action-btn cms-table__action-btn--danger" title="Eliminar" data-delete-product="${p.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Bind events
  const searchInput = qs('#cms-product-search');
  if (searchInput) {
    let debounceTimer;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => renderProductList(e.target.value), 300);
    });
  }

  const newBtn = qs('#btn-new-product');
  if (newBtn) {
    newBtn.addEventListener('click', () => renderProductEdit(null));
  }

  qsa('[data-edit-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.editProduct, 10);
      const product = getProducts().find(p => p.id === id);
      if (product) renderProductEdit(product);
    });
  });

  qsa('[data-delete-product]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.deleteProduct, 10);
      const product = getProducts().find(p => p.id === id);
      if (product && confirm(`¿Eliminar "${product.name}"? Esta acción no se puede deshacer.`)) {
        const updated = getProducts().filter(p => p.id !== id);
        saveProducts(updated);
        showToast('Producto eliminado correctamente');
        renderProductList(searchInput?.value || '');
      }
    });
  });
}

// ── Product Edit Form ────────────────────────────────────────

function renderProductEdit(product) {
  const container = qs('#section-product-edit');
  if (!container) return;

  const isNew = !product;
  const p = product || {
    id: null, name: '', brand: '', category: '',
    price: 0, discountPrice: null,
    sizes: [], colors: [], images: [],
    description: '',
    specs: { upper: '', sole: '', weight: '' },
    rating: 0, reviews: 0,
    isNew: false, isBestseller: false,
    stock: {}
  };

  const categories = getCategories();
  const catOptions = categories.map(c =>
    `<option value="${c.id}" ${c.id === p.category ? 'selected' : ''}>${c.name}</option>`
  ).join('');

  const sizeCheckboxes = ALL_SIZES.map(s =>
    `<label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;">
      <input type="checkbox" class="cms-size-cb" value="${s}" ${p.sizes.includes(s) ? 'checked' : ''}> ${s}
    </label>`
  ).join('');

  container.innerHTML = `
    <div style="margin-bottom: var(--space-lg);">
      <button class="cms-btn cms-btn--ghost" id="btn-back-products">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Volver a Productos
      </button>
    </div>

    <div class="cms-product-edit">
      <!-- Main form -->
      <div>
        <div class="cms-tabs" id="product-edit-tabs">
          <button class="cms-tab is-active" data-tab="basic">Información Básica</button>
          <button class="cms-tab" data-tab="colors">Colores</button>
          <button class="cms-tab" data-tab="images">Imágenes</button>
          <button class="cms-tab" data-tab="sizes">Tallas</button>
          <button class="cms-tab" data-tab="stock">Stock</button>
          <button class="cms-tab" data-tab="reviews">Reseñas</button>
        </div>

        <form class="cms-form" id="product-form" style="max-width:100%;margin-top:var(--space-lg);">
          <!-- Tab: Información Básica -->
          <div class="cms-tab-content is-active" data-tab-content="basic">
            <div class="cms-form-group">
              <label for="p-name">Nombre</label>
              <input type="text" id="p-name" class="cms-form-input" value="${escHtml(p.name)}" required>
            </div>
            <div class="cms-form-group">
              <label for="p-brand">Marca</label>
              <input type="text" id="p-brand" class="cms-form-input" value="${escHtml(p.brand)}" required>
            </div>
            <div class="cms-form-row">
              <div class="cms-form-group">
                <label for="p-category">Categoría</label>
                <select id="p-category" class="cms-form-select" required>
                  <option value="">Seleccionar...</option>
                  ${catOptions}
                </select>
              </div>
              <div class="cms-form-group">
                <label for="p-price">Precio</label>
                <input type="number" id="p-price" class="cms-form-input" value="${p.price}" min="0" required>
              </div>
            </div>
            <div class="cms-form-row">
              <div class="cms-form-group">
                <label for="p-discountPrice">Precio con Descuento <span class="cms-form-optional">(opcional)</span></label>
                <input type="number" id="p-discountPrice" class="cms-form-input" value="${p.discountPrice ?? ''}" min="0" placeholder="Dejar vacío si no aplica">
              </div>
              <div class="cms-form-group">
                <label for="p-rating">Rating (0-5)</label>
                <input type="number" id="p-rating" class="cms-form-input" value="${p.rating}" min="0" max="5" step="0.1">
              </div>
            </div>
            <div class="cms-form-row">
              <div class="cms-form-group">
                <label for="p-reviews">Número de Reseñas</label>
                <input type="number" id="p-reviews" class="cms-form-input" value="${p.reviews}" min="0">
              </div>
              <div class="cms-form-group" style="justify-content:flex-end;">
                <div style="display:flex;gap:var(--space-lg);padding-top:var(--space-sm);">
                  <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;">
                    <input type="checkbox" id="p-isNew" ${p.isNew ? 'checked' : ''}> Nuevo
                  </label>
                  <label style="display:flex;align-items:center;gap:6px;font-size:var(--fs-sm);cursor:pointer;">
                    <input type="checkbox" id="p-isBestseller" ${p.isBestseller ? 'checked' : ''}> Más Vendido
                  </label>
                </div>
              </div>
            </div>
            <div class="cms-form-group">
              <label for="p-description">Descripción</label>
              <textarea id="p-description" class="cms-form-textarea" rows="4">${escHtml(p.description)}</textarea>
            </div>
            <div class="cms-form-row">
              <div class="cms-form-group">
                <label for="p-upper">Upper (Material)</label>
                <input type="text" id="p-upper" class="cms-form-input" value="${escHtml(p.specs.upper || '')}">
              </div>
              <div class="cms-form-group">
                <label for="p-sole">Suela</label>
                <input type="text" id="p-sole" class="cms-form-input" value="${escHtml(p.specs.sole || '')}">
              </div>
            </div>
            <div class="cms-form-group">
              <label for="p-weight">Peso</label>
              <input type="text" id="p-weight" class="cms-form-input" value="${escHtml(p.specs.weight || '')}" placeholder="ej: 300g">
            </div>
          </div>

          <!-- Tab: Colores -->
          <div class="cms-tab-content" data-tab-content="colors">
            <div class="cms-form-group">
              <label>Colores del Producto</label>
              <p class="cms-form-help">Agrega los colores disponibles. Cada color requiere nombre, código hex y URL de imagen.</p>
              <div id="cms-colors-list" style="display:flex;flex-direction:column;gap:var(--space-md);margin-top:var(--space-md);">
                ${p.colors.map((c, i) => colorRowHTML(c, i)).join('')}
              </div>
              <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-color" style="margin-top:var(--space-md);align-self:flex-start;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Agregar color
              </button>
            </div>
          </div>

          <!-- Tab: Imágenes -->
          <div class="cms-tab-content" data-tab-content="images">
            <div class="cms-form-group">
              <label>Imágenes del Producto</label>
              <p class="cms-form-help">URLs de las imágenes. La primera se usa como imagen principal.</p>
              <div class="cms-form-images" id="cms-images-list" style="margin-top:var(--space-md);">
                ${p.images.map((url, i) => imageRowHTML(url, i)).join('')}
              </div>
              <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-image" style="margin-top:var(--space-md);align-self:flex-start;">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Agregar imagen
              </button>
            </div>
          </div>

          <!-- Tab: Tallas -->
          <div class="cms-tab-content" data-tab-content="sizes">
            <div class="cms-form-group">
              <label>Tallas Disponibles</label>
              <p class="cms-form-help">Selecciona las tallas que ofrece este producto.</p>
              <div style="display:flex;flex-wrap:wrap;gap:var(--space-md);margin-top:var(--space-md);padding:var(--space-md);background:var(--color-surface-alt);border-radius:var(--radius-md);">
                ${sizeCheckboxes}
              </div>
            </div>
          </div>

          <!-- Tab: Stock -->
          <div class="cms-tab-content" data-tab-content="stock">
            <div class="cms-form-group">
              <label>Inventario por Talla × Color</label>
              <p class="cms-form-help">Define la cantidad disponible para cada combinación de talla y color.</p>
              <div class="cms-stock-grid" id="cms-stock-grid" style="margin-top:var(--space-md);">
                <p style="padding:var(--space-md);color:var(--color-text-muted);font-size:var(--fs-sm);">Selecciona al menos una talla y un color para generar la grilla de stock.</p>
              </div>
            </div>
          </div>

          <!-- Tab: Reseñas -->
          <div class="cms-tab-content" data-tab-content="reviews">
            <div class="cms-form-group">
              <label>Reseñas de Clientes</label>
              <p class="cms-form-help">Gestiona las reseñas de este producto. El número se actualiza automáticamente.</p>
              <div id="cms-reviews-area" style="margin-top:var(--space-md);">${p.id ? renderReviewsListHTML(p.id) : '<p style="color:var(--color-text-muted);font-size:var(--fs-sm);">Guarda el producto primero para gestionar reseñas.</p>'}</div>
            </div>
          </div>

          <!-- Actions -->
          <div class="cms-form-actions">
            <button type="submit" class="cms-btn cms-btn--primary" id="btn-save-product">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
              Guardar
            </button>
            <button type="button" class="cms-btn cms-btn--outline" id="btn-cancel-product">Cancelar</button>
          </div>
        </form>
      </div>

      <!-- Sidebar preview -->
      <div>
        <div class="cms-form-preview" id="product-preview">
          ${p.images[0]
            ? `<img src="${escHtml(p.images[0])}" alt="Preview">`
            : `<div class="cms-form-preview__placeholder">
                <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <span>Sin imagen</span>
              </div>`
          }
        </div>
        <div style="margin-top:var(--space-md);text-align:center;">
          <p style="font-size:var(--fs-sm);color:var(--color-text-muted);">Vista previa de la imagen principal</p>
        </div>
      </div>
    </div>
  `;

  // Show section
  qs('#section-products').style.display = 'none';
  container.style.display = 'block';

  // Update title
  const titleEl = qs('.cms-header__title');
  if (titleEl) titleEl.textContent = isNew ? 'Nuevo Producto' : 'Editar Producto';

  // Tab switching
  initProductTabs();

  // Bind color/image tab interactions
  bindProductEditEvents(p);

  // Form submit
  const form = qs('#product-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      saveProduct(p);
    });
  }

  // Cancel
  const cancelBtn = qs('#btn-cancel-product');
  if (cancelBtn) {
    cancelBtn.addEventListener('click', () => {
      goBack();
    });
  }

  // Back
  const backBtn = qs('#btn-back-products');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      goBack();
    });
  }
}

function colorRowHTML(color, index) {
  return `
    <div class="cms-form-colors" style="display:grid;grid-template-columns:1fr 80px 1fr 36px;gap:var(--space-sm);align-items:end;" data-color-index="${index}">
      <div class="cms-form-group" style="gap:4px;">
        <label style="font-size:var(--fs-xs);">Nombre</label>
        <input type="text" class="cms-form-input cms-color-name" value="${escHtml(color.name)}" placeholder="Negro">
      </div>
      <div class="cms-form-group" style="gap:4px;">
        <label style="font-size:var(--fs-xs);">Hex</label>
        <input type="color" class="cms-color-hex" value="${color.hex || '#000000'}" style="width:100%;height:36px;padding:2px;cursor:pointer;border:1px solid var(--color-border);border-radius:var(--radius-sm);">
      </div>
      <div class="cms-form-group" style="gap:4px;">
        <label style="font-size:var(--fs-xs);">URL Imagen</label>
        <input type="url" class="cms-form-input cms-color-image" value="${escHtml(color.image || '')}" placeholder="https://...">
      </div>
      <button type="button" class="cms-table__action-btn cms-table__action-btn--danger" title="Eliminar color" data-remove-color="${index}" style="margin-bottom:2px;">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `;
}

function imageRowHTML(url, index) {
  return `
    <div class="cms-form-images__item" data-image-index="${index}">
      <img class="cms-form-images__thumb" src="${escHtml(url)}" alt="Img ${index + 1}" onerror="this.style.display='none'">
      <input type="url" class="cms-form-input cms-form-images__input cms-image-url" value="${escHtml(url)}" placeholder="https://...">
      <button type="button" class="cms-form-images__remove" title="Eliminar" data-remove-image="${index}">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
      </button>
    </div>
  `;
}

function initProductTabs() {
  const tabs = qsa('#product-edit-tabs .cms-tab');
  const contents = qsa('#product-edit-tabs ~ form .cms-tab-content');

  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('is-active'));
      contents.forEach(c => c.classList.remove('is-active'));

      tab.classList.add('is-active');
      const target = tab.dataset.tab;
      contents.forEach(c => {
        if (c.dataset.tabContent === target) c.classList.add('is-active');
      });
    });
  });
}

function bindProductEditEvents(originalProduct) {
  // Add color
  const addColorBtn = qs('#btn-add-color');
  if (addColorBtn) {
    addColorBtn.addEventListener('click', () => {
      const list = qs('#cms-colors-list');
      const count = list.children.length;
      list.insertAdjacentHTML('beforeend', colorRowHTML({ name: '', hex: '#000000', image: '' }, count));
      bindRemoveColors();
    });
  }
  bindRemoveColors();

  // Add image
  const addImageBtn = qs('#btn-add-image');
  if (addImageBtn) {
    addImageBtn.addEventListener('click', () => {
      const list = qs('#cms-images-list');
      list.insertAdjacentHTML('beforeend', imageRowHTML('', list.children.length));
      bindRemoveImages();
    });
  }
  bindRemoveImages();

  // Update preview when first image URL changes
  const imagesList = qs('#cms-images-list');
  if (imagesList) {
    imagesList.addEventListener('input', (e) => {
      if (e.target.classList.contains('cms-image-url')) {
        updateProductPreview();
      }
    });
  }

  if (originalProduct.id) bindReviewsEvents(originalProduct);
}

function bindRemoveColors() {
  qsa('[data-remove-color]').forEach(btn => {
    btn.onclick = () => {
      const row = btn.closest('[data-color-index]');
      if (row) row.remove();
      // Re-index
      qsa('#cms-colors-list > div').forEach((el, i) => {
        el.dataset.colorIndex = i;
        const removeBtn = el.querySelector('[data-remove-color]');
        if (removeBtn) removeBtn.dataset.removeColor = i;
      });
    };
  });
}

function bindRemoveImages() {
  qsa('[data-remove-image]').forEach(btn => {
    btn.onclick = () => {
      const item = btn.closest('[data-image-index]');
      if (item) item.remove();
      // Re-index
      qsa('#cms-images-list .cms-form-images__item').forEach((el, i) => {
        el.dataset.imageIndex = i;
        const removeBtn = el.querySelector('[data-remove-image]');
        if (removeBtn) removeBtn.dataset.removeImage = i;
      });
    };
  });
}

function updateProductPreview() {
  const firstUrl = qs('#cms-images-list .cms-image-url');
  const preview = qs('#product-preview');
  if (!firstUrl || !preview) return;
  const url = firstUrl.value.trim();
  if (url) {
    preview.innerHTML = `<img src="${escHtml(url)}" alt="Preview" onerror="this.parentElement.innerHTML='<div class=\\'cms-form-preview__placeholder\\'><span>Imagen no válida</span></div>'">`;
  } else {
    preview.innerHTML = `<div class="cms-form-preview__placeholder">
      <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
      <span>Sin imagen</span>
    </div>`;
  }
}

// ── Reviews Tab ──────────────────────────────────────────────

function renderReviewsListHTML(productId) {
  const reviews = getReviews(productId);
  if (reviews.length === 0) {
    return `
      <div class="cms-empty-state">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
        <p>No hay reseñas aún.</p>
      </div>
      <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-review" style="margin-top:var(--space-md);">
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Agregar reseña
      </button>
    `;
  }

  const starsHTML = (rating) => {
    let html = '<span class="cms-review-stars">';
    for (let i = 1; i <= 5; i++) {
      if (i <= Math.floor(rating)) {
        html += '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';
      } else if (i - 0.5 <= rating) {
        html += '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" opacity="0.5"/></svg>';
      }
    }
    html += '</span>';
    return html;
  };

  return `
    <div class="cms-review-list" id="cms-review-list">
      ${reviews.map(r => `
        <div class="cms-review-card" data-review-id="${r.id}">
          <div class="cms-review-card__header">
            <div>
              <span class="cms-review-card__author">${escHtml(r.author)}</span>
              <span class="cms-review-card__date">${escHtml(r.date)}</span>
            </div>
            ${starsHTML(r.rating)}
          </div>
          <div class="cms-review-card__title">${escHtml(r.title)}</div>
          <p class="cms-review-card__text">${escHtml(r.text)}</p>
          <div class="cms-review-card__actions">
            <button type="button" class="cms-btn cms-btn--sm cms-btn--outline" data-edit-review="${r.id}">Editar</button>
            <button type="button" class="cms-btn cms-btn--sm cms-btn--outline" data-delete-review="${r.id}" style="color:var(--color-error,#e53e3e);border-color:var(--color-error,#e53e3e);">Eliminar</button>
          </div>
        </div>
      `).join('')}
    </div>
    <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-review" style="margin-top:var(--space-md);">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
      Agregar reseña
    </button>
  `;
}

function bindReviewsEvents(product) {
  if (!product.id) return;

  const addBtn = qs('#btn-add-review');
  if (addBtn) addBtn.addEventListener('click', () => showReviewForm(product.id, null));

  qsa('[data-edit-review]').forEach(btn => {
    btn.addEventListener('click', () => {
      const reviews = getReviews(product.id);
      const review = reviews.find(r => r.id === btn.dataset.editReview);
      if (review) showReviewForm(product.id, review);
    });
  });

  qsa('[data-delete-review]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (confirm('¿Eliminar esta reseña?')) {
        const reviews = getReviews(product.id).filter(r => r.id !== btn.dataset.deleteReview);
        saveReviews(product.id, reviews);
        updateReviewCount(product.id);
        const area = qs('#cms-reviews-area');
        if (area) { area.innerHTML = renderReviewsListHTML(product.id); bindReviewsEvents(product); }
        showToast('Reseña eliminada');
      }
    });
  });
}

function showReviewForm(productId, existingReview) {
  const isEdit = !!existingReview;
  const r = existingReview || { id: null, author: '', date: new Date().toISOString().slice(0, 10), rating: 5, title: '', text: '' };
  const area = qs('#cms-reviews-area');
  if (!area) return;

  const formHTML = `
    <div class="cms-review-form" id="review-form">
      <h4 style="font-size:var(--fs-sm);font-weight:600;color:var(--color-text-primary);margin:0;">${isEdit ? 'Editar' : 'Nueva'} Reseña</h4>
      <div class="cms-form-row">
        <div class="cms-form-group">
          <label for="rv-author">Autor</label>
          <input type="text" id="rv-author" class="cms-form-input" value="${escHtml(r.author)}" placeholder="Nombre del cliente" required>
        </div>
        <div class="cms-form-group">
          <label for="rv-date">Fecha</label>
          <input type="date" id="rv-date" class="cms-form-input" value="${r.date}" required>
        </div>
      </div>
      <div class="cms-form-group">
        <label for="rv-rating">Calificación</label>
        <select id="rv-rating" class="cms-form-select">
          ${[5, 4.5, 4, 3.5, 3, 2, 1, 0].map(v => `<option value="${v}" ${v === r.rating ? 'selected' : ''}>${v} estrella${v !== 1 ? 's' : ''}</option>`).join('')}
        </select>
      </div>
      <div class="cms-form-group">
        <label for="rv-title">Título</label>
        <input type="text" id="rv-title" class="cms-form-input" value="${escHtml(r.title)}" placeholder="Resumen breve" required>
      </div>
      <div class="cms-form-group">
        <label for="rv-text">Texto de la reseña</label>
        <textarea id="rv-text" class="cms-form-textarea" rows="3" placeholder="Opinión detallada..." required>${escHtml(r.text)}</textarea>
      </div>
      <div style="display:flex;gap:var(--space-sm);justify-content:flex-end;">
        <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="rv-cancel">Cancelar</button>
        <button type="button" class="cms-btn cms-btn--primary cms-btn--sm" id="rv-save">${isEdit ? 'Actualizar' : 'Guardar'}</button>
      </div>
    </div>
  `;

  const existingForm = qs('#review-form');
  if (existingForm) existingForm.remove();
  area.insertAdjacentHTML('beforeend', formHTML);

  qs('#rv-cancel').addEventListener('click', () => { const f = qs('#review-form'); if (f) f.remove(); });

  qs('#rv-save').addEventListener('click', () => {
    const author = qs('#rv-author').value.trim();
    const date = qs('#rv-date').value;
    const rating = parseFloat(qs('#rv-rating').value);
    const title = qs('#rv-title').value.trim();
    const text = qs('#rv-text').value.trim();

    if (!author || !title || !text) { showToast('Completa autor, título y texto.', 'error'); return; }

    const reviews = getReviews(productId);
    if (isEdit) {
      const idx = reviews.findIndex(rv => rv.id === existingReview.id);
      if (idx !== -1) reviews[idx] = { ...reviews[idx], author, date, rating, title, text };
    } else {
      reviews.unshift({ id: `r${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, author, date, rating, title, text });
    }

    saveReviews(productId, reviews);
    updateReviewCount(productId);
    area.innerHTML = renderReviewsListHTML(productId);
    bindReviewsEvents({ id: productId });
    showToast(isEdit ? 'Reseña actualizada' : 'Reseña agregada');
  });
}

function updateReviewCount(productId) {
  const reviews = getReviews(productId);
  const countEl = qs('#p-reviews');
  if (countEl) countEl.value = reviews.length;
}

function gatherProductData(original) {
  const name = qs('#p-name').value.trim();
  const brand = qs('#p-brand').value.trim();
  const category = qs('#p-category').value;
  const price = parseFloat(qs('#p-price').value) || 0;
  const discountPriceRaw = qs('#p-discountPrice').value;
  const discountPrice = discountPriceRaw !== '' ? parseFloat(discountPriceRaw) : null;
  const description = qs('#p-description').value.trim();
  const upper = qs('#p-upper').value.trim();
  const sole = qs('#p-sole').value.trim();
  const weight = qs('#p-weight').value.trim();
  const rating = parseFloat(qs('#p-rating').value) || 0;
  const reviews = parseInt(qs('#p-reviews').value, 10) || 0;
  const isNew = qs('#p-isNew').checked;
  const isBestseller = qs('#p-isBestseller').checked;

  const colors = [];
  qsa('#cms-colors-list > div').forEach(row => {
    const cname = row.querySelector('.cms-color-name')?.value.trim() || '';
    const chex = row.querySelector('.cms-color-hex')?.value || '#000000';
    const cimage = row.querySelector('.cms-color-image')?.value.trim() || '';
    if (cname || cimage) colors.push({ name: cname, hex: chex, image: cimage });
  });

  const images = [];
  qsa('#cms-images-list .cms-image-url').forEach(input => {
    const url = input.value.trim();
    if (url) images.push(url);
  });

  const sizes = [];
  qsa('.cms-size-cb:checked').forEach(cb => sizes.push(parseInt(cb.value, 10)));

  const stock = {};
  qsa('#cms-stock-grid input[type="number"]').forEach(input => {
    const size = input.dataset.stockSize;
    const color = input.dataset.stockColor;
    const val = parseInt(input.value, 10) || 0;
    if (size && color) stock[`${size}-${color}`] = val;
  });

  let reviewCount = reviews;
  if (original?.id) reviewCount = getReviews(original.id).length;

  return {
    id: original?.id || null,
    name, brand, category, price, discountPrice,
    sizes, colors, images, description,
    specs: { upper, sole, weight },
    rating, reviews: reviewCount, isNew, isBestseller, stock
  };
}

function saveProduct(original) {
  const data = gatherProductData(original);

  if (!data.name || !data.brand || !data.category) {
    showToast('Por favor completa nombre, marca y categoría.', 'error');
    return;
  }

  const products = getProducts();

  if (original?.id) {
    const idx = products.findIndex(p => p.id === original.id);
    if (idx !== -1) { data.id = original.id; products[idx] = data; }
  } else {
    data.id = generateId();
    products.push(data);
  }

  saveProducts(products);
  showToast(original?.id ? 'Producto actualizado correctamente' : 'Producto creado correctamente');
  goBack();
}

// ── Page Editor ──────────────────────────────────────────────

function renderPageList() {
  const container = qs('#section-pages');
  if (!container) return;

  const pages = getPages();

  container.innerHTML = `
    <div class="cms-table-toolbar">
      <div class="cms-table-info">${pages.length} página${pages.length !== 1 ? 's' : ''}</div>
    </div>
    <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:var(--space-lg);">
      ${pages.map(page => `
        <div class="cms-stat-card" style="flex-direction:column;gap:var(--space-md);cursor:pointer;" data-edit-page="${page.id}">
          <div style="display:flex;align-items:center;justify-content:space-between;width:100%;">
            <div>
              <h3 style="font-family:var(--font-display);font-size:var(--fs-md);font-weight:700;color:var(--color-text-primary);margin:0;">${escHtml(page.title)}</h3>
              <p style="font-size:var(--fs-xs);color:var(--color-text-muted);margin-top:4px;">${escHtml(page.slug)}</p>
            </div>
            <span class="cms-tag cms-tag--accent">${page.sections.length} secciones</span>
          </div>
          <p style="font-size:var(--fs-sm);color:var(--color-text-secondary);line-height:var(--lh-relaxed);">${escHtml(stripHtml(page.content)).slice(0, 120)}${stripHtml(page.content).length > 120 ? '...' : ''}</p>
          <button class="cms-btn cms-btn--sm cms-btn--outline" style="align-self:flex-start;">Editar</button>
        </div>
      `).join('')}
    </div>
  `;

  qsa('[data-edit-page]').forEach(card => {
    card.addEventListener('click', () => {
      const pageId = card.dataset.editPage;
      const page = pages.find(p => p.id === pageId);
      if (page) renderPageEdit(page);
    });
  });
}

function renderPageEdit(page) {
  const container = qs('#section-pages');
  if (!container) return;

  container.innerHTML = `
    <div style="margin-bottom:var(--space-lg);">
      <button class="cms-btn cms-btn--ghost" id="btn-back-pages">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
        Volver a Páginas
      </button>
    </div>

    <h3 style="font-family:var(--font-display);font-size:var(--fs-md);font-weight:700;color:var(--color-text-primary);margin-bottom:var(--space-lg);">Editar: ${escHtml(page.title)}</h3>

    <form class="cms-form" id="page-form" style="max-width:100%;">
      <div class="cms-form-group">
        <label for="pg-title">Título de la Página</label>
        <input type="text" id="pg-title" class="cms-form-input" value="${escHtml(page.title)}" required>
      </div>

      <div class="cms-form-group">
        <label for="pg-content">Contenido Principal (HTML)</label>
        <textarea id="pg-content" class="cms-form-textarea" rows="4">${escHtml(page.content)}</textarea>
      </div>

      <div style="border-top:1px solid var(--color-border);padding-top:var(--space-lg);margin-top:var(--space-sm);">
        <h4 style="font-size:var(--fs-sm);font-weight:600;color:var(--color-text-primary);margin-bottom:var(--space-md);">Secciones Editables</h4>
        <div style="display:flex;flex-direction:column;gap:var(--space-lg);">
          ${page.sections.map((sec, i) => `
            <div class="cms-form-group">
              <label for="pg-sec-${i}">${escHtml(sec.label)} <span class="cms-form-optional">(${sec.key})</span></label>
              <textarea id="pg-sec-${i}" class="cms-form-textarea" rows="3" data-section-key="${sec.key}">${escHtml(sec.content)}</textarea>
            </div>
          `).join('')}
        </div>
      </div>

      <div class="cms-form-actions">
        <button type="submit" class="cms-btn cms-btn--primary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Guardar Cambios
        </button>
        <button type="button" class="cms-btn cms-btn--outline" id="btn-cancel-page">Cancelar</button>
      </div>
    </form>
  `;

  const titleEl = qs('.cms-header__title');
  if (titleEl) titleEl.textContent = `Editar: ${page.title}`;

  // Back
  qs('#btn-back-pages')?.addEventListener('click', () => goBack());
  qs('#btn-cancel-page')?.addEventListener('click', () => goBack());

  // Save
  qs('#page-form')?.addEventListener('submit', (e) => {
    e.preventDefault();
    const pages = getPages();
    const idx = pages.findIndex(p => p.id === page.id);
    if (idx === -1) return;

    pages[idx].title = qs('#pg-title').value.trim() || page.title;
    pages[idx].content = qs('#pg-content').value.trim();

    // Update sections
    qsa('#page-form textarea[data-section-key]').forEach(textarea => {
      const key = textarea.dataset.sectionKey;
      const sec = pages[idx].sections.find(s => s.key === key);
      if (sec) sec.content = textarea.value;
    });

    savePages(pages);
    showToast('Página actualizada correctamente');
    goBack();
  });
}

// ── Category Management ──────────────────────────────────────

function renderCategoryList() {
  const container = qs('#section-categories');
  if (!container) return;

  const categories = getCategories();
  const products = getProducts();

  container.innerHTML = `
    <div class="cms-table-toolbar">
      <div class="cms-table-info">${categories.length} categorías</div>
      <button class="cms-btn cms-btn--primary" id="btn-add-category">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
        Nueva Categoría
      </button>
    </div>
    <div class="cms-table-container">
      <table class="cms-table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>ID</th>
            <th>Productos</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${categories.map(cat => {
            const count = products.filter(p => p.category === cat.id).length;
            return `
              <tr>
                <td data-label="Nombre">${escHtml(cat.name)}</td>
                <td data-label="ID"><span class="cms-tag">${escHtml(cat.id)}</span></td>
                <td data-label="Productos">
                  <span class="cms-table__badge ${count === 0 ? 'cms-table__badge--inactive' : 'cms-table__badge--active'}">${count}</span>
                </td>
                <td data-label="Acciones">
                  <div class="cms-table__actions">
                    <button class="cms-table__action-btn" title="Editar" data-edit-category="${cat.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/></svg>
                    </button>
                    <button class="cms-table__action-btn cms-table__action-btn--danger" title="Eliminar" data-delete-category="${cat.id}">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;

  // Add category
  qs('#btn-add-category')?.addEventListener('click', () => {
    showCategoryModal(null);
  });

  // Edit category
  qsa('[data-edit-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.editCategory;
      const cat = categories.find(c => c.id === catId);
      if (cat) showCategoryModal(cat);
    });
  });

  // Delete category
  qsa('[data-delete-category]').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.dataset.deleteCategory;
      const productCount = products.filter(p => p.category === catId).length;
      if (productCount > 0) {
        showToast(`No se puede eliminar: ${productCount} producto${productCount !== 1 ? 's' : ''} usa${productCount === 1 ? '' : 'n'} esta categoría.`, 'error');
        return;
      }
      if (confirm('¿Eliminar esta categoría?')) {
        const updated = categories.filter(c => c.id !== catId);
        saveCategories(updated);
        showToast('Categoría eliminada correctamente');
        renderCategoryList();
      }
    });
  });
}

function showCategoryModal(existingCat) {
  const isEdit = !!existingCat;
  const overlay = createEl('div', 'cms-modal-overlay is-open');
  overlay.innerHTML = `
    <div class="cms-modal">
      <div class="cms-modal__header">
        <h2 class="cms-modal__title">${isEdit ? 'Editar' : 'Nueva'} Categoría</h2>
        <button class="cms-modal__close" id="modal-close-cat">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>
      <div class="cms-modal__body">
        <div class="cms-form-group">
          <label for="cat-name">Nombre de la Categoría</label>
          <input type="text" id="cat-name" class="cms-form-input" value="${isEdit ? escHtml(existingCat.name) : ''}" placeholder="ej: Running" required>
          <p class="cms-form-help">El ID se generará automáticamente a partir del nombre (minúsculas, sin espacios).</p>
        </div>
      </div>
      <div class="cms-modal__footer">
        <button class="cms-btn cms-btn--outline" id="modal-cancel-cat">Cancelar</button>
        <button class="cms-btn cms-btn--primary" id="modal-save-cat">${isEdit ? 'Guardar' : 'Crear'}</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  const closeModal = () => overlay.remove();

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  qs('#modal-close-cat', overlay)?.addEventListener('click', closeModal);
  qs('#modal-cancel-cat', overlay)?.addEventListener('click', closeModal);

  qs('#modal-save-cat', overlay)?.addEventListener('click', () => {
    const name = qs('#cat-name', overlay)?.value.trim();
    if (!name) {
      showToast('El nombre es obligatorio.', 'error');
      return;
    }

    const categories = getCategories();

    if (isEdit) {
      const idx = categories.findIndex(c => c.id === existingCat.id);
      if (idx !== -1) {
        categories[idx].name = name;
      }
    } else {
      const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      if (categories.some(c => c.id === id)) {
        showToast('Ya existe una categoría con ese nombre.', 'error');
        return;
      }
      categories.push({ id, name, count: 0 });
    }

    saveCategories(categories);
    closeModal();
    showToast(isEdit ? 'Categoría actualizada' : 'Categoría creada');
    renderCategoryList();
  });
}

// ── Utilities ────────────────────────────────────────────────

function escHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(html) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  return tmp.textContent || tmp.innerText || '';
}

// ── Site Content Editor ──────────────────────────────────────

function renderSiteContent() {
  const container = qs('#section-site-content');
  if (!container) return;
  const sc = getSiteContent();

  container.innerHTML = `
    <div class="cms-table-toolbar">
      <div class="cms-table-info">Edita el contenido visible en la tienda</div>
    </div>
    ${siteContentNavAccordion(sc)}
    ${siteContentHeroAccordion(sc)}
    ${siteContentSectionsAccordion(sc)}
    ${siteContentTestimonialsAccordion(sc)}
    ${siteContentFooterAccordion(sc)}
    <div class="cms-save-bar">
      <button type="button" class="cms-btn cms-btn--primary" id="btn-save-site-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        Guardar Contenido
      </button>
    </div>
  `;

  qsa('.cms-accordion__header').forEach(h => h.addEventListener('click', () => h.parentElement.classList.toggle('is-collapsed')));
  bindNavLinksEvents();
  bindTestimonialEvents();
  bindFooterLinksEvents();
  bindPaymentBadgesEvents();

  qs('#sc-hero-image-url')?.addEventListener('input', function() {
    const p = qs('#sc-hero-image-preview');
    if (p) { p.src = this.value.trim(); p.style.display = this.value.trim() ? 'block' : 'none'; }
  });

  const colorPicker = qs('#sc-accent-color');
  const colorHex = qs('#sc-accent-color-hex');
  if (colorPicker && colorHex) {
    colorPicker.addEventListener('input', function() { colorHex.value = this.value; liveAccentPreview(this.value); });
    colorHex.addEventListener('input', function() {
      const v = this.value.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(v)) { colorPicker.value = v; liveAccentPreview(v); }
    });
    colorHex.addEventListener('blur', function() {
      let v = this.value.trim();
      if (/^#[0-9a-fA-F]{3}$/.test(v)) v = '#' + v[1]+v[1]+v[2]+v[2]+v[3]+v[3];
      if (/^#[0-9a-fA-F]{6}$/.test(v)) { this.value = v; colorPicker.value = v; liveAccentPreview(v); }
    });
  }

  qs('#btn-save-site-content')?.addEventListener('click', saveSiteContentHandler);
}

function acc(title, body, collapsed = true) {
  return `<div class="cms-accordion ${collapsed ? 'is-collapsed' : ''}"><button type="button" class="cms-accordion__header"><span>${title}</span><svg class="cms-accordion__chevron" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button><div class="cms-accordion__body">${body}</div></div>`;
}

function siteContentNavAccordion(sc) {
  const linksHTML = sc.navLinks.map((l, i) => `
    <div class="cms-link-row" data-nav-idx="${i}">
      <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Etiqueta</label><input type="text" class="cms-form-input sc-nav-label" value="${escHtml(l.label)}"></div>
      <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Enlace</label><input type="text" class="cms-form-input sc-nav-href" value="${escHtml(l.href)}"></div>
      <button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-nav="${i}" style="margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>`).join('');
  return acc('Marca / Navegación', `
    <div class="cms-form-row">
      <div class="cms-form-group" style="flex:2;"><label>Nombre de la Tienda</label><input type="text" class="cms-form-input" id="sc-site-name" value="${escHtml(sc.siteName)}"></div>
      <div class="cms-form-group" style="flex:1;min-width:140px;"><label>Color de Marca (Accent)</label><div style="display:flex;gap:var(--space-sm);align-items:center;"><input type="color" id="sc-accent-color" value="${escHtml(sc.accentColor || '#FF6B35')}" style="width:44px;height:36px;border:1px solid var(--color-border);border-radius:var(--radius-sm);cursor:pointer;padding:2px;background:var(--color-surface);"><input type="text" class="cms-form-input" id="sc-accent-color-hex" value="${escHtml(sc.accentColor || '#FF6B35')}" style="flex:1;font-family:monospace;"></div></div>
    </div>
    <div class="cms-form-group"><label>Enlaces de Navegación</label><div id="sc-nav-links" style="display:flex;flex-direction:column;gap:var(--space-sm);margin-top:var(--space-sm);">${linksHTML}</div>
      <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-nav-link" style="margin-top:var(--space-sm);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Agregar enlace</button>
    </div>`, false);
}

function siteContentHeroAccordion(sc) {
  return acc('Hero', `
    <div class="cms-form-row">
      <div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-hero-eyebrow" value="${escHtml(sc.heroEyebrow)}"></div>
      <div class="cms-form-group"><label>Texto CTA</label><input type="text" class="cms-form-input" id="sc-hero-cta" value="${escHtml(sc.heroCtaText)}"></div>
    </div>
    <div class="cms-form-row">
      <div class="cms-form-group"><label>Título (parte 1)</label><input type="text" class="cms-form-input" id="sc-hero-title" value="${escHtml(sc.heroTitle)}"></div>
      <div class="cms-form-group"><label>Título (acento)</label><input type="text" class="cms-form-input" id="sc-hero-title-accent" value="${escHtml(sc.heroTitleAccent)}"></div>
    </div>
    <div class="cms-form-group"><label>Subtítulo</label><textarea class="cms-form-textarea" id="sc-hero-subtitle" rows="2">${escHtml(sc.heroSubtitle)}</textarea></div>
    <div class="cms-form-group"><label>URL Imagen Hero</label><input type="url" class="cms-form-input" id="sc-hero-image-url" value="${escHtml(sc.heroImageUrl)}"><img id="sc-hero-image-preview" src="${escHtml(sc.heroImageUrl)}" alt="Preview" style="margin-top:var(--space-sm);width:120px;height:80px;object-fit:cover;border-radius:var(--radius-sm);display:${sc.heroImageUrl ? 'block' : 'none'};"></div>
    <div class="cms-form-row">
      <div class="cms-form-group"><label>Estadística 1</label><input type="text" class="cms-form-input" id="sc-hero-stat1" value="${escHtml(sc.heroStat1)}"></div>
      <div class="cms-form-group"><label>Estadística 2</label><input type="text" class="cms-form-input" id="sc-hero-stat2" value="${escHtml(sc.heroStat2)}"></div>
    </div>
    <div class="cms-form-group"><label>Estadística 3</label><input type="text" class="cms-form-input" id="sc-hero-stat3" value="${escHtml(sc.heroStat3)}"></div>`);
}

function siteContentSectionsAccordion(sc) {
  return acc('Secciones Home', `
    <div style="display:flex;flex-direction:column;gap:var(--space-lg);">
      <div><h4 style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Categorías</h4>
        <div class="cms-form-row"><div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-categories-eyebrow" value="${escHtml(sc.categoriesEyebrow)}"></div><div class="cms-form-group"><label>Título</label><input type="text" class="cms-form-input" id="sc-categories-title" value="${escHtml(sc.categoriesTitle)}"></div></div>
        <div class="cms-form-group"><label>Subtítulo</label><textarea class="cms-form-textarea" id="sc-categories-subtitle" rows="2">${escHtml(sc.categoriesSubtitle)}</textarea></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:var(--space-md);"><h4 style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Destacados</h4>
        <div class="cms-form-row"><div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-featured-eyebrow" value="${escHtml(sc.featuredEyebrow)}"></div><div class="cms-form-group"><label>Título</label><input type="text" class="cms-form-input" id="sc-featured-title" value="${escHtml(sc.featuredTitle)}"></div></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:var(--space-md);"><h4 style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Producto Destacado</h4>
        <div class="cms-form-row"><div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-showcase-eyebrow" value="${escHtml(sc.showcaseEyebrow)}"></div><div class="cms-form-group"><label>ID Producto</label><input type="number" class="cms-form-input" id="sc-showcase-product-id" value="${sc.showcaseProductId}" min="1"></div></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:var(--space-md);"><h4 style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Nuestra Historia</h4>
        <div class="cms-form-row"><div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-timeline-eyebrow" value="${escHtml(sc.timelineEyebrow)}"></div><div class="cms-form-group"><label>Título</label><input type="text" class="cms-form-input" id="sc-timeline-title" value="${escHtml(sc.timelineTitle)}"></div></div>
      </div>
      <div style="border-top:1px solid var(--color-border);padding-top:var(--space-md);"><h4 style="font-size:var(--fs-xs);font-weight:600;color:var(--color-text-muted);margin-bottom:var(--space-sm);">Newsletter</h4>
        <div class="cms-form-row"><div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-newsletter-eyebrow" value="${escHtml(sc.newsletterEyebrow)}"></div><div class="cms-form-group"><label>Título</label><input type="text" class="cms-form-input" id="sc-newsletter-title" value="${escHtml(sc.newsletterTitle)}"></div></div>
        <div class="cms-form-group"><label>Subtítulo</label><textarea class="cms-form-textarea" id="sc-newsletter-subtitle" rows="2">${escHtml(sc.newsletterSubtitle)}</textarea></div>
        <div class="cms-form-group"><label>Texto Botón</label><input type="text" class="cms-form-input" id="sc-newsletter-cta" value="${escHtml(sc.newsletterCtaText)}"></div>
      </div>
    </div>`);
}

function siteContentTestimonialsAccordion(sc) {
  const cardsHTML = sc.testimonials.map((t, i) => `
    <div class="cms-testimonial-card" data-tidx="${i}">
      <img class="cms-testimonial-card__photo" src="${escHtml(t.photo)}" alt="${escHtml(t.name)}" onerror="this.src=''">
      <div class="cms-testimonial-card__info">
        <div class="cms-form-row" style="margin-bottom:var(--space-sm);">
          <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Nombre</label><input type="text" class="cms-form-input sc-testi-name" value="${escHtml(t.name)}"></div>
          <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Rol</label><input type="text" class="cms-form-input sc-testi-role" value="${escHtml(t.role)}"></div>
        </div>
        <div class="cms-form-row" style="margin-bottom:var(--space-sm);">
          <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Foto URL</label><input type="url" class="cms-form-input sc-testi-photo" value="${escHtml(t.photo)}"></div>
          <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Rating</label><select class="cms-form-select sc-testi-rating">${[5,4.5,4,3.5,3,2,1,0].map(v => `<option value="${v}" ${v === t.rating ? 'selected' : ''}>${v}</option>`).join('')}</select></div>
        </div>
        <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Texto</label><textarea class="cms-form-textarea sc-testi-text" rows="2">${escHtml(t.text)}</textarea></div>
      </div>
      <button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-testi="${i}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>`).join('');

  return acc('Testimonios', `
    <div class="cms-form-row" style="margin-bottom:var(--space-md);"><div class="cms-form-group"><label>Eyebrow</label><input type="text" class="cms-form-input" id="sc-testimonials-eyebrow" value="${escHtml(sc.testimonialsEyebrow)}"></div><div class="cms-form-group"><label>Título</label><input type="text" class="cms-form-input" id="sc-testimonials-title" value="${escHtml(sc.testimonialsTitle)}"></div></div>
    <div class="cms-testimonial-list" id="sc-testimonials-list">${cardsHTML}</div>
    <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-testimonial" style="margin-top:var(--space-md);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Agregar testimonio</button>`);
}

function siteContentFooterAccordion(sc) {
  const tiendaLinks = sc.footerTiendaLinks.map((l, i) => `
    <div class="cms-link-row" data-ft-idx="${i}">
      <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Etiqueta</label><input type="text" class="cms-form-input sc-ft-label" value="${escHtml(l.label)}"></div>
      <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Enlace</label><input type="text" class="cms-form-input sc-ft-href" value="${escHtml(l.href)}"></div>
      <button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-ft="${i}" style="margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>`).join('');

  const ayudaLinks = sc.footerAyudaLinks.map((l, i) => `
    <div class="cms-link-row" data-fa-idx="${i}">
      <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Etiqueta</label><input type="text" class="cms-form-input sc-fa-label" value="${escHtml(l.label)}"></div>
      <div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Enlace</label><input type="text" class="cms-form-input sc-fa-href" value="${escHtml(l.href)}"></div>
      <button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-fa="${i}" style="margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
    </div>`).join('');

  return acc('Footer', `
    <div class="cms-form-group"><label>Descripción</label><textarea class="cms-form-textarea" id="sc-footer-desc" rows="2">${escHtml(sc.footerDescription)}</textarea></div>
    <div class="cms-form-row">
      <div class="cms-form-group"><label>Facebook URL</label><input type="url" class="cms-form-input" id="sc-footer-facebook" value="${escHtml(sc.footerSocial.facebook)}"></div>
      <div class="cms-form-group"><label>Instagram URL</label><input type="url" class="cms-form-input" id="sc-footer-instagram" value="${escHtml(sc.footerSocial.instagram)}"></div>
      <div class="cms-form-group"><label>Twitter URL</label><input type="url" class="cms-form-input" id="sc-footer-twitter" value="${escHtml(sc.footerSocial.twitter)}"></div>
    </div>
    <div class="cms-form-group"><label>${escHtml(sc.footerTiendaTitle)} — Enlaces</label><div id="sc-footer-tienda-links" style="display:flex;flex-direction:column;gap:var(--space-sm);margin-top:var(--space-sm);">${tiendaLinks}</div>
      <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-ft-link" style="margin-top:var(--space-sm);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Agregar enlace</button>
    </div>
    <div class="cms-form-group"><label>${escHtml(sc.footerAyudaTitle)} — Enlaces</label><div id="sc-footer-ayuda-links" style="display:flex;flex-direction:column;gap:var(--space-sm);margin-top:var(--space-sm);">${ayudaLinks}</div>
      <button type="button" class="cms-btn cms-btn--outline cms-btn--sm" id="btn-add-fa-link" style="margin-top:var(--space-sm);"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Agregar enlace</button>
    </div>
    <div class="cms-form-group"><label>Texto de Pagos (separado por coma)</label><input type="text" class="cms-form-input" id="sc-footer-pagos" value="${escHtml(sc.footerPagosBadges.join(', '))}"></div>
    <div class="cms-form-group"><label>Copyright</label><input type="text" class="cms-form-input" id="sc-footer-copyright" value="${escHtml(sc.footerCopyright)}"></div>`);
}

function bindNavLinksEvents() {
  qs('#btn-add-nav-link')?.addEventListener('click', () => {
    const list = qs('#sc-nav-links');
    const i = list.children.length;
    list.insertAdjacentHTML('beforeend', `<div class="cms-link-row" data-nav-idx="${i}"><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Etiqueta</label><input type="text" class="cms-form-input sc-nav-label" value=""></div><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Enlace</label><input type="text" class="cms-form-input sc-nav-href" value=""></div><button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-nav="${i}" style="margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>`);
    rebindRemoveNav();
  });
  rebindRemoveNav();
}

function rebindRemoveNav() {
  qsa('[data-remove-nav]').forEach(btn => btn.onclick = () => {
    btn.closest('[data-nav-idx]')?.remove();
    qsa('#sc-nav-links [data-nav-idx]').forEach((el, i) => { el.dataset.navIdx = i; const b = el.querySelector('[data-remove-nav]'); if (b) b.dataset.removeNav = i; });
  });
}

function bindTestimonialEvents() {
  qs('#btn-add-testimonial')?.addEventListener('click', () => {
    const list = qs('#sc-testimonials-list');
    const i = list.children.length;
    list.insertAdjacentHTML('beforeend', `<div class="cms-testimonial-card" data-tidx="${i}"><img class="cms-testimonial-card__photo" src="" alt="" onerror="this.src=''"><div class="cms-testimonial-card__info"><div class="cms-form-row" style="margin-bottom:var(--space-sm);"><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Nombre</label><input type="text" class="cms-form-input sc-testi-name" value=""></div><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Rol</label><input type="text" class="cms-form-input sc-testi-role" value=""></div></div><div class="cms-form-row" style="margin-bottom:var(--space-sm);"><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Foto URL</label><input type="url" class="cms-form-input sc-testi-photo" value=""></div><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Rating</label><select class="cms-form-select sc-testi-rating">${[5,4.5,4,3.5,3,2,1,0].map(v => `<option value="${v}">${v}</option>`).join('')}</select></div></div><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Texto</label><textarea class="cms-form-textarea sc-testi-text" rows="2"></textarea></div></div><button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-testi="${i}"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>`);
    rebindRemoveTesti();
  });
  rebindRemoveTesti();
}

function rebindRemoveTesti() {
  qsa('[data-remove-testi]').forEach(btn => btn.onclick = () => {
    btn.closest('[data-tidx]')?.remove();
    qsa('#sc-testimonials-list [data-tidx]').forEach((el, i) => { el.dataset.tidx = i; const b = el.querySelector('[data-remove-testi]'); if (b) b.dataset.removeTesti = i; });
  });
}

function bindFooterLinksEvents() {
  qs('#btn-add-ft-link')?.addEventListener('click', () => {
    const list = qs('#sc-footer-tienda-links');
    const i = list.children.length;
    list.insertAdjacentHTML('beforeend', `<div class="cms-link-row" data-ft-idx="${i}"><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Etiqueta</label><input type="text" class="cms-form-input sc-ft-label" value=""></div><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Enlace</label><input type="text" class="cms-form-input sc-ft-href" value=""></div><button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-ft="${i}" style="margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>`);
    rebindRemoveFt();
  });
  rebindRemoveFt();

  qs('#btn-add-fa-link')?.addEventListener('click', () => {
    const list = qs('#sc-footer-ayuda-links');
    const i = list.children.length;
    list.insertAdjacentHTML('beforeend', `<div class="cms-link-row" data-fa-idx="${i}"><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Etiqueta</label><input type="text" class="cms-form-input sc-fa-label" value=""></div><div class="cms-form-group" style="gap:4px;"><label style="font-size:var(--fs-xs);">Enlace</label><input type="text" class="cms-form-input sc-fa-href" value=""></div><button type="button" class="cms-table__action-btn cms-table__action-btn--danger" data-remove-fa="${i}" style="margin-bottom:2px;"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button></div>`);
    rebindRemoveFa();
  });
  rebindRemoveFa();
}

function rebindRemoveFt() {
  qsa('[data-remove-ft]').forEach(btn => btn.onclick = () => {
    btn.closest('[data-ft-idx]')?.remove();
    qsa('#sc-footer-tienda-links [data-ft-idx]').forEach((el, i) => { el.dataset.ftIdx = i; const b = el.querySelector('[data-remove-ft]'); if (b) b.dataset.removeFt = i; });
  });
}

function rebindRemoveFa() {
  qsa('[data-remove-fa]').forEach(btn => btn.onclick = () => {
    btn.closest('[data-fa-idx]')?.remove();
    qsa('#sc-footer-ayuda-links [data-fa-idx]').forEach((el, i) => { el.dataset.faIdx = i; const b = el.querySelector('[data-remove-fa]'); if (b) b.dataset.removeFa = i; });
  });
}

function bindPaymentBadgesEvents() {}

function saveSiteContentHandler() {
  const sc = getSiteContent();

  sc.siteName = qs('#sc-site-name')?.value.trim() || sc.siteName;
  sc.accentColor = qs('#sc-accent-color')?.value.trim() || sc.accentColor || '#FF6B35';
  sc.navLinks = [];
  qsa('#sc-nav-links .cms-link-row').forEach(row => {
    const label = row.querySelector('.sc-nav-label')?.value.trim();
    const href = row.querySelector('.sc-nav-href')?.value.trim();
    if (label) sc.navLinks.push({ label, href: href || '#' });
  });

  sc.heroEyebrow = qs('#sc-hero-eyebrow')?.value.trim() || sc.heroEyebrow;
  sc.heroTitle = qs('#sc-hero-title')?.value.trim() || sc.heroTitle;
  sc.heroTitleAccent = qs('#sc-hero-title-accent')?.value.trim() || sc.heroTitleAccent;
  sc.heroSubtitle = qs('#sc-hero-subtitle')?.value.trim() || sc.heroSubtitle;
  sc.heroCtaText = qs('#sc-hero-cta')?.value.trim() || sc.heroCtaText;
  sc.heroImageUrl = qs('#sc-hero-image-url')?.value.trim() || sc.heroImageUrl;
  sc.heroStat1 = qs('#sc-hero-stat1')?.value.trim() || sc.heroStat1;
  sc.heroStat2 = qs('#sc-hero-stat2')?.value.trim() || sc.heroStat2;
  sc.heroStat3 = qs('#sc-hero-stat3')?.value.trim() || sc.heroStat3;

  sc.categoriesEyebrow = qs('#sc-categories-eyebrow')?.value.trim() || sc.categoriesEyebrow;
  sc.categoriesTitle = qs('#sc-categories-title')?.value.trim() || sc.categoriesTitle;
  sc.categoriesSubtitle = qs('#sc-categories-subtitle')?.value.trim() || sc.categoriesSubtitle;
  sc.featuredEyebrow = qs('#sc-featured-eyebrow')?.value.trim() || sc.featuredEyebrow;
  sc.featuredTitle = qs('#sc-featured-title')?.value.trim() || sc.featuredTitle;
  sc.showcaseEyebrow = qs('#sc-showcase-eyebrow')?.value.trim() || sc.showcaseEyebrow;
  sc.showcaseProductId = parseInt(qs('#sc-showcase-product-id')?.value, 10) || 1;
  sc.timelineEyebrow = qs('#sc-timeline-eyebrow')?.value.trim() || sc.timelineEyebrow;
  sc.timelineTitle = qs('#sc-timeline-title')?.value.trim() || sc.timelineTitle;

  sc.newsletterEyebrow = qs('#sc-newsletter-eyebrow')?.value.trim() || sc.newsletterEyebrow;
  sc.newsletterTitle = qs('#sc-newsletter-title')?.value.trim() || sc.newsletterTitle;
  sc.newsletterSubtitle = qs('#sc-newsletter-subtitle')?.value.trim() || sc.newsletterSubtitle;
  sc.newsletterCtaText = qs('#sc-newsletter-cta')?.value.trim() || sc.newsletterCtaText;

  sc.testimonialsEyebrow = qs('#sc-testimonials-eyebrow')?.value.trim() || sc.testimonialsEyebrow;
  sc.testimonialsTitle = qs('#sc-testimonials-title')?.value.trim() || sc.testimonialsTitle;
  sc.testimonials = [];
  qsa('#sc-testimonials-list .cms-testimonial-card').forEach(card => {
    const name = card.querySelector('.sc-testi-name')?.value.trim();
    if (name) {
      sc.testimonials.push({
        name,
        role: card.querySelector('.sc-testi-role')?.value.trim() || '',
        photo: card.querySelector('.sc-testi-photo')?.value.trim() || '',
        rating: parseFloat(card.querySelector('.sc-testi-rating')?.value) || 5,
        text: card.querySelector('.sc-testi-text')?.value.trim() || ''
      });
    }
  });

  sc.footerDescription = qs('#sc-footer-desc')?.value.trim() || sc.footerDescription;
  sc.footerSocial = {
    facebook: qs('#sc-footer-facebook')?.value.trim() || '#',
    instagram: qs('#sc-footer-instagram')?.value.trim() || '#',
    twitter: qs('#sc-footer-twitter')?.value.trim() || '#'
  };
  sc.footerTiendaLinks = [];
  qsa('#sc-footer-tienda-links .cms-link-row').forEach(row => {
    const label = row.querySelector('.sc-ft-label')?.value.trim();
    if (label) sc.footerTiendaLinks.push({ label, href: row.querySelector('.sc-ft-href')?.value.trim() || '#' });
  });
  sc.footerAyudaLinks = [];
  qsa('#sc-footer-ayuda-links .cms-link-row').forEach(row => {
    const label = row.querySelector('.sc-fa-label')?.value.trim();
    if (label) sc.footerAyudaLinks.push({ label, href: row.querySelector('.sc-fa-href')?.value.trim() || '#' });
  });
  sc.footerPagosBadges = (qs('#sc-footer-pagos')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
  sc.footerCopyright = qs('#sc-footer-copyright')?.value.trim() || sc.footerCopyright;

  saveSiteContentData(sc);
  showToast('Contenido del sitio guardado correctamente');
}

// ── Build CMS DOM ────────────────────────────────────────────

function buildCMSLayout() {
  const body = document.body;
  body.innerHTML = '';
  body.style.margin = '0';

  // Sidebar overlay (mobile)
  const overlay = createEl('div', 'cms-sidebar-overlay');
  body.appendChild(overlay);

  const layout = createEl('div', 'cms-layout');

  // Sidebar
  const sidebar = createEl('aside', 'cms-sidebar');
  sidebar.innerHTML = `
    <div class="cms-sidebar__logo">
      <div class="cms-sidebar__logo-text">Sole<span class="cms-sidebar__logo-accent">Style</span></div>
      <div class="cms-sidebar__logo-sub">Panel de Administración</div>
    </div>
    <nav class="cms-sidebar__nav">
      <div class="cms-sidebar__section-label">Principal</div>
      <a href="#" class="cms-sidebar__link is-active" data-section="dashboard">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
        Dashboard
      </a>
      <div class="cms-sidebar__section-label">Gestión</div>
      <a href="#" class="cms-sidebar__link" data-section="products">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
        Productos
        <span class="cms-sidebar__link-badge" id="sidebar-product-count"></span>
      </a>
      <a href="#" class="cms-sidebar__link" data-section="pages">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z"/><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M10 9H8"/><path d="M16 13H8"/><path d="M16 17H8"/></svg>
        Páginas
      </a>
      <a href="#" class="cms-sidebar__link" data-section="categories">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2H2v10h10V2z"/><path d="M12 12H2v10h10V12z"/><path d="M22 2h-6v6h6V2z"/><path d="M22 12h-6v10h6V12z"/></svg>
        Categorías
      </a>
      <a href="#" class="cms-sidebar__link" data-section="site-content">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        Contenido del Sitio
      </a>
    </nav>
    <div class="cms-sidebar__footer">
      <div style="font-size:var(--fs-xs);color:rgba(255,255,255,0.4);margin-bottom:var(--space-sm);">Conectado como</div>
      <div style="font-size:var(--fs-sm);font-weight:600;color:var(--color-white);margin-bottom:var(--space-sm);" id="cmsUser"></div>
      <button class="cms-sidebar__logout" id="cmsLogout">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        Cerrar Sesión
      </button>
    </div>
  `;
  layout.appendChild(sidebar);

  // Main content
  const main = createEl('main', 'cms-main');
  main.innerHTML = `
    <div class="cms-header">
      <button class="cms-sidebar-toggle" id="cms-sidebar-toggle">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      </button>
      <h1 class="cms-header__title">Dashboard</h1>
      <div class="cms-header__actions"></div>
    </div>

    <div class="cms-section" id="section-dashboard" style="display:block;"></div>
    <div class="cms-section" id="section-products" style="display:none;"></div>
    <div class="cms-section" id="section-product-edit" style="display:none;"></div>
    <div class="cms-section" id="section-pages" style="display:none;"></div>
    <div class="cms-section" id="section-categories" style="display:none;"></div>
    <div class="cms-section" id="section-site-content" style="display:none;"></div>
  `;
  layout.appendChild(main);

  body.appendChild(layout);
}

// ── Init ─────────────────────────────────────────────────────

function init() {
  if (!checkAuth()) return;

  buildCMSLayout();

  // Set user
  const user = getCurrentUser();
  const userEl = qs('#cmsUser');
  if (userEl && user) userEl.textContent = user;

  // Logout
  const logoutBtn = qs('#cmsLogout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      logout();
      window.location.href = 'login.html';
    });
  }

  // Sidebar navigation
  qsa('.cms-sidebar__link[data-section]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(link.dataset.section);
      // Close mobile sidebar
      qs('.cms-sidebar')?.classList.remove('is-open');
      qs('.cms-sidebar-overlay')?.classList.remove('is-open');
    });
  });

  // Sidebar toggle (mobile)
  initSidebar();

  // Update sidebar badge
  const badge = qs('#sidebar-product-count');
  if (badge) badge.textContent = getProducts().length;

  // Initial render
  renderDashboard();

  applyAccentColorCMS();
}

function applyAccentColorCMS() {
  const existing = document.querySelector('[data-accent-override]');
  if (existing) existing.remove();
  try {
    const sc = getSiteContent();
    const hex = sc.accentColor;
    if (!hex || hex === '#FF6B35') return;
    injectAccentStyle(hex);
  } catch (_) {}
}

function liveAccentPreview(hex) {
  if (!hex || hex === '#FF6B35') {
    const existing = document.querySelector('[data-accent-override]');
    if (existing) existing.remove();
    return;
  }
  injectAccentStyle(hex);
}

function injectAccentStyle(hex) {
  const existing = document.querySelector('[data-accent-override]');
  if (existing) existing.remove();
  const h = hex.replace('#', '');
  const bigint = parseInt(h.length === 3 ? h.split('').map(c => c + c).join('') : h, 16);
  const r = (bigint >> 16) & 255, g = (bigint >> 8) & 255, b = bigint & 255;
  const f = 0.88;
  const dark = `rgb(${Math.round(r*f)},${Math.round(g*f)},${Math.round(b*f)})`;
  const tag = document.createElement('style');
  tag.setAttribute('data-accent-override', '');
  tag.textContent = `:root{--color-accent:${hex}!important;--color-accent-dark:${dark}!important;--color-accent-soft:rgba(${r},${g},${b},0.06)!important;--color-border-accent:rgba(${r},${g},${b},0.3)!important;--shadow-accent:0 8px 24px rgba(${r},${g},${b},0.30)!important;--shadow-accent-lg:0 12px 32px rgba(${r},${g},${b},0.40)!important;--shadow-glow:0 0 20px rgba(${r},${g},${b},0.15)!important}[data-theme="dark"]{--color-accent-soft:rgba(${r},${g},${b},0.12)!important;--color-border-accent:rgba(${r},${g},${b},0.25)!important;--shadow-accent:0 8px 24px rgba(${r},${g},${b},0.25)!important;--shadow-accent-lg:0 12px 32px rgba(${r},${g},${b},0.35)!important;--shadow-glow:0 0 24px rgba(${r},${g},${b},0.2)!important}`;
  document.head.appendChild(tag);
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
