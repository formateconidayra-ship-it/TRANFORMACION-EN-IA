/* Escaparate 3D de especialidades.
   Los paneles se construyen desde el listado #acredList, que es la fuente
   única de contenido (y la que leen buscadores y lectores de pantalla). */
(function () {
  "use strict";

  var root = document.getElementById("acredCarousel");
  var list = document.getElementById("acredList");
  if (!root || !list) return;

  var START_CODE = "IFCT0067";
  var PERSPECTIVE = 1800;
  var stage = root.querySelector(".cf-stage");
  var track = root.querySelector(".cf-track");
  var segsEl = root.querySelector(".cf-segs");
  var countEl = root.querySelector(".cf-count b");
  var live = root.querySelector(".cf-live");
  var toggleBtn = root.querySelector('[data-cf="toggle"]');
  var reduceMq = window.matchMedia("(prefers-reduced-motion: reduce)");
  var SVGNS = "http://www.w3.org/2000/svg";

  // ── Datos desde el listado ──────────────────────────────────────────────
  var items = Array.prototype.map.call(list.querySelectorAll(".cf-row"), function (row) {
    return {
      code: row.dataset.code,
      icon: row.dataset.icon,
      area: row.dataset.area,
      accent: row.dataset.accent || "#38bdf8",
      motif: row.dataset.motif || "grid",
      family: row.dataset.family || "",
      isNew: row.hasAttribute("data-new"),
      title: row.querySelector(".cf-row-title").textContent.trim(),
      modal: row.querySelector(".cf-row-modal").textContent.replace(/^\s*Modalidad:\s*/, "").trim()
    };
  });
  var n = items.length;
  if (!n) return;
  var current = Math.max(0, items.findIndex(function (it) { return it.code === START_CODE; }));

  function el(tag, cls, text) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (text != null) e.textContent = text;
    return e;
  }

  function use(symbol, cls) {
    var svg = document.createElementNS(SVGNS, "svg");
    svg.setAttribute("class", cls);
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    var u = document.createElementNS(SVGNS, "use");
    u.setAttribute("href", "#" + symbol);
    svg.appendChild(u);
    return svg;
  }

  // ── Construcción de los paneles ─────────────────────────────────────────
  var cards = [], segs = [];
  items.forEach(function (it, i) {
    var li = el("li", "cf-card");
    li.setAttribute("role", "group");
    li.setAttribute("aria-roledescription", "especialidad");
    li.setAttribute("aria-label", (i + 1) + " de " + n);

    var panel = el("article", "cf-panel");
    panel.style.setProperty("--acc", it.accent);

    var visual = el("div", "cf-visual");
    visual.appendChild(use("bg-" + it.motif, "cf-motif"));
    visual.appendChild(el("span", "cf-ring"));
    var tile = el("span", "cf-tile");
    tile.appendChild(use("ico-" + it.icon, "cf-ico"));
    visual.appendChild(tile);
    if (it.isNew) visual.appendChild(el("span", "cf-new", "Nueva 2026"));
    visual.appendChild(el("span", "cf-area", it.area));

    var body = el("div", "cf-body");
    var top = el("div", "cf-top");
    top.appendChild(el("span", "cf-code", it.code));
    var badge = el("span", "acred-badge cf-badge");
    badge.appendChild(el("span", "acred-badge-dot"));
    badge.appendChild(document.createTextNode("Acreditada"));
    top.appendChild(badge);
    body.appendChild(top);
    body.appendChild(el("h3", "cf-title", it.title));
    if (it.family) {
      var fam = el("p", "cf-fam");
      fam.appendChild(el("span", "cf-fam-label", "Familia profesional:"));
      fam.appendChild(el("span", "cf-fam-value", it.family));
      body.appendChild(fam);
    }

    // Modalidad: el texto exacto para lectores de pantalla, y dos distintivos visuales
    var modal = el("p", "cf-modal");
    modal.appendChild(el("span", "cf-modal-label", "Modalidad:"));
    modal.appendChild(el("span", "cf-sr", it.modal));
    [["mod-presencial", "Presencial"], ["mod-tele", "Teleformación"]].forEach(function (m) {
      var chip = el("span", "cf-chip");
      chip.setAttribute("aria-hidden", "true");
      chip.appendChild(use(m[0], ""));
      chip.appendChild(document.createTextNode(m[1]));
      modal.appendChild(chip);
    });
    body.appendChild(modal);

    panel.appendChild(visual);
    panel.appendChild(body);
    li.appendChild(panel);
    li.addEventListener("click", function () { if (i !== current) goTo(i, true); });
    track.appendChild(li);
    cards.push(li);

    var seg = el("span", "cf-seg" + (it.isNew ? " is-new" : ""));
    segsEl.appendChild(seg);
    segs.push(seg);
  });

  // ── Geometría ───────────────────────────────────────────────────────────
  // Calcula tamaño y posición de los paneles para el ancho disponible:
  //  · "amplio": tres paneles grandes en arco, los laterales separados del
  //    central (sin taparlo) y sin salirse de la pantalla.
  //  · "compacto" (pantallas estrechas): los laterales asoman detrás del central.
  var geo = null;

  function project(x, z) { return x * PERSPECTIVE / (PERSPECTIVE - z); }

  function layout() {
    var vw = stage.clientWidth;
    var margin = vw < 768 ? 8 : 20;
    var g = { vw: vw };
    var W = Math.min(560, Math.floor((vw - 80) / 2.5));

    if (W >= 340) {
      g.mode = "amplio";
      g.rot = 34;
      g.gap = Math.max(28, Math.round(vw * 0.025));
      for (; W >= 340; W -= 8) {
        var rad = g.rot * Math.PI / 180, half = W / 2;
        g.depth = Math.round(W * 0.32);
        // borde interior del lateral derecho: x = -W/2 tras girar
        var zIn = -half * Math.sin(rad) - g.depth;         // el borde interior se aleja
        var xIn = -half * Math.cos(rad);
        var X = (half + g.gap) * (PERSPECTIVE - zIn) / PERSPECTIVE - xIn;
        var zOut = half * Math.sin(rad) - g.depth;          // el exterior se acerca
        var outer = project(half * Math.cos(rad) + X, zOut);
        if (outer <= vw / 2 - margin) { g.x = X; break; }
      }
      g.w = W;
      g.visual = Math.max(220, Math.min(268, Math.round(W * 0.48)));
    } else {
      g.mode = "compacto";
      g.rot = 40;
      W = Math.min(440, vw - (vw < 768 ? 92 : 140));
      var radC = g.rot * Math.PI / 180, halfC = W / 2;
      g.depth = Math.round(W * 0.55);
      // el borde exterior del lateral queda a "margin" del borde de la pantalla
      var zO = halfC * Math.sin(radC) - g.depth;
      g.x = (vw / 2 - margin) * (PERSPECTIVE - zO) / PERSPECTIVE - halfC * Math.cos(radC);
      g.w = W;
      g.visual = vw < 768 ? 184 : 228;
    }
    geo = g;
    root.style.setProperty("--cf-w", g.w + "px");
    root.style.setProperty("--cf-visual", g.visual + "px");
    // Altura justa: zona visual + el texto del panel más largo (con 20px de aire
    // antes de la modalidad). La modalidad queda alineada abajo en todos.
    root.classList.add("cf-measuring");
    var body = 0;
    cards.forEach(function (c) { body = Math.max(body, c.querySelector(".cf-body").offsetHeight); });
    root.classList.remove("cf-measuring");
    g.h = g.visual + body + 2; // +2: bordes del panel
    root.style.setProperty("--cf-h", g.h + "px");
    root.dataset.mode = g.mode;
  }

  function transformFor(d) {
    var ad = Math.abs(d), side = d < 0 ? -1 : 1;
    if (ad === 0) return { t: "perspective(" + PERSPECTIVE + "px) translateZ(0)", op: 1 };
    // los paneles del lado izquierdo se giran hacia la derecha (y viceversa):
    // arco cóncavo, como si rodearan al espectador
    var x = geo.x * (ad === 1 ? 1 : 1.55);
    var z = geo.depth * (ad === 1 ? 1 : 1.9);
    return {
      t: "perspective(" + PERSPECTIVE + "px) translateX(" + (side * x).toFixed(1) + "px) translateZ(" + (-z) + "px) rotateY(" + (-side * geo.rot) + "deg)",
      op: ad === 1 ? 1 : 0
    };
  }

  // ── Render ──────────────────────────────────────────────────────────────
  function offset(i) {
    var d = i - current;
    if (d > n / 2) d -= n;
    if (d < -n / 2) d += n;
    return d;
  }

  function render() {
    cards.forEach(function (card, i) {
      var d = offset(i), ad = Math.abs(d);
      var shown = ad <= 1;
      var tr = transformFor(Math.max(-2, Math.min(2, d)));
      card.style.setProperty("--t", tr.t);
      card.style.setProperty("--op", tr.op);
      card.style.zIndex = String(10 - ad);
      card.classList.toggle("is-active", d === 0);
      card.classList.toggle("is-left", d === -1);
      card.classList.toggle("is-right", d === 1);
      card.classList.toggle("is-hidden", !shown);
      var inactive = d !== 0;
      card.setAttribute("aria-hidden", inactive ? "true" : "false");
      if ("inert" in card) card.inert = inactive;
    });
    root.style.setProperty("--cf-glow", items[current].accent);
    segs.forEach(function (seg) { seg.classList.remove("is-active"); });
    void segsEl.offsetWidth; // reinicia la animación de relleno (el temporizador)
    segs[current].classList.add("is-active");
    countEl.textContent = current + 1;
  }

  function goTo(i, byUser) {
    current = (i + n) % n;
    render();
    if (byUser) {
      var it = items[current];
      live.textContent = it.code + ", " + it.title + ". Especialidad " + (current + 1) + " de " + n + ".";
    }
  }

  // ── Avance automático ───────────────────────────────────────────────────
  // El intervalo lo marca la animación de relleno del segmento activo; al
  // pausarla (animation-play-state) el carrusel se detiene donde estaba.
  // Se detiene: con el botón de pausa, con el foco de teclado en el
  // escaparate, fuera de pantalla, con la pestaña oculta o con movimiento
  // reducido. Pasar el ratón por encima NO lo detiene.
  var userStopped = reduceMq.matches;
  var keyboardFocus = false, onScreen = false, pageVisible = !document.hidden;

  function playing() { return !userStopped && !reduceMq.matches; }

  function sync() {
    var paused = !playing() || keyboardFocus || !onScreen || !pageVisible;
    root.classList.toggle("is-paused", paused);
    var on = playing();
    toggleBtn.setAttribute("aria-label", on ? "Pausar el carrusel" : "Reanudar el carrusel");
    toggleBtn.setAttribute("aria-pressed", on ? "false" : "true");
    toggleBtn.querySelector(".cf-ico-pause").hidden = !on;
    toggleBtn.querySelector(".cf-ico-play").hidden = on;
  }

  segsEl.addEventListener("animationend", function () {
    if (!root.classList.contains("is-paused")) goTo(current + 1, false);
  });

  toggleBtn.addEventListener("click", function () {
    userStopped = reduceMq.matches ? true : !userStopped;
    if (!userStopped) render(); // al reanudar, empieza un intervalo completo
    sync();
  });

  root.querySelector('[data-cf="prev"]').addEventListener("click", function () { goTo(current - 1, true); });
  root.querySelector('[data-cf="next"]').addEventListener("click", function () { goTo(current + 1, true); });

  stage.addEventListener("focus", function () { keyboardFocus = stage.matches(":focus-visible"); sync(); });
  stage.addEventListener("blur", function () { keyboardFocus = false; sync(); });

  document.addEventListener("visibilitychange", function () {
    pageVisible = !document.hidden;
    sync();
  });

  if ("IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      onScreen = entries[0].isIntersecting;
      sync();
    }, { threshold: 0.25 }).observe(stage);
  } else {
    onScreen = true;
  }

  var onReduce = function () { if (reduceMq.matches) userStopped = true; sync(); };
  if (reduceMq.addEventListener) reduceMq.addEventListener("change", onReduce);
  else if (reduceMq.addListener) reduceMq.addListener(onReduce);

  var resizeRaf = 0, lastW = 0;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      if (stage.clientWidth === lastW) return;
      lastW = stage.clientWidth;
      layout();
      cards.forEach(function (c) { c.style.transition = "none"; });
      render();
      void track.offsetWidth;
      cards.forEach(function (c) { c.style.transition = ""; });
    });
  });

  // ── Teclado ─────────────────────────────────────────────────────────────
  stage.addEventListener("keydown", function (e) {
    var map = { ArrowLeft: current - 1, ArrowRight: current + 1, Home: 0, End: n - 1 };
    if (e.key in map) { e.preventDefault(); goTo(map[e.key], true); }
  });

  // ── Deslizamiento táctil / arrastre ─────────────────────────────────────
  var startX = 0, startY = 0, tracking = false, swiped = false;

  stage.addEventListener("pointerdown", function (e) {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    tracking = true;
    swiped = false;
    startX = e.clientX;
    startY = e.clientY;
  });

  stage.addEventListener("pointermove", function (e) {
    if (!tracking) return;
    var dx = e.clientX - startX, dy = e.clientY - startY;
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
      tracking = false;
      swiped = true;
      goTo(current + (dx < 0 ? 1 : -1), true);
    }
  });

  ["pointerup", "pointercancel", "pointerleave"].forEach(function (t) {
    stage.addEventListener(t, function () {
      tracking = false;
      // El clic que sigue a un deslizamiento llega justo después; luego se olvida
      if (swiped) setTimeout(function () { swiped = false; }, 60);
    });
  });

  // Un deslizamiento no debe contar también como clic en un panel lateral
  stage.addEventListener("click", function (e) {
    if (swiped) { e.stopPropagation(); e.preventDefault(); swiped = false; }
  }, true);

  layout();
  lastW = stage.clientWidth;
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { layout(); render(); });
  }
  // Primer pintado sin transición (evita que los paneles "vuelen" al cargar)
  cards.forEach(function (c) { c.style.transition = "none"; });
  render();
  void track.offsetWidth;
  cards.forEach(function (c) { c.style.transition = ""; });
  sync();
})();
