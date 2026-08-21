// checkout.js — Checkout multi-paso + barra de envío gratis + cupón.
// Contrato §10.1: initCheckout() — modal multi-paso, barra progreso envío, cupón.

import { qs, qsa, createEl, formatPrice, notify, saveLS, loadLS } from './modules/utils.js';
import { cart } from './modules/cart.js';

// ---- BARRA DE PROGRESO A ENVÍO GRATIS ----

function renderShippingProgress() {
  const drawer = qs('#cartDrawer');
  if (!drawer) return;

  // Evitar duplicar.
  const existing = qs('#ck-shipping-progress');
  if (existing) existing.remove();

  const subtotal = cart.getSubtotal();
  const threshold = 2000;
  const progress = Math.min(1, subtotal / threshold);
  const remaining = Math.max(0, threshold - subtotal);

  const el = createEl('div', 'ck-shipping-progress');
  el.id = 'ck-shipping-progress';

  if (remaining <= 0) {
    el.innerHTML = `
      <div class="ck-shipping-progress__text ck-shipping-progress__text--success">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
        ¡Tienes envío gratis!
      </div>
    `;
  } else {
    el.innerHTML = `
      <div class="ck-shipping-progress__text">
        Te faltan <strong>${formatPrice(remaining)}</strong> para envío gratis
      </div>
      <div class="ck-shipping-progress__bar">
        <div class="ck-shipping-progress__fill" style="width: ${progress * 100}%"></div>
      </div>
    `;
  }

  // Insertar después del header del drawer.
  const header = qs('.cart-drawer__header', drawer);
  if (header && header.parentNode) {
    header.parentNode.insertBefore(el, header.nextSibling);
  }
}

// ---- INPUT DE CUPÓN ----

function renderCouponInput() {
  const drawer = qs('#cartDrawer');
  if (!drawer) return;

  const existing = qs('#ck-coupon');
  if (existing) existing.remove();

  const container = createEl('div', 'ck-coupon');
  container.id = 'ck-coupon';
  container.innerHTML = `
    <div class="ck-coupon__form">
      <input type="text" class="ck-coupon__input" placeholder="Código de cupón" maxlength="20">
      <button class="btn btn-outline btn-sm ck-coupon__btn" type="button">Aplicar</button>
    </div>
    <div class="ck-coupon__msg"></div>
  `;

  // Insertar antes del resumen.
  const summary = qs('.cart-summary', drawer) || qs('#cartSummary', drawer);
  if (summary && summary.parentNode) {
    summary.parentNode.insertBefore(container, summary);
  } else {
    drawer.appendChild(container);
  }

  const input = qs('.ck-coupon__input', container);
  const btn = qs('.ck-coupon__btn', container);
  const msg = qs('.ck-coupon__msg', container);

  const apply = () => {
    const code = input.value.trim();
    if (!code) return;
    const res = cart.applyCoupon(code);
    if (res.ok) {
      msg.textContent = res.message;
      msg.className = 'ck-coupon__msg ck-coupon__msg--success';
      notify(res.message, 'success');
    } else {
      msg.textContent = res.message;
      msg.className = 'ck-coupon__msg ck-coupon__msg--error';
      notify(res.message, 'error');
    }
    cart.render();
    renderShippingProgress();
  };

  if (btn) btn.addEventListener('click', apply);
  if (input) input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') apply();
  });
}

// ---- MODAL CHECKOUT MULTI-PASO ----

