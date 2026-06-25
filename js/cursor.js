(function () {
  // Only on pointer devices (mice), not touch
  if (!window.matchMedia('(pointer: fine)').matches) return;

  const style = document.createElement('style');
  style.textContent = `
    html, html * { cursor: none !important; }

    #cur-dot {
      position: fixed;
      width: 7px;
      height: 7px;
      background: #06b6d4;
      border-radius: 50%;
      pointer-events: none;
      z-index: 99999;
      transform: translate(-50%, -50%);
      transition: width .15s, height .15s, background .15s, box-shadow .15s, opacity .2s;
      box-shadow: 0 0 6px #06b6d4, 0 0 14px rgba(6,182,212,.5);
      will-change: left, top;
    }

    #cur-ring {
      position: fixed;
      width: 32px;
      height: 32px;
      border: 1.5px solid rgba(6,182,212,.55);
      border-radius: 50%;
      pointer-events: none;
      z-index: 99998;
      transform: translate(-50%, -50%);
      transition: width .22s ease, height .22s ease, border-color .22s ease,
                  background .22s ease, opacity .2s;
      will-change: left, top;
    }

    #cur-dot.is-hover {
      width: 9px;
      height: 9px;
      background: #3b82f6;
      box-shadow: 0 0 10px #3b82f6, 0 0 22px rgba(59,130,246,.55);
    }

    #cur-ring.is-hover {
      width: 46px;
      height: 46px;
      border-color: rgba(59,130,246,.45);
      background: rgba(59,130,246,.06);
    }

    #cur-dot.is-hidden, #cur-ring.is-hidden {
      opacity: 0;
    }
  `;
  document.head.appendChild(style);

  const dot  = document.createElement('div'); dot.id  = 'cur-dot';
  const ring = document.createElement('div'); ring.id = 'cur-ring';

  function appendWhenReady() {
    if (document.body) {
      document.body.appendChild(dot);
      document.body.appendChild(ring);
    } else {
      document.addEventListener('DOMContentLoaded', function () {
        document.body.appendChild(dot);
        document.body.appendChild(ring);
      });
    }
  }
  appendWhenReady();

  let mx = -200, my = -200;
  let rx = -200, ry = -200;

  document.addEventListener('mousemove', function (e) {
    mx = e.clientX;
    my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
    dot.classList.remove('is-hidden');
    ring.classList.remove('is-hidden');
  });

  // Ring follows with smooth lag
  (function loop() {
    rx += (mx - rx) * 0.13;
    ry += (my - ry) * 0.13;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(loop);
  })();

  // Hover state on interactive elements
  var HOVER_SEL = 'a, button, [role="button"], input, textarea, select, label, .btn, summary';

  document.addEventListener('mouseover', function (e) {
    if (e.target.closest(HOVER_SEL)) {
      dot.classList.add('is-hover');
      ring.classList.add('is-hover');
    }
  });

  document.addEventListener('mouseout', function (e) {
    if (e.target.closest(HOVER_SEL)) {
      dot.classList.remove('is-hover');
      ring.classList.remove('is-hover');
    }
  });

  document.addEventListener('mouseleave', function () {
    dot.classList.add('is-hidden');
    ring.classList.add('is-hidden');
  });

  document.addEventListener('mouseenter', function () {
    dot.classList.remove('is-hidden');
    ring.classList.remove('is-hidden');
  });
})();
