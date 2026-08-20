// cart.js — Carrito de compras singleton con persistencia en localStorage.

import { formatPrice, qs, qsa, createEl, saveLS, loadLS, EVENTS } from './utils.js';
import { getProductById } from '../data/products.js';

const STORAGE_KEY = 'solestyle_cart';
const MAX_ITEMS = 50;

class Cart {
  constructor() {
    const saved = loadLS(STORAGE_KEY, []);
    this.items = Array.isArray(saved) ? saved.slice(0, MAX_ITEMS) : [];
    this.coupon = null; // { code, type: 'percent'|'flat', value }
    this._itemsBound = false;
    this._couponBound = false;
  }

  // Persiste el estado actual en localStorage.
  _persist() {
    saveLS(STORAGE_KEY, this.items);
  }

  // Devuelve la primera combinación talla-color con stock disponible.
  _resolveCombo(product) {
    for (const size of product.sizes) {
      for (const color of product.colors) {
        if ((product.stock[`${size}-${color.name}`] ?? 0) > 0) {
          return { size, color: color.name };
        }
      }
    }
    return null;
  }

  // Agrega un producto; si faltan talla/color resuelve la primera combinación con stock.
  add(productId, size = null, color = null, qty = 1) {
    const product = getProductById(productId);
    if (!product) return { ok: false, error: 'sin-stock' };
    let finalSize = size;
    let finalColor = color;
    if (finalSize === null || finalColor === null) {
      const combo = this._resolveCombo(product);
      if (!combo) return { ok: false, error: 'sin-stock' };
      finalSize = combo.size;
      finalColor = combo.color;
    }
    if ((product.stock[`${finalSize}-${finalColor}`] ?? 0) <= 0) return { ok: false, error: 'sin-stock' };
    const finalQty = Math.min(10, Math.max(1, parseInt(qty, 10) || 1));
    const existing = this.items.find(i => i.productId === productId && i.size === finalSize && i.color === finalColor);
    if (existing) {
      existing.qty = Math.min(10, existing.qty + finalQty);
    } else {
      if (this.items.length >= MAX_ITEMS) return { ok: false, error: 'sin-stock' };
      this.items.push({ productId, size: finalSize, color: finalColor, qty: finalQty });
    }
    this._persist();
    this.render();
    return { ok: true, item: this.items.find(i => i.productId === productId && i.size === finalSize && i.color === finalColor) };
  }

  // Elimina una línea del carrito por producto/talla/color.
  remove(productId, size, color) {
    this.items = this.items.filter(i => !(i.productId === productId && i.size === size && i.color === color));
    this._persist();
    this.render();
  }

  // Actualiza la cantidad de una línea (rango 1..10).
  updateQty(productId, size, color, qty) {
    const item = this.items.find(i => i.productId === productId && i.size === size && i.color === color);
    if (!item) return;
    item.qty = Math.min(10, Math.max(1, parseInt(qty, 10) || 1));
    this._persist();
    this.render();
  }

  // Devuelve las líneas resueltas con producto, precio efectivo e imagen del color.
  getItems() {
    return this.items.map(item => {
      const product = getProductById(item.productId);
      if (!product) return null;
      const color = product.colors.find(c => c.name === item.color) || product.colors[0];
      return {
        ...item,
        product,
        name: product.name,
        brand: product.brand,
        price: product.discountPrice ?? product.price,
        image: color ? color.image : product.images[0],
      };
    }).filter(Boolean);
  }

  // Cantidad total de unidades en el carrito.
  getCount() {
    return this.items.reduce((sum, i) => sum + i.qty, 0);
  }

  // Subtotal sin descuentos ni envío.
  getSubtotal() {
    return this.getItems().reduce((sum, i) => sum + i.price * i.qty, 0);
  }

  // Descuento del cupón aplicado (0 si no hay cupón).
  getDiscount() {
    if (!this.coupon) return 0;
    const subtotal = this.getSubtotal();
    return this.coupon.type === 'percent' ? Math.round(subtotal * this.coupon.value) : this.coupon.value;
  }

  // Envío: 150, gratis si (subtotal - descuento) >= 2000.
  getShipping() {
    return this.getSubtotal() - this.getDiscount() >= 2000 ? 0 : 150;
  }

  // Total final: subtotal - descuento + envío.
  getTotal() {
    return this.getSubtotal() - this.getDiscount() + this.getShipping();
  }

  // Aplica un cupón: SOLE10 (10%) o WELCOME ($200 fijos).
  applyCoupon(code) {
    const clean = String(code || '').trim().toUpperCase();
    if (clean === 'SOLE10') {
      this.coupon = { code: 'SOLE10', type: 'percent', value: 0.1 };
      return { ok: true, message: 'Cupón aplicado: 10% de descuento' };
    }
    if (clean === 'WELCOME') {
      this.coupon = { code: 'WELCOME', type: 'flat', value: 200 };
      return { ok: true, message: 'Cupón aplicado: $200 de descuento' };
    }
    return { ok: false, message: 'Cupón no válido' };
  }

  // Vacía el carrito y quita el cupón.
  clear() {
    this.items = [];
    this.coupon = null;
    this._persist();
    this.render();
  }

  // Indica si la combinación de una línea quedó sin stock.
  isOutOfStock(item) {
    const product = item.product || getProductById(item.productId);
    if (!product) return true;
    return (product.stock[`${item.size}-${item.color}`] ?? 0) <= 0;
  }

