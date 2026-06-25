(function () {
  if (!window.matchMedia('(pointer: fine)').matches) return;

  var cv = document.createElement('canvas');
  cv.id = 'cursor-canvas';
  var dot = document.createElement('div');
  dot.id = 'cur-dot';

  var st = document.createElement('style');
  st.textContent =
    'html,html *{cursor:none!important}' +
    '#cursor-canvas{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:99999}' +
    '#cur-dot{position:fixed;width:8px;height:8px;background:#06b6d4;border-radius:50%;pointer-events:none;z-index:100000;transform:translate(-50%,-50%);box-shadow:0 0 8px #06b6d4,0 0 18px rgba(6,182,212,.6);transition:width .12s,height .12s,background .12s,opacity .2s}' +
    '#cur-dot.h{width:13px;height:13px;background:#fff;box-shadow:0 0 10px #fff,0 0 26px rgba(6,182,212,.9)}' +
    '#cur-dot.gone{opacity:0}';
  document.head.appendChild(st);

  function init() {
    document.body.appendChild(cv);
    document.body.appendChild(dot);

    var ctx = cv.getContext('2d');
    var W = cv.width = window.innerWidth;
    var H = cv.height = window.innerHeight;
    window.addEventListener('resize', function () {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    });

    var mx = -200, my = -200;
    var trail = [], burst = [];

    document.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx + 'px';
      dot.style.top = my + 'px';
      dot.classList.remove('gone');

      for (var i = 0; i < 3; i++) {
        trail.push({
          x: mx + (Math.random() - .5) * 6,
          y: my + (Math.random() - .5) * 6,
          vx: (Math.random() - .5) * 1.4,
          vy: (Math.random() - .5) * 1.4 - .4,
          life: 1,
          decay: Math.random() * .04 + .032,
          r: Math.random() * 2.5 + .7,
          c: Math.random() > .38 ? '6,182,212' : '59,130,246'
        });
      }
    });

    document.addEventListener('click', function (e) {
      for (var i = 0; i < 22; i++) {
        var a = (i / 22) * Math.PI * 2;
        var spd = Math.random() * 5.5 + 2;
        burst.push({
          x: e.clientX, y: e.clientY,
          vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
          life: 1, decay: .02,
          r: Math.random() * 3 + 1,
          c: Math.random() > .5 ? '6,182,212' : '96,165,250'
        });
      }
    });

    var HS = 'a,button,[role=button],input,textarea,select,label,.btn,summary,[type=submit]';
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest(HS)) dot.classList.add('h');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest(HS)) dot.classList.remove('h');
    });
    document.addEventListener('mouseleave', function () { dot.classList.add('gone'); });
    document.addEventListener('mouseenter', function () { dot.classList.remove('gone'); });

    function draw() {
      ctx.clearRect(0, 0, W, H);

      for (var i = trail.length - 1; i >= 0; i--) {
        var p = trail[i];
        p.x += p.vx; p.y += p.vy; p.life -= p.decay;
        if (p.life <= 0) { trail.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, 6.28);
        ctx.fillStyle = 'rgba(' + p.c + ',' + (p.life * .8) + ')';
        ctx.fill();
      }

      for (var i = burst.length - 1; i >= 0; i--) {
        var p = burst[i];
        p.x += p.vx; p.y += p.vy;
        p.vx *= .93; p.vy *= .93;
        p.life -= p.decay;
        if (p.life <= 0) { burst.splice(i, 1); continue; }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * p.life, 0, 6.28);
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.life + ')';
        ctx.fill();
      }

      requestAnimationFrame(draw);
    }
    draw();
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
