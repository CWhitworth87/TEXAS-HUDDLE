/* Texas Huddle Co. — custom shirt designer and quote request. */
(function () {
  "use strict";

  const W = 1000;
  const U = 5; // garment paths use a 200-unit grid; the canvas is 1000 units
  const STATE_KEY = "texas-huddle-design-v1";
  const CART_KEY = "texas-huddle-cart-v1";
  const CUSTOMER_KEY = "texas-huddle-customer-v1";
  const SIZES = ["YS", "YM", "YL", "S", "M", "L", "XL", "2XL", "3XL"];

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const esc = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

  /* ---------- Options ---------- */

  const GARMENT_COLORS = [
    { name: "White", hex: "#FFFFFF" },
    { name: "Cream", hex: "#F7F0E1" },
    { name: "Heather Gray", hex: "#9AA0A6" },
    { name: "Navy", hex: "#031F3A" },
    { name: "Black", hex: "#1B1B1B" },
    { name: "Red", hex: "#D40F27" },
    { name: "Royal Blue", hex: "#1E4FA8" },
    { name: "Burnt Orange", hex: "#BF5700" },
    { name: "Maroon", hex: "#500000" },
    { name: "Kelly Green", hex: "#1F7A3A" },
    { name: "Gold", hex: "#C9A227" },
  ];

  const INK_COLORS = [
    { name: "Navy", hex: "#031F3A" },
    { name: "Cream", hex: "#F7F0E1" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Black", hex: "#1B1B1B" },
    { name: "Red", hex: "#D40F27" },
    { name: "Royal Blue", hex: "#1E4FA8" },
    { name: "Burnt Orange", hex: "#BF5700" },
    { name: "Maroon", hex: "#500000" },
    { name: "Gold", hex: "#C9A227" },
    { name: "Kelly Green", hex: "#1F7A3A" },
    { name: "Gray", hex: "#9AA0A6" },
    { name: "Pink", hex: "#E86FA0" },
  ];

  const FONTS = [
    { id: "graduate", label: "Varsity", family: "Graduate", weight: 400 },
    { id: "alfa", label: "Slab", family: "Alfa Slab One", weight: 400 },
    { id: "oswald", label: "Block", family: "Oswald", weight: 700 },
    { id: "bebas", label: "Tall", family: "Bebas Neue", weight: 400 },
    { id: "rye", label: "Western", family: "Rye", weight: 400 },
    { id: "pacifico", label: "Script", family: "Pacifico", weight: 400 },
    { id: "marker", label: "Marker", family: "Permanent Marker", weight: 400 },
    { id: "inter", label: "Clean", family: "Inter", weight: 800 },
  ];
  const fontById = Object.fromEntries(FONTS.map((f) => [f.id, f]));

  // Print areas as [x, y, width, height] on the 1000-unit canvas.
  const GARMENTS = {
    tee: { label: "T-shirt", area: { front: [350, 200, 300, 400], back: [350, 170, 300, 400] } },
    longsleeve: { label: "Long sleeve", area: { front: [350, 200, 300, 400], back: [350, 170, 300, 400] } },
    hoodie: { label: "Hoodie", area: { front: [350, 250, 300, 380], back: [350, 360, 300, 400] } },
    tank: { label: "Tank", area: { front: [350, 290, 300, 380], back: [350, 230, 300, 400] } },
  };

  const contrastOn = (hex) => (isLightColor(hex) ? "#031F3A" : "#F7F0E1");

  const GRAPHICS = {
    star: {
      label: "Star",
      bounds: [-48, -50, 48, 42],
      draw(ctx, el) {
        ctx.fillStyle = el.fill;
        ctx.fill(new Path2D(starPath(0, 0, 50)));
      },
    },
    football: {
      label: "Football",
      bounds: [-62, -24, 62, 24],
      draw(ctx, el) {
        ctx.fillStyle = el.fill;
        ctx.fill(new Path2D("M-62 0 Q0 -48 62 0 Q0 48 -62 0 Z"));
        ctx.strokeStyle = contrastOn(el.fill);
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(-22, 0);
        ctx.lineTo(22, 0);
        for (const x of [-15, -5, 5, 15]) {
          ctx.moveTo(x, -7);
          ctx.lineTo(x, 7);
        }
        ctx.moveTo(-44, -12);
        ctx.lineTo(-44, 12);
        ctx.moveTo(44, -12);
        ctx.lineTo(44, 12);
        ctx.stroke();
      },
    },
    circle: {
      label: "Circle badge",
      bounds: [-50, -50, 50, 50],
      draw(ctx, el) {
        ctx.fillStyle = el.fill;
        ctx.beginPath();
        ctx.arc(0, 0, 50, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = contrastOn(el.fill);
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.stroke();
      },
    },
    shield: {
      label: "Shield",
      bounds: [-40, -50, 40, 58],
      draw(ctx, el) {
        ctx.fillStyle = el.fill;
        ctx.fill(new Path2D("M-40 -50 L40 -50 L40 10 Q40 40 0 58 Q-40 40 -40 10 Z"));
        ctx.strokeStyle = contrastOn(el.fill);
        ctx.lineWidth = 4;
        ctx.stroke(new Path2D("M-32 -42 L32 -42 L32 9 Q32 34 0 49 Q-32 34 -32 9 Z"));
      },
    },
    stripes: {
      label: "Stripes",
      bounds: [-70, -37, 70, 37],
      draw(ctx, el) {
        ctx.fillStyle = el.fill;
        for (const y of [-37, -7, 23]) ctx.fillRect(-70, y, 140, 14);
      },
    },
  };

  /* ---------- State ---------- */

  let state = { garment: "tee", color: "#FFFFFF", front: [], back: [] };
  let view = "front";
  let selectedId = null;
  const images = {}; // id -> { src, name, img }
  let undoStack = [];
  let redoStack = [];
  let nextId = 1;

  const canvas = $("[data-canvas]");
  const ctx = canvas.getContext("2d");

  const els = () => state[view];
  const getSelected = () => els().find((e) => e.id === selectedId) || null;
  const newId = () => "e" + Date.now().toString(36) + (nextId++).toString(36);
  const area = (v = view) => GARMENTS[state.garment].area[v];

  function snapshot() {
    return JSON.stringify({ garment: state.garment, color: state.color, front: state.front, back: state.back });
  }

  function commit() {
    const snap = snapshot();
    if (undoStack[undoStack.length - 1] === snap) return;
    undoStack.push(snap);
    if (undoStack.length > 80) undoStack.shift();
    redoStack = [];
    save();
    updateToolbar();
  }

  function restore(snap) {
    state = JSON.parse(snap);
    if (!getSelected()) selectedId = null;
    save();
    refreshAll();
  }

  function undo() {
    if (undoStack.length < 2) return;
    redoStack.push(undoStack.pop());
    restore(undoStack[undoStack.length - 1]);
  }
  function redo() {
    if (!redoStack.length) return;
    const s = redoStack.pop();
    undoStack.push(s);
    restore(s);
  }

  function save() {
    const usedImages = new Set([...state.front, ...state.back].filter((e) => e.type === "image").map((e) => e.img));
    const imgs = {};
    usedImages.forEach((id) => {
      if (images[id]) imgs[id] = { src: images[id].src, name: images[id].name };
    });
    const payload = { state, view, images: imgs };
    try {
      localStorage.setItem(STATE_KEY, JSON.stringify(payload));
    } catch (e) {
      // Uploaded images can be too large to keep. Save the rest of the design.
      try {
        localStorage.setItem(STATE_KEY, JSON.stringify({ state, view, images: {} }));
      } catch (e2) {
        /* storage unavailable */
      }
    }
  }

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STATE_KEY));
      if (!saved || !saved.state || !GARMENTS[saved.state.garment]) return;
      Object.entries(saved.images || {}).forEach(([id, im]) => addImageSource(id, im.src, im.name));
      state = saved.state;
      // Drop uploaded images that couldn't be saved.
      ["front", "back"].forEach((v) => {
        state[v] = (state[v] || []).filter((e) => e.type !== "image" || images[e.img] || e.img === "logo");
      });
      view = saved.view === "back" ? "back" : "front";
    } catch (e) {
      /* start fresh */
    }
  }

  /* ---------- Images ---------- */

  function addImageSource(id, src, name) {
    const img = new Image();
    img.onload = () => render();
    img.src = src;
    images[id] = { src, name, img };
    return images[id];
  }
  addImageSource("logo", "assets/logo-web.png", "Texas Huddle Co. logo");

  function readUpload(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          // Downscale big photos so the page stays fast.
          const max = 1400;
          const s = Math.min(1, max / Math.max(img.naturalWidth || max, img.naturalHeight || max));
          const w = Math.max(1, Math.round((img.naturalWidth || max) * s));
          const h = Math.max(1, Math.round((img.naturalHeight || max) * s));
          const c = document.createElement("canvas");
          c.width = w;
          c.height = h;
          c.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve({ src: c.toDataURL("image/png"), w, h });
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  /* ---------- Element geometry ---------- */

  function fontString(el) {
    const f = fontById[el.font] || FONTS[0];
    return `${f.weight} ${el.size}px "${f.family}"`;
  }

  function layoutText(el, c = ctx) {
    c.save();
    c.font = fontString(el);
    const chars = Array.from(el.text || "");
    const widths = chars.map((ch) => c.measureText(ch).width);
    c.restore();
    const spacing = el.spacing || 0;
    const total = widths.reduce((a, b) => a + b, 0) + spacing * Math.max(0, chars.length - 1);
    const out = [];
    const arch = el.arch || 0;
    if (!arch || total === 0) {
      let x = -total / 2;
      chars.forEach((ch, i) => {
        out.push({ ch, x: x + widths[i] / 2, y: 0, rot: 0 });
        x += widths[i] + spacing;
      });
      const hh = el.size * 0.62;
      return { chars: out, minX: -Math.max(total, el.size * 0.5) / 2, maxX: Math.max(total, el.size * 0.5) / 2, minY: -hh, maxY: hh };
    }
    const sign = arch > 0 ? 1 : -1;
    const span = (Math.abs(arch) / 100) * Math.PI * 0.95;
    const R = total / span;
    let s = -total / 2;
    chars.forEach((ch, i) => {
      const theta = (s + widths[i] / 2) / R;
      out.push({ ch, x: R * Math.sin(theta), y: sign * (R - R * Math.cos(theta)), rot: sign * theta });
      s += widths[i] + spacing;
    });
    const dev = sign * (R - R * Math.cos(span / 2));
    out.forEach((p) => (p.y -= dev / 2));
    const pad = el.size * 0.62;
    const xs = out.map((p) => p.x);
    const ys = out.map((p) => p.y);
    return {
      chars: out,
      minX: Math.min(...xs) - pad,
      maxX: Math.max(...xs) + pad,
      minY: Math.min(...ys) - pad,
      maxY: Math.max(...ys) + pad,
    };
  }

  function boundsOf(el) {
    if (el.type === "text") {
      const l = layoutText(el);
      return { minX: l.minX, maxX: l.maxX, minY: l.minY, maxY: l.maxY };
    }
    if (el.type === "image") return { minX: -el.w / 2, maxX: el.w / 2, minY: -el.h / 2, maxY: el.h / 2 };
    const b = GRAPHICS[el.shape].bounds;
    return { minX: b[0], minY: b[1], maxX: b[2], maxY: b[3] };
  }

  function toWorld(el, lx, ly) {
    const c = Math.cos(el.rot), s = Math.sin(el.rot);
    lx *= el.scale;
    ly *= el.scale;
    return { x: el.x + lx * c - ly * s, y: el.y + lx * s + ly * c };
  }
  function toLocal(el, p) {
    const dx = p.x - el.x, dy = p.y - el.y;
    const c = Math.cos(-el.rot), s = Math.sin(-el.rot);
    return { x: (dx * c - dy * s) / el.scale, y: (dx * s + dy * c) / el.scale };
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const pxToUnits = () => W / (canvas.getBoundingClientRect().width || W);

  function handlesOf(el) {
    const k = pxToUnits();
    const b = boundsOf(el);
    const pad = (8 * k) / el.scale;
    const midX = (b.minX + b.maxX) / 2;
    return {
      top: toWorld(el, midX, b.minY - pad),
      rotate: toWorld(el, midX, b.minY - pad - (30 * k) / el.scale),
      scale: toWorld(el, b.maxX + pad, b.maxY + pad),
      remove: toWorld(el, b.maxX + pad, b.minY - pad),
      radius: 14 * k,
    };
  }

  function hitTest(p) {
    const list = els();
    for (let i = list.length - 1; i >= 0; i--) {
      const el = list[i];
      const l = toLocal(el, p);
      const b = boundsOf(el);
      const slop = (6 * pxToUnits()) / el.scale;
      if (l.x >= b.minX - slop && l.x <= b.maxX + slop && l.y >= b.minY - slop && l.y <= b.maxY + slop) return el;
    }
    return null;
  }

  function outsideArea(el, v = view) {
    const [ax, ay, aw, ah] = area(v);
    const b = boundsOf(el);
    const shrink = el.type === "text" ? 0.12 * el.size : 0; // text boxes include some air
    const pts = [
      toWorld(el, b.minX + shrink, b.minY + shrink),
      toWorld(el, b.maxX - shrink, b.minY + shrink),
      toWorld(el, b.minX + shrink, b.maxY - shrink),
      toWorld(el, b.maxX - shrink, b.maxY - shrink),
    ];
    return pts.some((q) => q.x < ax - 2 || q.x > ax + aw + 2 || q.y < ay - 2 || q.y > ay + ah + 2);
  }

  /* ---------- Drawing ---------- */

  function bodyPath(garment, v) {
    return new Path2D((v === "back" ? GARMENT_BACK_SHAPES : GARMENT_SHAPES)[garment]);
  }

  function drawGarmentBase(c, garment, hex, v) {
    const light = isLightColor(hex);
    c.save();
    c.scale(U, U);
    c.lineJoin = "round";
    const stroke = light ? "rgba(3,31,58,.35)" : "rgba(0,0,0,.5)";
    if (garment === "hoodie" && v === "front") {
      const hood = new Path2D("M74 34 Q72 6 100 4 Q128 6 126 34 Q100 52 74 34 Z");
      c.fillStyle = hex;
      c.fill(hood);
      c.fillStyle = "rgba(0,0,0,.12)";
      c.fill(hood);
      c.strokeStyle = stroke;
      c.lineWidth = 0.8;
      c.stroke(hood);
    }
    const body = bodyPath(garment, v);
    c.save();
    c.shadowColor = "rgba(3,31,58,.22)";
    c.shadowBlur = 24;
    c.shadowOffsetY = 8;
    c.fillStyle = hex;
    c.fill(body);
    c.restore();
    c.strokeStyle = stroke;
    c.lineWidth = 0.8;
    c.stroke(body);
    c.restore();
  }

  function drawGarmentOverlay(c, garment, hex, v) {
    const light = isLightColor(hex);
    const shade = light ? "rgba(3,31,58,.10)" : "rgba(0,0,0,.25)";
    const stroke = light ? "rgba(3,31,58,.35)" : "rgba(0,0,0,.5)";
    const body = bodyPath(garment, v);
    c.save();
    c.scale(U, U);
    c.lineJoin = "round";
    c.lineCap = "round";

    // Soft light across the fabric, so prints look printed on.
    c.save();
    c.clip(body);
    const g = c.createLinearGradient(20, 10, 180, 190);
    g.addColorStop(0, "rgba(255,255,255,.10)");
    g.addColorStop(0.55, "rgba(255,255,255,0)");
    g.addColorStop(1, "rgba(0,0,0,.10)");
    c.fillStyle = g;
    c.fillRect(0, 0, 200, 200);
    c.restore();

    const line = (d, w, color = shade) => {
      c.strokeStyle = color;
      c.lineWidth = w;
      c.stroke(new Path2D(d));
    };

    if (garment === "tee" || garment === "longsleeve") {
      line(v === "front" ? "M82 22 Q100 36 118 22" : "M82 22 Q100 28 118 22", 3);
      line("M60 31 L60 " + (garment === "tee" ? 73 : 80) + " M140 31 L140 " + (garment === "tee" ? 73 : 80), 0.8);
      line("M61 175 L139 175", 0.8);
      if (garment === "longsleeve") line("M35 151 L14 145 M165 151 L186 145", 1);
    } else if (garment === "tank") {
      line(v === "front" ? "M72 20 Q76 52 100 54 Q124 52 128 20" : "M72 20 Q78 38 100 40 Q122 38 128 20", 2.4);
      line("M58 24 Q62 62 50 80 M142 24 Q138 62 150 80", 1.6);
      line("M51 175 L149 175", 0.8);
    } else if (garment === "hoodie") {
      line("M59 170 L141 170", 1.2);
      line("M36 151 L14 145 M164 151 L186 145", 1.2);
      line("M58 33 L58 84 M142 33 L142 84", 0.8);
      if (v === "front") {
        line("M80 34 Q100 46 120 34", 3);
        line("M74 144 L126 144 L134 172 L66 172 Z", 1.2, stroke);
        const cord = light ? "rgba(3,31,58,.55)" : "rgba(247,240,225,.8)";
        line("M92 40 L90 70 M108 40 L110 70", 1.6, cord);
      } else {
        const hood = new Path2D("M70 30 Q100 22 130 30 Q134 64 100 72 Q66 64 70 30 Z");
        c.save();
        c.shadowColor = "rgba(0,0,0,.18)";
        c.shadowBlur = 10;
        c.shadowOffsetY = 4;
        c.fillStyle = hex;
        c.fill(hood);
        c.restore();
        c.strokeStyle = stroke;
        c.lineWidth = 0.8;
        c.stroke(hood);
        line("M100 30 Q98 52 100 70", 1);
      }
    }
    c.restore();
  }

  function drawElement(c, el) {
    c.save();
    c.translate(el.x, el.y);
    c.rotate(el.rot);
    c.scale(el.scale, el.scale);
    if (el.type === "text") {
      const l = layoutText(el, c);
      c.font = fontString(el);
      c.textAlign = "center";
      c.textBaseline = "middle";
      c.lineJoin = "round";
      const drawChars = (fn) =>
        l.chars.forEach((p) => {
          c.save();
          c.translate(p.x, p.y);
          c.rotate(p.rot);
          fn(p.ch);
          c.restore();
        });
      if (el.stroke && el.strokeW > 0) {
        c.strokeStyle = el.stroke;
        c.lineWidth = el.strokeW * 2;
        drawChars((ch) => c.strokeText(ch, 0, 0));
      }
      c.fillStyle = el.fill;
      drawChars((ch) => c.fillText(ch, 0, 0));
    } else if (el.type === "image") {
      const im = images[el.img];
      if (im && im.img.complete && im.img.naturalWidth) c.drawImage(im.img, -el.w / 2, -el.h / 2, el.w, el.h);
    } else if (GRAPHICS[el.shape]) {
      GRAPHICS[el.shape].draw(c, el);
    }
    c.restore();
  }

  function drawScene(c, v, { guides = false, selection = null, background = null } = {}) {
    c.save();
    c.clearRect(0, 0, W, W);
    if (background) {
      c.fillStyle = background;
      c.fillRect(0, 0, W, W);
    }
    drawGarmentBase(c, state.garment, state.color, v);

    c.save();
    c.scale(U, U);
    c.clip(bodyPath(state.garment, v));
    c.scale(1 / U, 1 / U);
    state[v].forEach((el) => drawElement(c, el));
    c.restore();

    drawGarmentOverlay(c, state.garment, state.color, v);

    if (guides) {
      const [ax, ay, aw, ah] = area(v);
      const light = isLightColor(state.color);
      c.save();
      c.strokeStyle = light ? "rgba(3,31,58,.4)" : "rgba(247,240,225,.5)";
      c.lineWidth = 2;
      c.setLineDash([10, 8]);
      c.strokeRect(ax, ay, aw, ah);
      c.setLineDash([]);
      c.fillStyle = light ? "rgba(3,31,58,.45)" : "rgba(247,240,225,.6)";
      c.font = '500 18px "Oswald", sans-serif';
      c.textBaseline = "top";
      c.fillText("PRINT AREA", ax + 8, ay + 8);
      if (dragState && dragState.snapped) {
        c.strokeStyle = "#D40F27";
        c.lineWidth = 2;
        c.beginPath();
        c.moveTo(ax + aw / 2, ay);
        c.lineTo(ax + aw / 2, ay + ah);
        c.stroke();
      }
      c.restore();
    }

    if (selection) drawSelection(c, selection);
    c.restore();
  }

  function drawSelection(c, el) {
    const b = boundsOf(el);
    const k = pxToUnits();
    const pad = (8 * k) / el.scale;
    c.save();
    c.translate(el.x, el.y);
    c.rotate(el.rot);
    c.scale(el.scale, el.scale);
    const r = [b.minX - pad, b.minY - pad, b.maxX - b.minX + pad * 2, b.maxY - b.minY + pad * 2];
    c.lineWidth = (4 * k) / el.scale;
    c.strokeStyle = "rgba(255,255,255,.9)";
    c.strokeRect(...r);
    c.lineWidth = (2 * k) / el.scale;
    c.strokeStyle = "#031F3A";
    c.setLineDash([(7 * k) / el.scale, (5 * k) / el.scale]);
    c.strokeRect(...r);
    c.restore();

    const h = handlesOf(el);
    c.save();
    c.strokeStyle = "#031F3A";
    c.lineWidth = 2 * k;
    c.beginPath();
    c.moveTo(h.top.x, h.top.y);
    c.lineTo(h.rotate.x, h.rotate.y);
    c.stroke();
    const dot = (p, fill, drawIcon) => {
      c.beginPath();
      c.arc(p.x, p.y, h.radius, 0, Math.PI * 2);
      c.fillStyle = fill;
      c.fill();
      c.lineWidth = 2 * k;
      c.strokeStyle = fill === "#FFFFFF" ? "#031F3A" : "#FFFFFF";
      c.stroke();
      c.save();
      c.translate(p.x, p.y);
      c.lineWidth = 2.2 * k;
      c.lineCap = "round";
      drawIcon();
      c.restore();
    };
    const u = h.radius / 14;
    dot(h.rotate, "#FFFFFF", () => {
      c.strokeStyle = "#031F3A";
      c.beginPath();
      c.arc(0, 0, 6 * u, -Math.PI * 0.1, Math.PI * 1.4);
      c.stroke();
      c.beginPath();
      c.moveTo(6 * u, -5 * u);
      c.lineTo(6 * u, 0);
      c.lineTo(1 * u, -1 * u);
      c.stroke();
    });
    dot(h.scale, "#FFFFFF", () => {
      c.strokeStyle = "#031F3A";
      c.beginPath();
      c.moveTo(-5 * u, -5 * u);
      c.lineTo(5 * u, 5 * u);
      c.moveTo(5 * u, 0);
      c.lineTo(5 * u, 5 * u);
      c.lineTo(0, 5 * u);
      c.moveTo(-5 * u, 0);
      c.lineTo(-5 * u, -5 * u);
      c.lineTo(0, -5 * u);
      c.stroke();
    });
    dot(h.remove, "#D40F27", () => {
      c.strokeStyle = "#FFFFFF";
      c.beginPath();
      c.moveTo(-4.5 * u, -4.5 * u);
      c.lineTo(4.5 * u, 4.5 * u);
      c.moveTo(4.5 * u, -4.5 * u);
      c.lineTo(-4.5 * u, 4.5 * u);
      c.stroke();
    });
    c.restore();
  }

  let rafPending = false;
  function render() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      drawScene(ctx, view, { guides: true, selection: getSelected() });
      $("[data-area-warning]").hidden = !els().some((el) => outsideArea(el));
    });
  }

  /* ---------- Canvas interaction ---------- */

  let dragState = null;

  function canvasPoint(e) {
    const r = canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) * W) / r.width, y: ((e.clientY - r.top) * W) / r.height };
  }

  function handleAt(el, p) {
    const h = handlesOf(el);
    const reach = h.radius * 1.5;
    if (dist(p, h.remove) <= reach) return "remove";
    if (dist(p, h.rotate) <= reach) return "rotate";
    if (dist(p, h.scale) <= reach) return "scale";
    return null;
  }

  canvas.addEventListener("pointerdown", (e) => {
    const p = canvasPoint(e);
    const sel = getSelected();
    if (sel) {
      const h = handleAt(sel, p);
      if (h === "remove") {
        removeSelected();
        return;
      }
      if (h) {
        dragState = { mode: h, el: sel, start: p, orig: { ...sel }, moved: false };
        canvas.setPointerCapture(e.pointerId);
        return;
      }
    }
    const hit = hitTest(p);
    if (hit) {
      if (hit.id !== selectedId) select(hit.id);
      dragState = { mode: "move", el: hit, start: p, orig: { ...hit }, moved: false };
      canvas.setPointerCapture(e.pointerId);
    } else {
      select(null);
    }
    render();
  });

  canvas.addEventListener("pointermove", (e) => {
    const p = canvasPoint(e);
    if (!dragState) {
      const sel = getSelected();
      const h = sel && handleAt(sel, p);
      canvas.style.cursor = h === "scale" ? "nwse-resize" : h ? "pointer" : hitTest(p) ? "move" : "default";
      return;
    }
    const { el, orig, start, mode } = dragState;
    if (dist(p, start) > 1) dragState.moved = true;
    if (mode === "move") {
      el.x = orig.x + (p.x - start.x);
      el.y = orig.y + (p.y - start.y);
      const [ax, , aw] = area();
      const cx = ax + aw / 2;
      dragState.snapped = Math.abs(el.x - cx) < 8 * pxToUnits();
      if (dragState.snapped) el.x = cx;
    } else if (mode === "scale") {
      const d0 = dist(start, orig), d1 = dist(p, orig);
      if (d0 > 0) el.scale = clamp((orig.scale * d1) / d0, 0.1, 8);
    } else if (mode === "rotate") {
      const a0 = Math.atan2(start.y - orig.y, start.x - orig.x);
      const a1 = Math.atan2(p.y - orig.y, p.x - orig.x);
      let deg = ((orig.rot + a1 - a0) * 180) / Math.PI;
      deg = ((((deg + 180) % 360) + 360) % 360) - 180;
      const snap = Math.round(deg / 45) * 45;
      if (Math.abs(deg - snap) < 4) deg = snap;
      el.rot = (deg * Math.PI) / 180;
    }
    render();
  });

  const endDrag = () => {
    if (!dragState) return;
    const moved = dragState.moved;
    dragState = null;
    if (moved) {
      commit();
      syncEditValues();
    }
    render();
  };
  canvas.addEventListener("pointerup", endDrag);
  canvas.addEventListener("pointercancel", endDrag);

  document.addEventListener("keydown", (e) => {
    const tag = (e.target.tagName || "").toLowerCase();
    const typing = tag === "input" || tag === "textarea" || tag === "select";
    const mod = e.ctrlKey || e.metaKey;
    if (mod && e.key.toLowerCase() === "z" && !typing) {
      e.preventDefault();
      e.shiftKey ? redo() : undo();
      return;
    }
    if (mod && e.key.toLowerCase() === "y" && !typing) {
      e.preventDefault();
      redo();
      return;
    }
    if (typing) return;
    const sel = getSelected();
    if (!sel) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      removeSelected();
    } else if (e.key.startsWith("Arrow")) {
      e.preventDefault();
      const step = e.shiftKey ? 20 : 4;
      if (e.key === "ArrowLeft") sel.x -= step;
      if (e.key === "ArrowRight") sel.x += step;
      if (e.key === "ArrowUp") sel.y -= step;
      if (e.key === "ArrowDown") sel.y += step;
      render();
      clearTimeout(keyCommitTimer);
      keyCommitTimer = setTimeout(commit, 400);
    } else if (e.key === "Escape") {
      select(null);
    }
  });
  let keyCommitTimer;

  /* ---------- Adding things ---------- */

  function placeNew(el, v = view) {
    const [ax, ay, aw, ah] = area(v);
    el.id = newId();
    el.x = el.x ?? ax + aw / 2;
    el.y = el.y ?? ay + ah * 0.35;
    el.rot = el.rot ?? 0;
    el.scale = el.scale ?? 1;
    state[v].push(el);
    return el;
  }

  function afterAdd(el) {
    select(el.id);
    commit();
    showTab("edit");
    render();
  }

  function defaultInk() {
    return contrastOn(state.color);
  }

  function addText(props = {}) {
    const el = placeNew({
      type: "text",
      text: "YOUR TEXT",
      font: "graduate",
      size: 80,
      fill: defaultInk(),
      stroke: null,
      strokeW: 4,
      arch: 0,
      spacing: 2,
      ...props,
    });
    // Keep new text inside the print area.
    const b = boundsOf(el);
    const [, , aw] = area();
    const width = b.maxX - b.minX;
    if (width * el.scale > aw) el.scale = aw / width;
    return el;
  }

  function addGraphic(shape) {
    const fill = isLightColor(state.color) ? "#D40F27" : "#F7F0E1";
    return placeNew({ type: "shape", shape, fill, scale: 1.2 });
  }

  function addImage(id, w, h) {
    const max = 240;
    const s = Math.min(1, max / Math.max(w, h));
    return placeNew({ type: "image", img: id, w: Math.round(w * s), h: Math.round(h * s) });
  }

  $("[data-add-text]").addEventListener("click", () => afterAdd(addText()));

  $("[data-graphics]").innerHTML =
    Object.entries(GRAPHICS)
      .map(([id, g]) => `<button type="button" class="graphic-btn" data-add-graphic="${id}" aria-label="Add ${esc(g.label)}"><canvas width="120" height="120" data-graphic-preview="${id}"></canvas><span>${esc(g.label)}</span></button>`)
      .join("") +
    `<button type="button" class="graphic-btn" data-add-logo aria-label="Add Texas Huddle Co. logo"><img src="assets/logo-web.png" alt=""><span>Our logo</span></button>`;

  $$("[data-graphic-preview]").forEach((cv) => {
    const g = GRAPHICS[cv.dataset.graphicPreview];
    const c = cv.getContext("2d");
    const b = g.bounds;
    const s = 90 / Math.max(b[2] - b[0], b[3] - b[1]);
    c.translate(60 - ((b[0] + b[2]) / 2) * s, 60 - ((b[1] + b[3]) / 2) * s);
    c.scale(s, s);
    g.draw(c, { fill: "#031F3A" });
  });

  $("[data-graphics]").addEventListener("click", (e) => {
    const g = e.target.closest("[data-add-graphic]");
    if (g) return afterAdd(addGraphic(g.dataset.addGraphic));
    if (e.target.closest("[data-add-logo]")) {
      const im = images.logo.img;
      afterAdd(addImage("logo", im.naturalWidth || 720, im.naturalHeight || 443));
    }
  });

  $("[data-upload]").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    e.target.value = "";
    if (!file) return;
    if (file.size > 15 * 1024 * 1024) {
      showToast("That file is over 15 MB. Try a smaller image.");
      return;
    }
    try {
      const { src, w, h } = await readUpload(file);
      const id = "up" + Date.now().toString(36);
      addImageSource(id, src, file.name);
      afterAdd(addImage(id, w, h));
    } catch (err) {
      showToast("We couldn't read that image. Try a PNG or JPG.");
    }
  });

  $$("[data-preset]").forEach((btn) =>
    btn.addEventListener("click", () => {
      const [ax, ay, aw, ah] = area(btn.dataset.preset === "name-number" ? "back" : "front");
      let last;
      if (btn.dataset.preset === "team-front") {
        setView("front");
        addText({ text: "TEAM NAME", arch: 38, size: 78, y: ay + 90, stroke: isLightColor(state.color) ? null : "#D40F27" });
        last = placeNew({ type: "shape", shape: "star", fill: "#D40F27", scale: 1.3, y: ay + 215 });
        addText({ text: "EST. 2026", font: "oswald", size: 34, spacing: 8, y: ay + 305 });
      } else {
        setView("back");
        addText({ text: "PLAYER", size: 62, arch: 22, spacing: 6, y: ay + 70 });
        last = addText({ text: "24", size: 250, y: ay + ah * 0.52, stroke: isLightColor(state.color) ? null : "#D40F27", strokeW: 6 });
      }
      afterAdd(last);
    })
  );

  /* ---------- Selection, editing ---------- */

  function select(id) {
    selectedId = id;
    renderEditPanel();
    render();
  }

  function removeSelected() {
    const list = els();
    const i = list.findIndex((e) => e.id === selectedId);
    if (i < 0) return;
    list.splice(i, 1);
    selectedId = null;
    commit();
    renderEditPanel();
    render();
  }

  function swatchRow(prop, value, { allowNone = false } = {}) {
    const v = (value || "").toLowerCase();
    const custom = value && !INK_COLORS.some((c) => c.hex.toLowerCase() === v);
    return `<div class="swatch-row" data-swatch-prop="${prop}">
      ${allowNone ? `<button type="button" class="swatch swatch-none" data-swatch="" aria-label="No outline" aria-pressed="${!value}"></button>` : ""}
      ${INK_COLORS.map(
        (c) =>
          `<button type="button" class="swatch" style="background:${c.hex}" data-swatch="${c.hex}" aria-label="${esc(c.name)}" title="${esc(c.name)}" aria-pressed="${c.hex.toLowerCase() === v}"></button>`
      ).join("")}
      <label class="swatch swatch-custom" title="Pick any color" aria-pressed="${!!custom}" ${custom ? `style="background:${esc(value)}"` : ""}>
        <input type="color" value="${esc(custom ? value : "#031F3A")}" data-custom-color="${prop}" aria-label="Custom color">
      </label>
    </div>`;
  }

  function renderEditPanel() {
    const panel = $("[data-edit-panel]");
    const el = getSelected();
    if (!el) {
      panel.innerHTML = `<div class="edit-empty">
        <p class="h3">Nothing selected</p>
        <p>Tap something on the shirt to change it, or add something new.</p>
        <button type="button" class="btn btn-outline-navy" data-tab-go="add">ADD SOMETHING</button>
      </div>`;
      return;
    }
    let specific = "";
    if (el.type === "text") {
      specific = `
        <div class="edit-field">
          <label for="ed-text">Text</label>
          <input id="ed-text" data-prop="text" value="${esc(el.text)}" maxlength="40" autocomplete="off">
        </div>
        <div class="edit-field">
          <span class="edit-label">Font</span>
          <div class="font-grid" role="radiogroup" aria-label="Font">
            ${FONTS.map(
              (f) =>
                `<button type="button" class="font-btn" role="radio" aria-checked="${f.id === el.font}" data-font="${f.id}" style="font-family:'${f.family}';font-weight:${f.weight}">${esc(f.label)}</button>`
            ).join("")}
          </div>
        </div>
        <div class="edit-field"><span class="edit-label">Color</span>${swatchRow("fill", el.fill)}</div>
        <div class="edit-field"><span class="edit-label">Outline</span>${swatchRow("stroke", el.stroke, { allowNone: true })}</div>
        <div class="edit-field" ${el.stroke ? "" : "hidden"} data-stroke-width>
          <label for="ed-sw">Outline thickness</label>
          <input id="ed-sw" type="range" min="1" max="14" step="1" data-prop="strokeW" value="${el.strokeW}">
        </div>
        <div class="edit-field">
          <label for="ed-arch">Curve <span class="edit-hint">arch up or down</span></label>
          <input id="ed-arch" type="range" min="-100" max="100" step="1" data-prop="arch" value="${el.arch}">
        </div>
        <div class="edit-field">
          <label for="ed-sp">Letter spacing</label>
          <input id="ed-sp" type="range" min="-6" max="40" step="1" data-prop="spacing" value="${el.spacing}">
        </div>`;
    } else if (el.type === "shape") {
      specific = `<div class="edit-field"><span class="edit-label">Color</span>${swatchRow("fill", el.fill)}</div>`;
    } else {
      specific = `<p class="panel-note">${el.img === "logo" ? "Texas Huddle Co. logo" : `Your image: ${esc(images[el.img] ? images[el.img].name : "")}`}</p>`;
    }
    const title = el.type === "text" ? "Edit text" : el.type === "shape" ? `Edit ${GRAPHICS[el.shape].label.toLowerCase()}` : "Edit image";
    panel.innerHTML = `
      <h2 class="panel-title">${title}</h2>
      ${specific}
      <div class="edit-field">
        <label for="ed-size">Size</label>
        <input id="ed-size" type="range" min="10" max="500" step="1" data-prop="scalePct" value="${Math.round(el.scale * 100)}">
      </div>
      <div class="edit-field">
        <label for="ed-rot">Rotation</label>
        <input id="ed-rot" type="range" min="-180" max="180" step="1" data-prop="rotDeg" value="${Math.round((el.rot * 180) / Math.PI)}">
      </div>
      <div class="edit-actions">
        <button type="button" class="chip-btn" data-action="center">Center</button>
        <button type="button" class="chip-btn" data-action="forward">Bring forward</button>
        <button type="button" class="chip-btn" data-action="backward">Send back</button>
        <button type="button" class="chip-btn" data-action="duplicate">Duplicate</button>
        <button type="button" class="chip-btn chip-danger" data-action="delete">Delete</button>
      </div>`;
  }

  function syncEditValues() {
    const el = getSelected();
    if (!el) return;
    const size = $("[data-prop=scalePct]");
    const rot = $("[data-prop=rotDeg]");
    if (size) size.value = Math.round(el.scale * 100);
    if (rot) rot.value = Math.round((el.rot * 180) / Math.PI);
  }

  const editPanel = $("[data-edit-panel]");
  editPanel.addEventListener("input", (e) => {
    const el = getSelected();
    if (!el) return;
    const t = e.target;
    if (t.dataset.customColor) {
      el[t.dataset.customColor] = t.value;
      if (t.dataset.customColor === "stroke") $("[data-stroke-width]").hidden = false;
      render();
      return;
    }
    const prop = t.dataset.prop;
    if (!prop) return;
    if (prop === "text") el.text = t.value;
    else if (prop === "scalePct") el.scale = clamp(+t.value / 100, 0.1, 8);
    else if (prop === "rotDeg") el.rot = (+t.value * Math.PI) / 180;
    else el[prop] = +t.value;
    render();
  });
  editPanel.addEventListener("change", (e) => {
    if (e.target.dataset.customColor) {
      commit();
      renderEditPanel();
      return;
    }
    if (e.target.dataset.prop) commit();
  });
  editPanel.addEventListener("click", (e) => {
    const el = getSelected();
    if (!el) return;
    const sw = e.target.closest("[data-swatch]");
    if (sw) {
      const prop = sw.closest("[data-swatch-prop]").dataset.swatchProp;
      el[prop] = sw.dataset.swatch || null;
      commit();
      renderEditPanel();
      render();
      return;
    }
    const fb = e.target.closest("[data-font]");
    if (fb) {
      el.font = fb.dataset.font;
      commit();
      $$("[data-font]", editPanel).forEach((b) => b.setAttribute("aria-checked", b === fb));
      render();
      return;
    }
    const act = e.target.closest("[data-action]");
    if (!act) return;
    const list = els();
    const i = list.indexOf(el);
    switch (act.dataset.action) {
      case "center": {
        const [ax, , aw] = area();
        el.x = ax + aw / 2;
        break;
      }
      case "forward":
        if (i < list.length - 1) [list[i], list[i + 1]] = [list[i + 1], list[i]];
        break;
      case "backward":
        if (i > 0) [list[i], list[i - 1]] = [list[i - 1], list[i]];
        break;
      case "duplicate": {
        const copy = { ...JSON.parse(JSON.stringify(el)), id: newId(), x: el.x + 30, y: el.y + 30 };
        list.push(copy);
        selectedId = copy.id;
        renderEditPanel();
        break;
      }
      case "delete":
        removeSelected();
        return;
    }
    commit();
    render();
  });

  /* ---------- Shirt options ---------- */

  function renderGarmentOptions() {
    $("[data-garment-styles]").innerHTML = Object.entries(GARMENTS)
      .map(
        ([id, g]) => `<button type="button" class="style-btn" data-garment="${id}" aria-pressed="${id === state.garment}">
          <svg viewBox="0 0 200 200" aria-hidden="true">
            ${id === "hoodie" ? `<path d="M74 34 Q72 6 100 4 Q128 6 126 34 Q100 52 74 34 Z" fill="currentColor" opacity=".7"/>` : ""}
            <path d="${GARMENT_SHAPES[id]}" fill="currentColor"/>
          </svg>
          <span>${esc(g.label)}</span></button>`
      )
      .join("");
    $("[data-garment-colors]").innerHTML = GARMENT_COLORS.map(
      (c) =>
        `<button type="button" class="swatch swatch-lg" style="background:${c.hex}" data-garment-color="${c.hex}" aria-label="${esc(c.name)}" title="${esc(c.name)}" aria-pressed="${c.hex === state.color}"></button>`
    ).join("");
    const cur = GARMENT_COLORS.find((c) => c.hex === state.color);
    $("[data-garment-color-name]").textContent = cur ? cur.name : state.color;
  }

  $("[data-panel=shirt]").addEventListener("click", (e) => {
    const g = e.target.closest("[data-garment]");
    const c = e.target.closest("[data-garment-color]");
    if (g) state.garment = g.dataset.garment;
    else if (c) state.color = c.dataset.garmentColor;
    else return;
    commit();
    renderGarmentOptions();
    render();
  });

  /* ---------- Tabs, toolbar, view ---------- */

  function showTab(name) {
    $$("[data-tab]").forEach((t) => t.setAttribute("aria-selected", t.dataset.tab === name));
    $$("[data-panel]").forEach((p) => (p.hidden = p.dataset.panel !== name));
    if (name === "edit") renderEditPanel();
  }
  $(".tool-tabs").addEventListener("click", (e) => {
    const t = e.target.closest("[data-tab]");
    if (t) showTab(t.dataset.tab);
  });
  document.addEventListener("click", (e) => {
    const go = e.target.closest("[data-tab-go]");
    if (go) showTab(go.dataset.tabGo);
  });

  function setView(v) {
    view = v;
    selectedId = null;
    $$("[data-view]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === v));
    renderEditPanel();
    save();
    render();
  }
  $$("[data-view]").forEach((b) => b.addEventListener("click", () => setView(b.dataset.view)));

  function updateToolbar() {
    $("[data-undo]").disabled = undoStack.length < 2;
    $("[data-redo]").disabled = !redoStack.length;
  }
  $("[data-undo]").addEventListener("click", undo);
  $("[data-redo]").addEventListener("click", redo);
  $("[data-reset]").addEventListener("click", () => {
    if (!state.front.length && !state.back.length) return;
    if (!confirm("Start over? This clears everything on the front and back.")) return;
    state.front = [];
    state.back = [];
    selectedId = null;
    commit();
    refreshAll();
  });
  $("[data-download]").addEventListener("click", async () => {
    const blob = await makeMockup(null);
    downloadBlob(blob, "texas-huddle-design.png");
  });

  function refreshAll() {
    renderGarmentOptions();
    renderEditPanel();
    updateToolbar();
    $$("[data-view]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.view === view));
    render();
  }

  /* ---------- Mockup image ---------- */

  function makeMockup(number) {
    const out = document.createElement("canvas");
    const HEAD = 120, FOOT = 80;
    out.width = 2000;
    out.height = HEAD + W + FOOT;
    const c = out.getContext("2d");
    c.fillStyle = "#F7F0E1";
    c.fillRect(0, 0, out.width, out.height);

    ["front", "back"].forEach((v, i) => {
      const panel = document.createElement("canvas");
      panel.width = panel.height = W;
      drawScene(panel.getContext("2d"), v, { background: "#E9ECEF" });
      c.drawImage(panel, i * W, HEAD);
      c.fillStyle = "#031F3A";
      c.font = '700 34px "Oswald", sans-serif';
      c.textBaseline = "top";
      c.fillText(v.toUpperCase(), i * W + 30, HEAD + 24);
    });
    c.fillStyle = "#CFC3A8";
    c.fillRect(W - 1, HEAD, 2, W);

    c.fillStyle = "#031F3A";
    c.fillRect(0, 0, out.width, HEAD);
    c.fillStyle = "#D40F27";
    c.fillRect(0, HEAD - 6, out.width, 6);
    const logo = images.logo.img;
    let tx = 40;
    if (logo.complete && logo.naturalWidth) {
      const lh = 90, lw = (logo.naturalWidth / logo.naturalHeight) * lh;
      c.drawImage(logo, 30, 12, lw, lh);
      tx = 30 + lw + 24;
    }
    c.fillStyle = "#F7F0E1";
    c.textBaseline = "middle";
    c.font = '400 44px "Alfa Slab One", Georgia, serif';
    c.fillText("CUSTOM DESIGN", tx, HEAD / 2 - 3);
    if (number) {
      c.textAlign = "right";
      c.font = '700 40px "Oswald", sans-serif';
      c.fillText(number, out.width - 40, HEAD / 2 - 3);
      c.textAlign = "left";
    }

    c.fillStyle = "#031F3A";
    c.font = '500 30px "Oswald", sans-serif';
    c.textBaseline = "middle";
    c.fillText(`${GARMENTS[state.garment].label.toUpperCase()}  ·  ${colorName(state.color).toUpperCase()}`, 40, HEAD + W + FOOT / 2);
    c.textAlign = "right";
    c.font = '400 26px "Inter", sans-serif';
    c.fillText(`${STORE.website}  ·  ${STORE.phone}`, out.width - 40, HEAD + W + FOOT / 2);

    return new Promise((resolve) => out.toBlob(resolve, "image/png"));
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }

  function colorName(hex) {
    const h = (hex || "").toLowerCase();
    const found = [...GARMENT_COLORS, ...INK_COLORS].find((c) => c.hex.toLowerCase() === h);
    return found ? found.name : hex;
  }

  function describeDesign() {
    const lines = [`Garment: ${GARMENTS[state.garment].label}, ${colorName(state.color)}`];
    ["front", "back"].forEach((v) => {
      lines.push("");
      lines.push(`${v.toUpperCase()}:`);
      if (!state[v].length) {
        lines.push("- (blank)");
        return;
      }
      state[v].forEach((el) => {
        if (el.type === "text") {
          const f = fontById[el.font] || FONTS[0];
          let d = `- Text "${el.text}" in ${f.label} (${f.family}), ${colorName(el.fill)}`;
          if (el.stroke) d += ` with ${colorName(el.stroke)} outline`;
          if (el.arch) d += el.arch > 0 ? ", arched up" : ", arched down";
          lines.push(d);
        } else if (el.type === "shape") {
          lines.push(`- ${GRAPHICS[el.shape].label} graphic, ${colorName(el.fill)}`);
        } else if (el.img === "logo") {
          lines.push("- Texas Huddle Co. logo");
        } else {
          lines.push(`- Customer image "${images[el.img] ? images[el.img].name : "upload"}" (customer will send the original file)`);
        }
      });
    });
    return lines.join("\n");
  }

  /* ---------- Quote form ---------- */

  const qform = $("[data-quote-form]");
  $("[data-size-qty]").innerHTML = SIZES.map(
    (s) => `<label class="size-qty"><span>${s}</span><input type="number" min="0" max="9999" inputmode="numeric" name="qty-${s}" placeholder="0" aria-label="Quantity ${s}"></label>`
  ).join("");

  const qtyTotal = () => SIZES.reduce((sum, s) => sum + Math.max(0, parseInt(qform[`qty-${s}`].value, 10) || 0), 0);
  const updateQuoteForm = () => {
    $("[data-qty-total]").textContent = qtyTotal();
    $("[data-qty-req]").hidden = qform.kind.value !== "quote";
  };
  qform.addEventListener("input", (e) => {
    e.target.removeAttribute("aria-invalid");
    updateQuoteForm();
  });
  qform.addEventListener("change", updateQuoteForm);

  const today = new Date();
  qform.needBy.min = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

  try {
    const c = JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || {};
    if (c.name) qform.name.value = c.name;
    if (c.email) qform.email.value = c.email;
    if (c.phone) qform.phone.value = c.phone;
  } catch (e) {
    /* nothing saved */
  }

  function makeNumber() {
    const d = new Date();
    const ymd = String(d.getFullYear()).slice(2) + String(d.getMonth() + 1).padStart(2, "0") + String(d.getDate()).padStart(2, "0");
    return `TQ-${ymd}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  }

  qform.addEventListener("submit", async (e) => {
    e.preventDefault();
    const err = $("[data-quote-error]");
    const problems = [];
    const nameOk = !!qform.name.value.trim();
    const emailOk = /^\S+@\S+\.\S+$/.test(qform.email.value.trim());
    qform.name.setAttribute("aria-invalid", !nameOk);
    qform.email.setAttribute("aria-invalid", !emailOk);
    if (!state.front.length && !state.back.length) problems.push("something on your shirt first (use the Add tab above)");
    if (!nameOk) problems.push("your name");
    if (!emailOk) problems.push("a valid email");
    const isQuote = qform.kind.value === "quote";
    const total = qtyTotal();
    if (isQuote && total < 1) problems.push("how many shirts you need in each size");
    if (problems.length) {
      err.textContent = `Please add ${problems.join(", ")}.`;
      err.hidden = false;
      const first = qform.querySelector('[aria-invalid="true"]');
      if (first) first.focus();
      else if (!state.front.length && !state.back.length) document.getElementById("designer").scrollIntoView();
      return;
    }
    err.hidden = true;

    const customer = { name: qform.name.value.trim(), email: qform.email.value.trim(), phone: qform.phone.value.trim() };
    try {
      const prev = JSON.parse(localStorage.getItem(CUSTOMER_KEY)) || {};
      localStorage.setItem(CUSTOMER_KEY, JSON.stringify({ ...prev, ...customer }));
    } catch (e2) {
      /* ignore */
    }

    const number = makeNumber();
    const qtyLines = SIZES.map((s) => [s, parseInt(qform[`qty-${s}`].value, 10) || 0]).filter(([, n]) => n > 0);
    const hasUpload = [...state.front, ...state.back].some((el) => el.type === "image" && el.img !== "logo");
    const text = [
      `${isQuote ? "QUOTE REQUEST" : "DESIGN IDEA"} ${number}`,
      `Sent: ${new Date().toLocaleString()}`,
      "",
      "CUSTOMER",
      `Name: ${customer.name}`,
      `Email: ${customer.email}`,
      `Phone: ${customer.phone || "-"}`,
      `Need it by: ${qform.needBy.value || "-"}`,
      "",
      "QUANTITIES",
      qtyLines.length ? qtyLines.map(([s, n]) => `${s}: ${n}`).join(", ") + ` (total ${total})` : "Not sure yet",
      "",
      "DESIGN",
      describeDesign(),
      qform.notes.value.trim() ? `\nNOTES\n${qform.notes.value.trim()}` : "",
      "",
      `Mockup image: texas-huddle-design-${number}.png`,
    ].join("\n");
    const subject = `${isQuote ? "Quote request" : "Design idea"} ${number} - ${customer.name}`;
    const mailto = `mailto:${STORE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text)}`;
    const filename = `texas-huddle-design-${number}.png`;

    const btn = $("[data-quote-submit]");
    btn.disabled = true;
    btn.textContent = "SENDING...";
    select(null);
    const blob = await makeMockup(number);

    if (STORE.formEndpoint) {
      try {
        const res = await fetch(STORE.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({ _subject: subject, _replyto: customer.email, email: customer.email, message: text }),
        });
        if (!res.ok) throw new Error("Bad response " + res.status);
        downloadBlob(blob, filename);
        showConfirm({ number, blob, filename, mailto, auto: true, hasUpload, customer });
      } catch (e3) {
        err.innerHTML = `We couldn't send that. Try again, or <a href="${esc(mailto)}">email it to us</a> at ${esc(STORE.email)}.`;
        err.hidden = false;
      }
    } else {
      downloadBlob(blob, filename);
      setTimeout(() => (window.location.href = mailto), 300);
      showConfirm({ number, blob, filename, mailto, auto: false, hasUpload, customer });
    }
    btn.disabled = false;
    btn.textContent = "SEND MY DESIGN";
  });

  const confirmModal = $("[data-confirm-modal]");
  function showConfirm({ number, blob, filename, mailto, auto, hasUpload, customer }) {
    const file = typeof File === "function" ? new File([blob], filename, { type: "image/png" }) : null;
    const canShare = file && navigator.canShare && navigator.canShare({ files: [file] });
    const previewUrl = URL.createObjectURL(blob);
    $("[data-confirm-body]").innerHTML = `
      <svg class="confirm-star" viewBox="0 0 64 64" aria-hidden="true"><path fill="currentColor" d="${starPath(32, 33, 30)}"/></svg>
      <p class="h2" id="confirm-title">${auto ? "Got it!" : "Almost there!"}</p>
      <p>Your reference number is</p>
      <div class="order-number">${esc(number)}</div>
      <img class="confirm-preview" src="${previewUrl}" alt="Your design, front and back">
      ${
        auto
          ? `<p>We'll get back to you at <strong>${esc(customer.email)}</strong> with a quote. We also saved a picture of your design to your device.</p>`
          : `<p>Your email app should have opened with your design details filled in. <strong>Attach the picture we just saved</strong> (<em>${esc(filename)}</em>), then hit send.</p>
             <p class="muted">Email didn't open? <a href="${esc(mailto)}">Try again</a>, or email <a href="mailto:${esc(STORE.email)}">${esc(STORE.email)}</a>.</p>`
      }
      ${hasUpload ? `<p class="muted">You used your own image. Please send us the original file too, so it prints sharp.</p>` : ""}
      <div class="confirm-actions">
        ${canShare ? `<button type="button" class="btn btn-primary" data-share>SHARE OR TEXT IT</button>` : ""}
        <button type="button" class="btn btn-outline-navy" data-redownload>SAVE PICTURE AGAIN</button>
      </div>
      <p class="muted">Questions? Call or text <a href="${esc(STORE.phoneLink)}">${esc(STORE.phone)}</a>.</p>`;
    $("[data-redownload]").onclick = () => downloadBlob(blob, filename);
    const share = $("[data-share]");
    if (share)
      share.onclick = () =>
        navigator.share({ files: [file], title: `Texas Huddle design ${number}`, text: `My Texas Huddle Co. design (${number}). Send to ${STORE.email} or text ${STORE.phone}.` }).catch(() => {});
    confirmModal.showModal();
    confirmModal.addEventListener("close", () => URL.revokeObjectURL(previewUrl), { once: true });
  }
  confirmModal.addEventListener("click", (e) => {
    if (e.target === confirmModal) confirmModal.close();
  });

  /* ---------- Toast ---------- */

  let toastTimer;
  function showToast(msg) {
    const t = $("[data-toast]");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3500);
  }

  /* ---------- Boot ---------- */

  $("[data-year]").textContent = new Date().getFullYear();
  try {
    const cart = JSON.parse(localStorage.getItem(CART_KEY)) || [];
    const n = cart.reduce((s, i) => s + (i.qty || 0), 0);
    const badge = $("[data-cart-count]");
    badge.textContent = n;
    badge.hidden = n === 0;
  } catch (e) {
    /* no cart */
  }

  load();
  undoStack = [snapshot()];
  refreshAll();
  updateQuoteForm();
  if (document.fonts) {
    document.fonts.ready.then(render);
    FONTS.forEach((f) => document.fonts.load(`${f.weight} 40px "${f.family}"`).then(render, () => {}));
  }
  new ResizeObserver(render).observe(canvas);
})();
