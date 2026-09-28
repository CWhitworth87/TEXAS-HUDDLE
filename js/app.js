/* Texas Huddle Co. — storefront: catalog, cart and order form. */
(function () {
  "use strict";

  const CART_KEY = "texas-huddle-cart-v1";
  const CUSTOMER_KEY = "texas-huddle-customer-v1";
  const ALL = "All gear";

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const byId = Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));

  const money = (n) => "$" + (Math.round(n * 100) / 100).toFixed(2).replace(/\.00$/, "");
  const money2 = (n) => "$" + n.toFixed(2);
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const unitPrice = (p) => (typeof p.salePrice === "number" ? p.salePrice : p.price);

  function storageGet(key, fallback) {
    try {
      const v = JSON.parse(localStorage.getItem(key));
      return v ?? fallback;
    } catch (e) {
      return fallback;
    }
  }
  function storageSet(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      /* private mode: cart still works for this visit */
    }
  }

  /* ---------- Garment drawings (used until real photos are added) ---------- */

  function garmentSVG(product, colorHex) {
    const hex = colorHex || product.colors[0].hex;
    const light = isLightColor(hex);
    const inkC = light ? "#031F3A" : "#F7F0E1";
    const starC = light ? "#D40F27" : "#F7F0E1";
    const stroke = light ? "rgba(3,31,58,.35)" : "rgba(0,0,0,.35)";
    const shade = light ? "rgba(3,31,58,.08)" : "rgba(0,0,0,.18)";
    const style = product.style || "tee";
    let body = "";

    if (style === "hat") {
      body =
        `<path d="M42 124 Q40 62 100 56 Q160 62 158 124 Z" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="M100 56 Q96 90 100 124" fill="none" stroke="${shade}" stroke-width="2"/>` +
        `<path d="M42 124 L158 124 Q192 126 196 138 Q150 146 40 136 Z" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="M42 124 L158 124 Q192 126 196 138 Q150 146 40 136 Z" fill="${shade}"/>` +
        `<circle cx="100" cy="57" r="4" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="${starPath(100, 94, 18)}" fill="${starC}"/>`;
    } else if (style === "beanie") {
      body =
        `<circle cx="100" cy="40" r="14" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
        `<path d="M52 140 Q50 54 100 52 Q150 54 148 140 Z" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
        [70, 85, 100, 115, 130].map((x) => `<path d="M${x} 60 L${x} 132" stroke="${shade}" stroke-width="3"/>`).join("") +
        `<rect x="44" y="128" width="112" height="40" rx="6" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
        `<rect x="44" y="128" width="112" height="40" rx="6" fill="${shade}"/>` +
        `<rect x="84" y="134" width="32" height="28" rx="3" fill="#F7F0E1" stroke="#031F3A" stroke-width="2"/>` +
        `<path d="${starPath(100, 148, 10)}" fill="#D40F27"/>`;
    } else {
      const d = GARMENT_SHAPES[style] || GARMENT_SHAPES.tee;
      const hood =
        style === "hoodie"
          ? `<path d="M74 34 Q72 6 100 4 Q128 6 126 34 Q100 52 74 34 Z" fill="${hex}" stroke="${stroke}" stroke-width="2"/>` +
            `<path d="M80 34 Q100 46 120 34" fill="none" stroke="${shade}" stroke-width="4"/>`
          : "";
      const extras =
        style === "hoodie"
          ? `<path d="M74 144 L126 144 L134 172 L66 172 Z" fill="${shade}"/>` +
            `<path d="M92 40 L90 70 M108 40 L110 70" stroke="${inkC}" stroke-width="2" stroke-linecap="round" opacity=".7"/>`
          : style === "tank"
          ? ""
          : `<path d="M82 22 Q100 36 118 22" fill="none" stroke="${shade}" stroke-width="5"/>`;
      body =
        hood +
        `<path d="${d}" fill="${hex}" stroke="${stroke}" stroke-width="2" stroke-linejoin="round"/>` +
        extras +
        `<path d="${starPath(100, style === "hoodie" ? 86 : 74, 12)}" fill="${starC}"/>` +
        `<text x="100" y="${style === "hoodie" ? 118 : 108}" text-anchor="middle" font-family="Alfa Slab One, Georgia, serif" font-size="20" fill="${inkC}">TEXAS</text>` +
        `<text x="100" y="${style === "hoodie" ? 132 : 122}" text-anchor="middle" font-family="Oswald, Impact, sans-serif" font-weight="700" font-size="10" letter-spacing="2" fill="${inkC}">HUDDLE CO.</text>`;
    }
    return `<svg viewBox="0 0 200 200" role="img" aria-label="${esc(product.name)}" xmlns="http://www.w3.org/2000/svg">${body}</svg>`;
  }

  function productVisual(product, colorHex) {
    if (product.image) return `<img src="${esc(product.image)}" alt="${esc(product.name)}" loading="lazy">`;
    return garmentSVG(product, colorHex);
  }

  function priceHTML(p) {
    if (p.quote) return `<span class="price">GET A QUOTE</span>`;
    if (typeof p.salePrice === "number")
      return `<span class="price">${money(p.salePrice)}<s>${money(p.price)}</s></span>`;
    return `<span class="price">${money(p.price)}</span>`;
  }

  /* ---------- Catalog ---------- */

  let activeCategory = ALL;

  function renderFilters() {
    const wrap = $("[data-filters]");
    const cats = [ALL, ...CATEGORIES.filter((c) => PRODUCTS.some((p) => p.category === c))];
    wrap.innerHTML = cats
      .map(
        (c) =>
          `<button type="button" role="tab" class="filter-chip" aria-selected="${c === activeCategory}" data-cat="${esc(c)}">${esc(c)}</button>`
      )
      .join("");
    wrap.onclick = (e) => {
      const btn = e.target.closest("[data-cat]");
      if (!btn) return;
      activeCategory = btn.dataset.cat;
      renderFilters();
      renderGrid();
    };
  }

  function renderGrid() {
    const grid = $("[data-product-grid]");
    const list = activeCategory === ALL ? PRODUCTS : PRODUCTS.filter((p) => p.category === activeCategory);
    if (!list.length) {
      grid.innerHTML = `<p class="empty-state">Nothing here yet. Check back soon.</p>`;
      return;
    }
    grid.innerHTML = list
      .map(
        (p) => `
      <button type="button" class="product-card" data-product="${esc(p.id)}" aria-label="${esc(p.name)}, view details">
        <div class="product-media">
          ${productVisual(p)}
          ${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}
        </div>
        <div class="product-info">
          <span class="h3">${esc(p.name)}</span>
          <p class="product-desc">${esc(p.description)}</p>
          <div class="product-foot">
            ${priceHTML(p)}
            <span class="swatches" aria-hidden="true">${p.colors
              .map((c) => `<span class="swatch-dot" style="background:${esc(c.hex)}"></span>`)
              .join("")}</span>
          </div>
        </div>
      </button>`
      )
      .join("");
  }

  $("[data-product-grid]").addEventListener("click", (e) => {
    const card = e.target.closest("[data-product]");
    if (card) openProduct(card.dataset.product);
  });

  /* ---------- Product window ---------- */

  const modal = $("[data-product-modal]");

  function openProduct(id) {
    const p = byId[id];
    if (!p) return;
    const body = $("[data-product-modal-body]");
    const sizeGroup = p.sizes.length
      ? `<fieldset class="option-group">
          <legend class="label">Size</legend>
          <div class="option-row">${p.sizes
            .map(
              (s) =>
                `<label><input type="radio" name="size" value="${esc(s)}"><span class="size-pill">${esc(s)}</span></label>`
            )
            .join("")}</div>
          <p class="field-error" data-size-error hidden>Pick a size first.</p>
        </fieldset>`
      : "";
    const colorGroup = `<fieldset class="option-group">
        <legend class="label">Color: <span data-color-name>${esc(p.colors[0].name)}</span></legend>
        <div class="option-row">${p.colors
          .map(
            (c, i) =>
              `<label><input type="radio" name="color" value="${esc(c.name)}" data-hex="${esc(c.hex)}" ${
                i === 0 ? "checked" : ""
              }><span class="color-pill"><span class="swatch-dot" style="background:${esc(c.hex)}"></span>${esc(
                c.name
              )}</span></label>`
          )
          .join("")}</div>
      </fieldset>`;

    body.innerHTML = `
      <div class="pm-media" data-pm-media>${productVisual(p)}${p.badge ? `<span class="badge">${esc(p.badge)}</span>` : ""}</div>
      <form class="pm-info" data-add-form novalidate>
        <span class="label">${esc(p.category)}</span>
        <h2 id="pm-title">${esc(p.name)}</h2>
        ${priceHTML(p)}
        <p>${esc(p.description)}</p>
        <ul class="pm-details">${p.details.map((d) => `<li>${esc(d)}</li>`).join("")}</ul>
        ${sizeGroup}
        ${colorGroup}
        <div class="option-group">
          <span class="label" id="qty-label">${p.quote ? "Estimated pieces" : "Quantity"}</span>
          <div style="margin-top:8px">${qtyControl(p.quote ? 12 : 1, "qty-label", p.quote ? 12 : 1)}</div>
        </div>
        <div class="pm-actions">
          <button type="submit" class="btn btn-primary">${p.quote ? "ADD QUOTE REQUEST" : "ADD TO CART"}</button>
        </div>
      </form>`;

    const form = $("[data-add-form]", body);
    form.addEventListener("change", (e) => {
      if (e.target.name === "color") {
        $("[data-color-name]", form).textContent = e.target.value;
        if (!p.image) $("[data-pm-media]", body).firstElementChild.outerHTML = garmentSVG(p, e.target.dataset.hex);
      }
      if (e.target.name === "size") $("[data-size-error]", form).hidden = true;
    });
    bindQty(form);
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const size = p.sizes.length ? (form.querySelector("input[name=size]:checked") || {}).value : "One size";
      if (!size) {
        const err = $("[data-size-error]", form);
        err.hidden = false;
        form.querySelector("input[name=size]").focus();
        return;
      }
      const color = form.querySelector("input[name=color]:checked").value;
      const qty = clampQty(form.querySelector("[data-qty-input]").value, p.quote ? 12 : 1);
      addToCart(p.id, size, color, qty);
      modal.close();
      showToast(`${p.name} added.`, "VIEW CART", openCart);
    });

    modal.showModal();
    body.scrollTop = 0;
  }

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.close();
  });

  function qtyControl(value, labelledBy, min = 1) {
    return `<span class="qty">
      <button type="button" data-qty-step="-1" aria-label="Decrease quantity">&minus;</button>
      <input type="number" inputmode="numeric" min="${min}" max="999" value="${value}" data-qty-input aria-labelledby="${labelledBy}">
      <button type="button" data-qty-step="1" aria-label="Increase quantity">+</button>
    </span>`;
  }
  function clampQty(v, min = 1) {
    const n = parseInt(v, 10);
    return Math.min(999, Math.max(min, isNaN(n) ? min : n));
  }
  function bindQty(root) {
    root.addEventListener("click", (e) => {
      const b = e.target.closest("[data-qty-step]");
      if (!b) return;
      const input = b.parentElement.querySelector("[data-qty-input]");
      input.value = clampQty(+input.value + +b.dataset.qtyStep, +input.min || 1);
      input.dispatchEvent(new Event("change", { bubbles: true }));
    });
  }

  /* ---------- Cart ---------- */

  let cart = storageGet(CART_KEY, []).filter((i) => byId[i.id]);

  const lineKey = (i) => `${i.id}|${i.size}|${i.color}`;

  function saveCart() {
    storageSet(CART_KEY, cart);
    updateCount();
  }

  function addToCart(id, size, color, qty) {
    const existing = cart.find((i) => lineKey(i) === `${id}|${size}|${color}`);
    if (existing) existing.qty = Math.min(999, existing.qty + qty);
    else cart.push({ id, size, color, qty });
    saveCart();
    const badge = $("[data-cart-count]");
    badge.classList.remove("bump");
    void badge.offsetWidth;
    badge.classList.add("bump");
  }

  function updateCount() {
    const n = cart.reduce((s, i) => s + i.qty, 0);
    const badge = $("[data-cart-count]");
    badge.textContent = n;
    badge.hidden = n === 0;
    $("[data-open-cart]").setAttribute("aria-label", `Open cart, ${n} item${n === 1 ? "" : "s"}`);
  }

  function totals(delivery) {
    const subtotal = cart.reduce((s, i) => (byId[i.id].quote ? s : s + unitPrice(byId[i.id]) * i.qty), 0);
    const hasPriced = cart.some((i) => !byId[i.id].quote);
    let shipping = 0;
    if (delivery !== "pickup" && hasPriced && subtotal < STORE.freeShippingThreshold) shipping = STORE.shippingFlatRate;
    return { subtotal, shipping, total: subtotal + shipping, hasQuote: cart.some((i) => byId[i.id].quote) };
  }

  /* ---------- Drawer ---------- */

  const drawer = $("[data-drawer]");
  const backdrop = $("[data-drawer-backdrop]");
  const drawerBody = $("[data-drawer-body]");
  const drawerTitle = $("[data-drawer-title]");
  let lastFocus = null;

  function openCart() {
    lastFocus = document.activeElement;
    renderCartView();
    backdrop.hidden = false;
    requestAnimationFrame(() => {
      backdrop.classList.add("show");
      drawer.classList.add("open");
    });
    drawer.setAttribute("aria-hidden", "false");
    document.body.classList.add("no-scroll");
    setTimeout(() => drawer.focus(), 50);
  }
  function closeCart() {
    backdrop.classList.remove("show");
    drawer.classList.remove("open");
    drawer.setAttribute("aria-hidden", "true");
    document.body.classList.remove("no-scroll");
    setTimeout(() => (backdrop.hidden = true), 200);
    if (lastFocus) lastFocus.focus();
  }
  $("[data-open-cart]").addEventListener("click", openCart);
  $("[data-close-cart]").addEventListener("click", closeCart);
  backdrop.addEventListener("click", closeCart);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && drawer.classList.contains("open") && !modal.open) closeCart();
  });

  function renderCartView() {
    drawerTitle.textContent = "Your cart";
    if (!cart.length) {
      drawerBody.innerHTML = `
        <div class="cart-empty">
          <p class="h3">Your cart is empty</p>
          <p>Time to suit up. Pick some gear and it'll show up here.</p>
          <button type="button" class="btn btn-primary" data-shop-now>SHOP THE GEAR</button>
        </div>`;
      $("[data-shop-now]", drawerBody).onclick = () => {
        closeCart();
        location.hash = "#shop";
      };
      return;
    }
    const t = totals("ship");
    const toFree = STORE.freeShippingThreshold - t.subtotal;
    drawerBody.innerHTML = `
      <ul class="cart-list">
        ${cart
          .map((i, idx) => {
            const p = byId[i.id];
            const hex = (p.colors.find((c) => c.name === i.color) || p.colors[0]).hex;
            return `<li class="cart-item" data-line="${idx}">
              <div class="cart-thumb">${productVisual(p, hex)}</div>
              <div>
                <p class="cart-item-name">${esc(p.name)}</p>
                <p class="cart-item-meta">${esc(i.size)} &middot; ${esc(i.color)}${p.quote ? "" : ` &middot; ${money(unitPrice(p))} each`}</p>
                ${qtyControl(i.qty, "", p.quote ? 12 : 1).replace('aria-labelledby=""', `aria-label="Quantity for ${esc(p.name)}"`)}
              </div>
              <div class="cart-item-side">
                <span class="cart-item-price">${p.quote ? "Quote" : money2(unitPrice(p) * i.qty)}</span>
                <button type="button" class="link-btn" data-remove>Remove</button>
              </div>
            </li>`;
          })
          .join("")}
      </ul>
      <div class="totals">
        <div><span>Subtotal</span><strong>${money2(t.subtotal)}</strong></div>
        ${t.hasQuote ? `<div class="muted"><span>Custom team order</span><span>Quoted separately</span></div>` : ""}
      </div>
      <p class="ship-note">${
        t.subtotal >= STORE.freeShippingThreshold
          ? `<strong>You've got free shipping.</strong> Nice play.`
          : t.subtotal > 0
          ? `Add <strong>${money2(toFree)}</strong> more for free shipping. Local pickup is always free.`
          : `Local pickup is always free.`
      }</p>
      <div class="drawer-foot">
        <button type="button" class="btn btn-primary btn-block" data-checkout>CHECKOUT</button>
        <button type="button" class="btn btn-outline-navy btn-block" data-keep-shopping>KEEP SHOPPING</button>
      </div>`;
  }

  drawerBody.addEventListener("click", (e) => {
    const line = e.target.closest("[data-line]");
    if (line) {
      const idx = +line.dataset.line;
      if (e.target.closest("[data-remove]")) {
        cart.splice(idx, 1);
        saveCart();
        renderCartView();
        return;
      }
      const step = e.target.closest("[data-qty-step]");
      if (step) {
        const min = byId[cart[idx].id].quote ? 12 : 1;
        cart[idx].qty = clampQty(cart[idx].qty + +step.dataset.qtyStep, min);
        saveCart();
        renderCartView();
        const again = drawerBody.querySelector(`[data-line="${idx}"] [data-qty-step="${step.dataset.qtyStep}"]`);
        if (again) again.focus();
        return;
      }
    }
    if (e.target.closest("[data-checkout]")) renderCheckoutView();
    if (e.target.closest("[data-keep-shopping]")) closeCart();
    if (e.target.closest("[data-back-to-cart]")) renderCartView();
  });

  drawerBody.addEventListener("change", (e) => {
    const input = e.target.closest("[data-line] [data-qty-input]");
    if (!input) return;
    const idx = +input.closest("[data-line]").dataset.line;
    cart[idx].qty = clampQty(input.value, byId[cart[idx].id].quote ? 12 : 1);
    saveCart();
    renderCartView();
  });

  /* ---------- Checkout ---------- */

  function renderCheckoutView() {
    drawerTitle.textContent = "Checkout";
    const c = storageGet(CUSTOMER_KEY, {});
    const v = (k) => esc(c[k] || "");
    drawerBody.innerHTML = `
      <form class="checkout-form" data-checkout-form novalidate>
        <button type="button" class="link-btn back-link" data-back-to-cart>&larr; Back to cart</button>
        <div class="field">
          <label for="co-name">Full name <span class="req">*</span></label>
          <input id="co-name" name="name" autocomplete="name" required value="${v("name")}">
        </div>
        <div class="field-row">
          <div class="field">
            <label for="co-email">Email <span class="req">*</span></label>
            <input id="co-email" name="email" type="email" autocomplete="email" required value="${v("email")}">
          </div>
          <div class="field">
            <label for="co-phone">Phone <span class="req">*</span></label>
            <input id="co-phone" name="phone" type="tel" autocomplete="tel" required value="${v("phone")}">
          </div>
        </div>
        <fieldset class="radio-cards field">
          <legend>Delivery</legend>
          <label class="radio-card"><input type="radio" name="delivery" value="ship" checked>
            <span><strong>Ship it to me</strong><small data-ship-label></small></span></label>
          <label class="radio-card"><input type="radio" name="delivery" value="pickup">
            <span><strong>Local pickup</strong><small>Free. We'll text you when it's ready.</small></span></label>
        </fieldset>
        <div class="field" data-address-field>
          <label for="co-address">Shipping address <span class="req">*</span></label>
          <textarea id="co-address" name="address" autocomplete="street-address" rows="3" placeholder="Street, city, state, ZIP">${v("address")}</textarea>
        </div>
        <div class="field">
          <label for="co-notes">Order notes</label>
          <textarea id="co-notes" name="notes" rows="3" placeholder="Mixed sizes for a bundle, team names and numbers, gift note..."></textarea>
        </div>
        <div class="order-summary-mini" data-mini-summary></div>
        <p class="field-error" data-form-error hidden></p>
        <button type="submit" class="btn btn-primary btn-block" data-submit>SEND MY ORDER</button>
        <small class="muted">No payment is taken on this site. We'll contact you to confirm your order and set up payment.</small>
      </form>`;

    const form = $("[data-checkout-form]", drawerBody);
    const refresh = () => {
      const delivery = form.delivery.value;
      $("[data-address-field]", form).hidden = delivery === "pickup";
      const t = totals(delivery);
      const shipTotals = totals("ship");
      $("[data-ship-label]", form).textContent =
        shipTotals.shipping === 0 ? "Free shipping on this order." : `${money2(STORE.shippingFlatRate)} flat rate. Free over ${money(STORE.freeShippingThreshold)}.`;
      $("[data-mini-summary]", form).innerHTML = `
        <div><span>Items</span><span>${cart.reduce((s, i) => s + i.qty, 0)}</span></div>
        <div><span>Subtotal</span><span>${money2(t.subtotal)}</span></div>
        <div><span>Shipping</span><span>${t.shipping ? money2(t.shipping) : "Free"}</span></div>
        <div><strong>Total</strong><strong>${money2(t.total)}${t.hasQuote ? " + quote" : ""}</strong></div>`;
    };
    form.addEventListener("change", refresh);
    form.addEventListener("input", (e) => e.target.removeAttribute("aria-invalid"));
    refresh();
    form.addEventListener("submit", submitOrder);
    setTimeout(() => form.name.focus(), 50);
  }

  function validate(form) {
    const problems = [];
    const need = [
      [form.name, "your name"],
      [form.email, "your email"],
      [form.phone, "your phone number"],
    ];
    if (form.delivery.value === "ship") need.push([form.address, "a shipping address"]);
    need.forEach(([el, label]) => {
      const bad = !el.value.trim() || (el.type === "email" && !/^\S+@\S+\.\S+$/.test(el.value.trim()));
      el.setAttribute("aria-invalid", bad ? "true" : "false");
      if (bad) problems.push(label);
    });
    return problems;
  }

  function makeOrderNumber() {
    const d = new Date();
    const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `TH-${ymd}-${rand}`;
  }

  function orderText(order) {
    const lines = [];
    lines.push(`NEW ORDER ${order.number}`);
    lines.push(`Placed: ${order.placed}`);
    lines.push("");
    lines.push("CUSTOMER");
    lines.push(`Name: ${order.customer.name}`);
    lines.push(`Email: ${order.customer.email}`);
    lines.push(`Phone: ${order.customer.phone}`);
    lines.push(`Delivery: ${order.delivery === "pickup" ? "Local pickup" : "Ship"}`);
    if (order.delivery === "ship") lines.push(`Address: ${order.customer.address}`);
    lines.push("");
    lines.push("ITEMS");
    order.items.forEach((i) => {
      lines.push(`- ${i.qty} x ${i.name} (${i.size}, ${i.color}) ${i.quote ? "- quote requested" : `@ ${money2(i.price)} = ${money2(i.lineTotal)}`}`);
    });
    lines.push("");
    lines.push(`Subtotal: ${money2(order.subtotal)}`);
    lines.push(`Shipping: ${order.shipping ? money2(order.shipping) : "Free"}`);
    lines.push(`Total: ${money2(order.total)}${order.hasQuote ? " (plus custom team order quote)" : ""}`);
    if (order.notes) {
      lines.push("");
      lines.push("NOTES");
      lines.push(order.notes);
    }
    return lines.join("\n");
  }

  async function submitOrder(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const errBox = $("[data-form-error]", form);
    const problems = validate(form);
    if (problems.length) {
      errBox.textContent = `Please add ${problems.join(", ")}.`;
      errBox.hidden = false;
      const first = form.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      return;
    }
    errBox.hidden = true;

    const delivery = form.delivery.value;
    const customer = {
      name: form.name.value.trim(),
      email: form.email.value.trim(),
      phone: form.phone.value.trim(),
      address: delivery === "ship" ? form.address.value.trim() : "",
    };
    storageSet(CUSTOMER_KEY, customer);
    const t = totals(delivery);
    const order = {
      number: makeOrderNumber(),
      placed: new Date().toLocaleString(),
      customer,
      delivery,
      notes: form.notes.value.trim(),
      items: cart.map((i) => {
        const p = byId[i.id];
        return { id: p.id, name: p.name, size: i.size, color: i.color, qty: i.qty, quote: !!p.quote, price: unitPrice(p), lineTotal: p.quote ? 0 : unitPrice(p) * i.qty };
      }),
      ...t,
    };
    const text = orderText(order);
    const subject = `Order ${order.number} - ${customer.name}`;
    const mailto = `mailto:${STORE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;

    const submitBtn = $("[data-submit]", form);
    if (STORE.formEndpoint) {
      submitBtn.disabled = true;
      submitBtn.textContent = "SENDING...";
      try {
        const res = await fetch(STORE.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: subject, _replyto: customer.email, email: customer.email, order: text }),
        });
        if (!res.ok) throw new Error("Bad response " + res.status);
        finishOrder(order, text, mailto, true);
      } catch (err) {
        submitBtn.disabled = false;
        submitBtn.textContent = "SEND MY ORDER";
        errBox.innerHTML = `We couldn't send that. Try again, or <a href="${esc(mailto)}">email your order</a> to ${esc(STORE.email)}.`;
        errBox.hidden = false;
      }
    } else {
      window.location.href = mailto;
      finishOrder(order, text, mailto, false);
    }
  }

  function finishOrder(order, text, mailto, sentAutomatically) {
    cart = [];
    saveCart();
    drawerTitle.textContent = "Order sent";
    drawerBody.innerHTML = `
      <div class="confirm">
        <svg class="confirm-star" viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="${starPath(32, 33, 30)}"/></svg>
        <p class="h2">Touchdown!</p>
        <p>Your order number is</p>
        <div class="order-number">${esc(order.number)}</div>
        ${
          sentAutomatically
            ? `<p>We got it. We'll reach out at <strong>${esc(order.customer.email)}</strong> or <strong>${esc(order.customer.phone)}</strong> to confirm and set up payment.</p>`
            : `<p>Your email app should have opened with your order filled in. <strong>Hit send there</strong> to get it to us.</p>
               <p class="muted">Didn't open? <a href="${esc(mailto)}">Try again</a>, or copy your order and email it to <a href="mailto:${esc(STORE.email)}">${esc(STORE.email)}</a>.</p>
               <button type="button" class="btn btn-outline-navy btn-block" data-copy-order>COPY ORDER DETAILS</button>`
        }
        <p class="muted">Questions? Call or text <a href="${esc(STORE.phoneLink)}">${esc(STORE.phone)}</a>.</p>
        <button type="button" class="btn btn-primary btn-block" data-keep-shopping>BACK TO THE SHOP</button>
      </div>`;
    const copyBtn = $("[data-copy-order]", drawerBody);
    if (copyBtn)
      copyBtn.onclick = async () => {
        try {
          await navigator.clipboard.writeText(text);
          copyBtn.textContent = "COPIED!";
        } catch (e) {
          copyBtn.textContent = "COPY FAILED";
        }
      };
  }

  /* ---------- Toast ---------- */

  let toastTimer;
  function showToast(msg, actionLabel, action) {
    const t = $("[data-toast]");
    t.innerHTML = `<span>${esc(msg)}</span>${actionLabel ? `<button type="button">${esc(actionLabel)}</button>` : ""}`;
    if (action) t.querySelector("button").onclick = () => {
      t.classList.remove("show");
      action();
    };
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
  }

  /* ---------- Boot ---------- */

  $("[data-year]").textContent = new Date().getFullYear();
  $("[data-free-shipping-note]").textContent = `Free shipping over ${money(STORE.freeShippingThreshold)}. Local pickup always free.`;
  renderFilters();
  renderGrid();
  updateCount();
  if (location.hash === "#cart") {
    history.replaceState(null, "", location.pathname);
    openCart();
  }
})();
