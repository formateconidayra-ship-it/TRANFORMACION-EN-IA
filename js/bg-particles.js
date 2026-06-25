(function () {
  var cv = document.createElement('canvas');
  cv.id = 'bg-particles';

  var st = document.createElement('style');
  st.textContent =
    '#bg-particles{position:fixed;top:0;left:0;width:100vw;height:100vh;pointer-events:none;z-index:0;}' +
    'body>header,body>main,body>footer,body>nav,body>section,body>div,body>form{position:relative;z-index:1;}';
  document.head.appendChild(st);

  function init() {
    document.body.insertBefore(cv, document.body.firstChild);

    var ctx = cv.getContext('2d');
    var W, H, pts = [], mx = -9999, my = -9999;
    var N = 72, LINK = 145, MR = 190;

    function resize() {
      W = cv.width = window.innerWidth;
      H = cv.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    for (var i = 0; i < N; i++) {
      pts.push({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .45, vy: (Math.random() - .5) * .45,
        r: Math.random() * 1.8 + .5,
        c: Math.random() > .45 ? '6,182,212' : '59,130,246',
        a: Math.random() * .45 + .2
      });
    }

    document.addEventListener('mousemove', function (e) { mx = e.clientX; my = e.clientY; });

    var last = 0;
    function frame(ts) {
      requestAnimationFrame(frame);
      if (ts - last < 34) return;
      last = ts;

      ctx.clearRect(0, 0, W, H);

      for (var i = 0; i < N; i++) {
        var p = pts[i];
        var dx = p.x - mx, dy = p.y - my;
        var d = Math.sqrt(dx * dx + dy * dy);
        if (d < MR && d > 1) {
          var f = (MR - d) / MR * .28;
          p.vx += dx / d * f; p.vy += dy / d * f;
        }
        p.vx *= .97; p.vy *= .97;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 6.28);
        ctx.fillStyle = 'rgba(' + p.c + ',' + p.a + ')';
        ctx.fill();
      }

      for (var i = 0; i < N - 1; i++) {
        for (var j = i + 1; j < N; j++) {
          var dx = pts[i].x - pts[j].x, dy = pts[i].y - pts[j].y;
          var d = Math.sqrt(dx * dx + dy * dy);
          if (d < LINK) {
            ctx.beginPath();
            ctx.moveTo(pts[i].x, pts[i].y);
            ctx.lineTo(pts[j].x, pts[j].y);
            ctx.strokeStyle = 'rgba(6,182,212,' + ((1 - d / LINK) * .22) + ')';
            ctx.lineWidth = .7;
            ctx.stroke();
          }
        }
      }
    }
    requestAnimationFrame(frame);
  }

  if (document.body) init();
  else document.addEventListener('DOMContentLoaded', init);
})();