  // Pinta el drawer completo: filas, resumen, badge y estados vacío/sin stock.
  render() {
    const container = qs('#cartItems');
    if (!container) return;
    const items = this.getItems();
    const hasOutOfStock = items.some(i => this.isOutOfStock(i));

    container.innerHTML = '';
    items.forEach((item, index) => {
      const out = this.isOutOfStock(item);
      const row = createEl('div', 'cart-item' + (out ? ' is-out-of-stock' : ''));
      const img = createEl('img', 'cart-item__img');
      img.src = item.image;
      img.alt = item.name;
      img.loading = 'lazy';
      const info = createEl('div', 'cart-item__info');
      const name = createEl('p', 'cart-item__name');
      name.textContent = item.name;
      if (out) name.style.textDecoration = 'line-through';
      const variant = createEl('p', 'cart-item__variant');
      variant.textContent = `Talla ${item.size} · ${item.color}`;
      const price = createEl('p', 'cart-item__price');
      price.textContent = formatPrice(item.price);
      const qtyControl = createEl('div', 'qty-control');
      const minus = createEl('button', 'qty-btn');
      minus.type = 'button';
      minus.dataset.cartMinus = String(index);
      minus.setAttribute('aria-label', 'Disminuir cantidad');
      minus.innerHTML = '<i data-lucide="minus"></i>';
      if (item.qty <= 1) minus.disabled = true;
      const qtySpan = createEl('span', 'qty-input');
      qtySpan.textContent = String(item.qty);
      const plus = createEl('button', 'qty-btn');
      plus.type = 'button';
      plus.dataset.cartPlus = String(index);
      plus.setAttribute('aria-label', 'Aumentar cantidad');
      plus.innerHTML = '<i data-lucide="plus"></i>';
      qtyControl.append(minus, qtySpan, plus);
      info.append(name, variant, price, qtyControl);
      const remove = createEl('button', 'cart-remove');
      remove.type = 'button';
      remove.dataset.cartRemove = String(index);
      remove.setAttribute('aria-label', `Eliminar ${item.name}`);
      remove.innerHTML = '<i data-lucide="trash-2"></i>';
      row.append(img, info, remove);
      container.appendChild(row);
    });

    // Resumen de totales y mensaje de cupón.
    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const shipping = this.getShipping();
    const subtotalEl = qs('#cartSubtotal');
    const shippingEl = qs('#cartShipping');
    const totalEl = qs('#cartTotal');
    if (subtotalEl) subtotalEl.textContent = formatPrice(subtotal);
    if (shippingEl) shippingEl.textContent = shipping === 0 ? 'Gratis' : formatPrice(shipping);
    if (totalEl) totalEl.textContent = formatPrice(this.getTotal());
    const couponMsg = qs('#couponMsg');
    if (couponMsg && this.coupon) {
      couponMsg.textContent = `Cupón ${this.coupon.code} aplicado (-${formatPrice(discount)})`;
      couponMsg.classList.add('is-success');
      couponMsg.classList.remove('is-error');
    }

    // Badge del header (oculto cuando el carrito está vacío).
    const badge = qs('#cartBadge');
    if (badge) {
      badge.textContent = String(this.getCount());
      badge.classList.toggle('is-hidden', this.getCount() === 0);
    }

    // Alterna entre estado vacío y resumen.
    const empty = qs('#cartEmpty');
    const summary = qs('#cartSummary');
    if (empty) empty.classList.toggle('is-hidden', items.length > 0);
    if (summary) summary.classList.toggle('is-hidden', items.length === 0);

    // Checkout deshabilitado si alguna línea quedó sin stock.
    const checkoutBtn = qs('#checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = hasOutOfStock;

    this._bindItems();
    this._bindCoupon();
    window.dispatchEvent(new CustomEvent(EVENTS.CART_CHANGED));
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Delegación de eventos para +, - y eliminar dentro de #cartItems (una sola vez).
  _bindItems() {
    const container = qs('#cartItems');
    if (!container || this._itemsBound) return;
    this._itemsBound = true;
    container.addEventListener('click', (e) => {
      const minus = e.target.closest('[data-cart-minus]');
      if (minus) {
        const item = this.items[Number(minus.dataset.cartMinus)];
        if (item) this.updateQty(item.productId, item.size, item.color, item.qty - 1);
        return;
      }
      const plus = e.target.closest('[data-cart-plus]');
      if (plus) {
        const item = this.items[Number(plus.dataset.cartPlus)];
        if (item) this.updateQty(item.productId, item.size, item.color, item.qty + 1);
        return;
      }
      const remove = e.target.closest('[data-cart-remove]');
      if (remove) {
        const item = this.items[Number(remove.dataset.cartRemove)];
        if (item) this.remove(item.productId, item.size, item.color);
      }
    });
  }

  // Cablea el botón de aplicar cupón (una sola vez).
  _bindCoupon() {
    const apply = qs('#couponApply');
    if (!apply || this._couponBound) return;
    this._couponBound = true;
    const run = () => {
      const input = qs('#couponInput');
      const res = this.applyCoupon(input ? input.value : '');
      this.render();
      if (!res.ok) {
        const msg = qs('#couponMsg');
        if (msg) {
          msg.textContent = res.message;
          msg.classList.toggle('is-success', false);
          msg.classList.toggle('is-error', true);
        }
      }
    };
    apply.addEventListener('click', run);
    const input = qs('#couponInput');
    if (input) input.addEventListener('keydown', (e) => { if (e.key === 'Enter') run(); });
  }
}

export const cart = new Cart();