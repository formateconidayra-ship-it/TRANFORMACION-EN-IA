(function () {
  "use strict";

  // Selectores individuales (section headers, bloques únicos)
  var SINGLE = [
    ".sh",
    ".hero-card",
    ".cta-final",
    ".about-grid",
    ".colab-autoridad",
    ".testimonios-cta",
    ".sp-cta",
  ].join(",");

  // Grids cuyos hijos reciben reveal escalonado
  var GRIDS = [
    ".stats",
    ".testimonios-grid",
    ".af-grid",
    ".svc-grid",
    ".proj-grid",
    ".beneficios-grid",
    ".ec-grid",
    ".acards",
    ".sp-grid",
    ".sp-benefits-grid",
    ".sp-steps",
    ".herramientas-grid",
    ".acreditaciones-grid",
    ".proyectos-grid",
  ].join(",");

  var DELAY_CLASSES = ["", "reveal-delay-1", "reveal-delay-2", "reveal-delay-3", "reveal-delay-4"];

  function isInViewport(el) {
    return el.getBoundingClientRect().top < window.innerHeight;
  }

  // Destino de un #ancla en la URL al cargar: no se anima (si no, el
  // navegador lo coloca bajo el menú y luego sube 28px al aparecer)
  var hashTarget = targetFromHash(location.hash);

  function targetFromHash(hash) {
    if (!hash || hash.length < 2) return null;
    try { return document.getElementById(decodeURIComponent(hash.slice(1))); } catch (e) { return null; }
  }

  function applyReveal(el, delayClass) {
    // No animar lo que ya es visible al cargar
    if (isInViewport(el)) return;
    if (hashTarget && el.contains(hashTarget)) return;
    // No animar navbar ni botón flotante
    if (el.closest(".navbar") || el.classList.contains("floating-whatsapp")) return;
    el.classList.add("reveal");
    if (delayClass) el.classList.add(delayClass);
  }

  // Elementos individuales
  document.querySelectorAll(SINGLE).forEach(function (el) {
    applyReveal(el, "");
  });

  // Hijos de grids con delay escalonado
  document.querySelectorAll(GRIDS).forEach(function (grid) {
    Array.from(grid.children).forEach(function (child, idx) {
      applyReveal(child, DELAY_CLASSES[Math.min(idx, DELAY_CLASSES.length - 1)]);
    });
  });

  // Observer
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("active");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.10,
      rootMargin: "0px 0px -30px 0px",
    }
  );

  document.querySelectorAll(".reveal").forEach(function (el) {
    observer.observe(el);
  });

  // ── Enlaces internos (#ancla) con el menú flotante ─────────────────────
  // El desplazamiento respeta scroll-padding-top (altura del menú, en styles.css).
  // Dos ajustes para que el destino quede completo bajo el menú:
  //  1. Los bloques .reveal del destino se muestran al instante antes de
  //     desplazarse, para que la posición no se calcule con el desfase de 28px.
  //  2. Si el destino es el título de una cabecera (.sh), se alinea la cabecera
  //     entera, con su kicker, que va encima del título.
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  function revealNow(target) {
    for (var el = target; el && el !== document.body; el = el.parentElement) {
      if (el.classList.contains("reveal") && !el.classList.contains("active")) {
        el.style.transition = "none";
        el.classList.add("active");
        observer.unobserve(el);
        void el.offsetWidth;
        el.style.transition = "";
      }
    }
  }

  // Títulos con id dentro de una cabecera .sh: su scroll-margin-top es la altura
  // real del kicker que tienen encima. Así también el salto nativo del navegador
  // (URL con #ancla) deja visible la cabecera completa.
  function syncHeadingMargins() {
    document.querySelectorAll(".sh > h1[id], .sh > h2[id], .sh > h3[id]").forEach(function (h) {
      var above = h.offsetTop - h.parentElement.offsetTop;
      h.style.scrollMarginTop = above > 0 ? above + "px" : "";
    });
  }
  syncHeadingMargins();
  var marginRaf = 0;
  window.addEventListener("resize", function () {
    cancelAnimationFrame(marginRaf);
    marginRaf = requestAnimationFrame(syncHeadingMargins);
  });

  function scrollTargetFor(target) {
    var head = target.matches("h1, h2, h3") && target.closest(".sh");
    return head || target;
  }

  function goTo(target, smooth) {
    revealNow(target);
    scrollTargetFor(target).scrollIntoView({
      block: "start",
      // "instant" evita que html { scroll-behavior: smooth } anime las correcciones
      behavior: smooth && !reduceMotion.matches ? "smooth" : "instant"
    });
  }

  document.addEventListener("click", function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var a = e.target.closest && e.target.closest("a[href*='#']");
    if (!a || a.target === "_blank") return;
    var url = new URL(a.href, location.href);
    if (url.origin !== location.origin || url.pathname !== location.pathname || url.search !== location.search) return;
    var target = targetFromHash(url.hash);
    if (!target) return;
    e.preventDefault();
    if (location.hash !== url.hash) history.pushState(null, "", url.hash);
    goTo(target, true);
    // Igual que el comportamiento nativo: el foco pasa al destino (enlace «Saltar al contenido»)
    if (!target.matches("a[href], button, input, select, textarea, [tabindex]")) target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  });

  // Atrás/adelante: el navegador restaura su posición guardada; se corrige justo después
  window.addEventListener("popstate", function () {
    var target = targetFromHash(location.hash);
    if (target) requestAnimationFrame(function () { goTo(target, false); });
  });

  if (hashTarget) {
    // Al cargar con #ancla, la maquetación sigue ajustándose un momento (fuentes
    // web, imágenes, altura del carrusel). Se recoloca el destino cada vez que el
    // documento cambia de tamaño durante la carga, salvo que la persona ya se
    // haya movido por la página.
    var userMoved = false;
    ["wheel", "touchstart", "keydown", "pointerdown"].forEach(function (t) {
      window.addEventListener(t, function () { userMoved = true; }, { once: true, passive: true });
    });
    var settle = function () {
      if (userMoved) return;
      syncHeadingMargins();
      goTo(hashTarget, false);
    };
    window.addEventListener("load", function () {
      settle();
      if ("ResizeObserver" in window) {
        var ro = new ResizeObserver(settle);
        ro.observe(document.body);
        setTimeout(function () { ro.disconnect(); }, 2500);
      }
    });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  }
})();
