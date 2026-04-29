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

  function applyReveal(el, delayClass) {
    // No animar lo que ya es visible al cargar
    if (isInViewport(el)) return;
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
})();
