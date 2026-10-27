// Consentimiento de cookies: Google Analytics solo se carga si la persona lo acepta.
// La elección se guarda en localStorage ('tia_consent': 'granted' | 'denied').
(function () {
  var GA_ID = 'G-PQ7964Q4MB';
  var KEY = 'tia_consent';
  var granted = false;

  // gtag() existe siempre, pero no registra nada hasta que se acepta
  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { if (granted) window.dataLayer.push(arguments); };

  function read() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  function loadGA() {
    if (granted) return;
    granted = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
  }

  // Borra las cookies de Google Analytics de este dominio
  function clearGA() {
    document.cookie.split(';').forEach(function (c) {
      var n = c.split('=')[0].trim();
      if (n !== '_ga' && n.indexOf('_ga_') !== 0) return;
      ['', location.hostname, '.' + location.hostname].forEach(function (d) {
        document.cookie = n + '=; Max-Age=0; path=/' + (d ? '; domain=' + d : '');
      });
    });
  }

  var banner = null;
  function hide() { if (banner) { banner.remove(); banner = null; } }

  function choose(v) {
    var before = read();
    save(v);
    hide();
    if (v === 'granted') loadGA();
    else {
      clearGA();
      // Si Analytics ya estaba cargado, se recarga la página para descargarlo
      if (before === 'granted' || granted) location.reload();
    }
  }

  function show() {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Aviso de cookies');
    banner.innerHTML =
      '<p>Uso cookies de Google Analytics para saber qué páginas se visitan, solo si las aceptas. ' +
      '<a href="cookies.html">Más información</a></p>' +
      '<div class="cookie-actions">' +
      '<button type="button" class="btn btn-g" data-consent="denied">Rechazar</button>' +
      '<button type="button" class="btn btn-g" data-consent="granted">Aceptar</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var b = e.target.closest('[data-consent]');
      if (b) choose(b.getAttribute('data-consent'));
    });
    // Primero en el orden de lectura, justo después del enlace de salto si existe
    var skip = document.querySelector('.skip-link');
    if (skip && skip.parentNode === document.body) skip.after(banner);
    else document.body.insertBefore(banner, document.body.firstChild);
  }

  // Para el botón «Cambiar mis preferencias» de cookies.html
  window.tiaConsent = { open: show };

  var v = read();
  if (v === 'granted') loadGA();
  else if (v !== 'denied') {
    if (document.body) show();
    else document.addEventListener('DOMContentLoaded', show);
  }
})();