function createCheckoutModal() {
  const existing = qs('#ck-modal');
  if (existing) return existing;

  const modal = createEl('div', 'ck-modal');
  modal.id = 'ck-modal';
  modal.setAttribute('role', 'dialog');
  modal.setAttribute('aria-modal', 'true');
  modal.setAttribute('aria-label', 'Checkout');
  modal.innerHTML = `
    <div class="ck-modal__content">
      <div class="ck-modal__header">
        <h2>Finalizar compra</h2>
        <button class="ck-modal__close" aria-label="Cerrar">&times;</button>
      </div>
      <div class="ck-modal__steps">
        <div class="ck-step ck-step--active" data-step="1">
          <span class="ck-step__number">1</span>
          <span class="ck-step__label">Envío</span>
        </div>
        <div class="ck-step" data-step="2">
          <span class="ck-step__number">2</span>
          <span class="ck-step__label">Pago</span>
        </div>
        <div class="ck-step" data-step="3">
          <span class="ck-step__number">3</span>
          <span class="ck-step__label">Revisión</span>
        </div>
      </div>
      <div class="ck-modal__body"></div>
      <div class="ck-modal__footer">
        <button class="btn btn-outline ck-btn-back" type="button">Volver</button>
        <button class="btn btn-primary ck-btn-next" type="button">Siguiente</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
}

// ---- RENDERIZADO DE PASOS ----

function renderStep1(modal) {
  const body = qs('.ck-modal__body', modal);
  const address = loadLS('solestyle_address', {});
  body.innerHTML = `
    <form class="ck-form" id="ck-form-step1">
      <div class="ck-form__group">
        <label class="ck-form__label" for="ck-name">Nombre completo *</label>
        <input class="ck-form__input" type="text" id="ck-name" required value="${address.name || ''}">
      </div>
      <div class="ck-form__group">
        <label class="ck-form__label" for="ck-email">Email *</label>
        <input class="ck-form__input" type="email" id="ck-email" required value="${address.email || ''}">
      </div>
      <div class="ck-form__group">
        <label class="ck-form__label" for="ck-address">Dirección *</label>
        <input class="ck-form__input" type="text" id="ck-address" required value="${address.address || ''}">
      </div>
      <div class="ck-form__row">
        <div class="ck-form__group">
          <label class="ck-form__label" for="ck-city">Ciudad *</label>
          <input class="ck-form__input" type="text" id="ck-city" required value="${address.city || ''}">
        </div>
        <div class="ck-form__group">
          <label class="ck-form__label" for="ck-zip">Código postal *</label>
          <input class="ck-form__input" type="text" id="ck-zip" required value="${address.zip || ''}">
        </div>
      </div>
    </form>
  `;
}

function renderStep2(modal) {
  const body = qs('.ck-modal__body', modal);
  body.innerHTML = `
    <form class="ck-form" id="ck-form-step2">
      <div class="ck-form__group">
        <label class="ck-form__label" for="ck-card-num">Número de tarjeta *</label>
        <input class="ck-form__input" type="text" id="ck-card-num" placeholder="0000 0000 0000 0000" maxlength="19" required>
      </div>
      <div class="ck-form__row">
        <div class="ck-form__group">
          <label class="ck-form__label" for="ck-card-exp">Vencimiento *</label>
          <input class="ck-form__input" type="text" id="ck-card-exp" placeholder="MM/AA" maxlength="5" required>
        </div>
        <div class="ck-form__group">
          <label class="ck-form__label" for="ck-card-cvc">CVC *</label>
          <input class="ck-form__input" type="text" id="ck-card-cvc" placeholder="000" maxlength="3" required>
        </div>
      </div>
      <div class="ck-form__group">
        <label class="ck-form__label" for="ck-card-name">Nombre en la tarjeta *</label>
        <input class="ck-form__input" type="text" id="ck-card-name" required>
      </div>
    </form>
  `;

  // Formateo de número de tarjeta.
  const cardInput = qs('#ck-card-num', modal);
  if (cardInput) {
    cardInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 16);
      val = val.replace(/(.{4})/g, '$1 ').trim();
      e.target.value = val;
    });
  }

  // Formateo de expiración.
  const expInput = qs('#ck-card-exp', modal);
  if (expInput) {
    expInput.addEventListener('input', (e) => {
      let val = e.target.value.replace(/\D/g, '').substring(0, 4);
      if (val.length >= 3) val = val.substring(0, 2) + '/' + val.substring(2);
      e.target.value = val;
    });
  }
}

function renderStep3(modal) {
  const body = qs('.ck-modal__body', modal);
  const items = cart.getItems();
  const subtotal = cart.getSubtotal();
  const discount = cart.getDiscount();
  const shipping = cart.getShipping();
  const total = cart.getTotal();

  let itemsHtml = items.map(item => `
    <div class="ck-review-item">
      <span>${item.name} x${item.qty}</span>
      <span>${formatPrice(item.price * item.qty)}</span>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="ck-review">
      <h3>Resumen del pedido</h3>
      <div class="ck-review__items">${itemsHtml}</div>
      <div class="ck-review__totals">
        <div class="ck-review__row"><span>Subtotal</span><span>${formatPrice(subtotal)}</span></div>
        ${discount > 0 ? `<div class="ck-review__row ck-review__row--discount"><span>Descuento</span><span>-${formatPrice(discount)}</span></div>` : ''}
        <div class="ck-review__row"><span>Envío</span><span>${shipping === 0 ? 'Gratis' : formatPrice(shipping)}</span></div>
        <div class="ck-review__row ck-review__row--total"><span>Total</span><span>${formatPrice(total)}</span></div>
      </div>
    </div>
  `;
}

// ---- NAVEGACIÓN ENTRE PASOS ----

let currentStep = 1;
let modalState = null;

function validateStep(step) {
  if (step === 1) {
    const name = qs('#ck-name');
    const email = qs('#ck-email');
    const address = qs('#ck-address');
    const city = qs('#ck-city');
    const zip = qs('#ck-zip');
    if (!name?.value.trim() || !email?.value.trim() || !address?.value.trim() || !city?.value.trim() || !zip?.value.trim()) {
      notify('Completa todos los campos', 'error');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      notify('Email inválido', 'error');
      return false;
    }
    // Guardar dirección.
    saveLS('solestyle_address', {
      name: name.value.trim(),
      email: email.value.trim(),
      address: address.value.trim(),
      city: city.value.trim(),
      zip: zip.value.trim()
    });
  }
  if (step === 2) {
    const cardNum = qs('#ck-card-num');
    const cardExp = qs('#ck-card-exp');
    const cardCvc = qs('#ck-card-cvc');
    const cardName = qs('#ck-card-name');
    if (!cardNum?.value.trim() || !cardExp?.value.trim() || !cardCvc?.value.trim() || !cardName?.value.trim()) {
      notify('Completa todos los campos de pago', 'error');
      return false;
    }
    if (cardNum.value.replace(/\s/g, '').length !== 16) {
      notify('Número de tarjeta inválido', 'error');
      return false;
    }
  }
  return true;
}

function goToStep(step, modal) {
  currentStep = step;
  const steps = qsa('.ck-step', modal);
  steps.forEach(s => {
    const sStep = parseInt(s.dataset.step, 10);
    s.classList.toggle('ck-step--active', sStep === step);
    s.classList.toggle('ck-step--completed', sStep < step);
  });

  if (step === 1) renderStep1(modal);
  else if (step === 2) renderStep2(modal);
  else if (step === 3) renderStep3(modal);

  const backBtn = qs('.ck-btn-back', modal);
  const nextBtn = qs('.ck-btn-next', modal);
  if (backBtn) backBtn.style.display = step === 1 ? 'none' : '';
  if (nextBtn) nextBtn.textContent = step === 3 ? 'Confirmar pedido' : 'Siguiente';
}

function openCheckout() {
  const items = cart.getItems();
  if (!items.length) return;

  const modal = createCheckoutModal();
  modalState = modal;
  currentStep = 1;
  goToStep(1, modal);
  modal.classList.add('is-open');
  document.body.style.overflow = 'hidden';

  // Eventos de navegación.
  const closeBtn = qs('.ck-modal__close', modal);
  const backBtn = qs('.ck-btn-back', modal);
  const nextBtn = qs('.ck-btn-next', modal);

  const close = () => {
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
  };

  if (closeBtn) closeBtn.onclick = close;
  modal.addEventListener('click', (e) => {
    if (e.target === modal) close();
  });

  if (backBtn) backBtn.onclick = () => {
    if (currentStep > 1) goToStep(currentStep - 1, modal);
  };

  if (nextBtn) nextBtn.onclick = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < 3) {
      goToStep(currentStep + 1, modal);
    } else {
      // Confirmar pedido.
      const orderId = 'SOL-' + Math.random().toString(36).substring(2, 8).toUpperCase();
      const orders = loadLS('solestyle_orders', []);
      orders.push({ id: orderId, date: new Date().toISOString(), total: cart.getTotal() });
      saveLS('solestyle_orders', orders);
      cart.clear();
      cart.render();
      close();
      notify(`Pedido ${orderId} confirmado`, 'success');
      window.dispatchEvent(new CustomEvent('checkout:completed', { detail: { orderId } }));
    }
  };

  // Escape cierra.
  const onKey = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onKey);
    }
  };
  document.addEventListener('keydown', onKey);
}

// ---- EXPORT ----

export function initCheckout() {
  // Reemplazar el comportamiento del #checkoutBtn.
  const checkoutBtn = qs('#checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      openCheckout();
    });
  }

  // Actualizar barra de envío y cupón cuando cambia el carrito.
  window.addEventListener('cart:changed', () => {
    renderShippingProgress();
    renderCouponInput();
  });

  // Render inicial.
  renderShippingProgress();
  renderCouponInput();
}
