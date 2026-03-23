// Año footer
document.querySelectorAll('.yr').forEach(el => el.textContent = new Date().getFullYear());

// ── Hamburger ──────────────────────────────────
const tog  = document.getElementById('navTog');
const navL = document.getElementById('navLinks');
if (tog && navL) {
  const close = () => {
    navL.classList.remove('open');
    tog.setAttribute('aria-expanded','false');
    document.body.style.overflow = '';
  };
  tog.addEventListener('click', () => {
    const o = navL.classList.toggle('open');
    tog.setAttribute('aria-expanded', o);
    document.body.style.overflow = o ? 'hidden' : '';
  });
  navL.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
  document.addEventListener('keydown', e => e.key === 'Escape' && close());
  document.addEventListener('click', e => {
    if (!navL.contains(e.target) && !tog.contains(e.target)) close();
  });
}

// ── Active nav ─────────────────────────────────
const pg = location.pathname.split('/').pop() || 'index.html';
document.querySelectorAll('.nav-links a').forEach(a => {
  if (a.getAttribute('href') === pg) a.classList.add('active');
});

// ── Custom select ──────────────────────────────
const cselEl = document.getElementById('csel');
if (cselEl) {
  const trig   = cselEl.querySelector('.csel-t');
  const menu   = cselEl.querySelector('.csel-m');
  const txt    = cselEl.querySelector('.csel-txt');
  const hidden = cselEl.querySelector('.csel-val');
  const opts   = cselEl.querySelectorAll('.csel-o');

  trig.addEventListener('click', () => {
    const o = menu.classList.toggle('open');
    trig.classList.toggle('open', o);
    trig.setAttribute('aria-expanded', o);
  });
  opts.forEach(opt => {
    opt.addEventListener('click', () => {
      txt.textContent  = opt.dataset.value;
      hidden.value     = opt.dataset.value;
      trig.classList.add('sel');
      opts.forEach(o => o.classList.remove('sel'));
      opt.classList.add('sel');
      menu.classList.remove('open');
      trig.classList.remove('open');
      trig.setAttribute('aria-expanded','false');
    });
  });
  document.addEventListener('click', e => {
    if (!cselEl.contains(e.target)) {
      menu.classList.remove('open');
      trig.classList.remove('open');
    }
  });
}

// ── Contact form validation ─────────────────────
const cform = document.getElementById('cform');
if (cform) {
  cform.addEventListener('submit', e => {
    const n   = document.getElementById('fnombre')?.value.trim();
    const em  = document.getElementById('femail')?.value.trim();
    const msg = document.getElementById('fmsg')?.value.trim();
    const mot = document.querySelector('.csel-val')?.value.trim();
    const err = document.getElementById('ferr');
    if (!n || !em || !msg || !mot) {
      e.preventDefault();
      if (err) err.textContent = 'Por favor, completa todos los campos.';
    } else {
      if (err) err.textContent = '';
    }
  });
}

// ── Planificador ────────────────────────────────
const festivos = {
  nacional: [
    '2025-01-01','2025-01-06','2025-04-17','2025-04-18','2025-05-01',
    '2025-08-15','2025-10-12','2025-11-01','2025-12-06','2025-12-08','2025-12-25',
    '2026-01-01','2026-01-06','2026-04-02','2026-04-03','2026-05-01',
    '2026-08-15','2026-10-12','2026-11-01','2026-12-06','2026-12-08','2026-12-25',
    '2027-01-01','2027-01-06','2027-03-25','2027-03-26','2027-05-01',
    '2027-08-15','2027-10-12','2027-11-01','2027-12-06','2027-12-08','2027-12-25',
  ],
  canarias: [
    '2025-02-28','2025-05-30',
    '2026-02-28','2026-05-30',
    '2027-02-28','2027-05-30',
  ]
};

function esFestivo(d) {
  const s = d.toISOString().slice(0,10);
  return festivos.nacional.includes(s) || festivos.canarias.includes(s);
}

function diasEntre(ini, fin, diasSem) {
  const dias = []; let d = new Date(ini);
  while (d <= fin) {
    const wd = d.getDay();
    if (diasSem.includes(wd) && !esFestivo(d)) {
      dias.push(new Date(d));
    }
    d.setDate(d.getDate()+1);
  }
  return dias;
}

function fmtDate(d) {
  return d.toLocaleDateString('es-ES',{day:'2-digit',month:'2-digit',year:'numeric'});
}

// Days buttons
const dbtns = document.querySelectorAll('.dbtn');
dbtns.forEach(b => b.addEventListener('click', () => b.classList.toggle('on')));

// Add module row
const modsList = document.getElementById('modsList');
const addMod   = document.getElementById('addMod');
let modCount = 1;
if (addMod && modsList) {
  addMod.addEventListener('click', () => {
    modCount++;
    const row = document.createElement('div');
    row.className = 'mod-row';
    row.innerHTML = `
      <input type="text" placeholder="Módulo ${modCount}" aria-label="Nombre módulo ${modCount}" />
      <input type="number" min="1" placeholder="Horas" aria-label="Horas módulo ${modCount}" />
      <button class="bdel" title="Eliminar módulo" aria-label="Eliminar módulo">✕</button>`;
    row.querySelector('.bdel').addEventListener('click', () => row.remove());
    modsList.appendChild(row);
  });
  // Initial delete buttons
  modsList.querySelectorAll('.bdel').forEach(b =>
    b.addEventListener('click', () => b.closest('.mod-row').remove()));
}

// Calculate
const btnCalc = document.getElementById('btnCalc');
if (btnCalc) {
  btnCalc.addEventListener('click', () => {
    const err   = document.getElementById('planErr');
    const resBox = document.getElementById('resBox');
    const bexp  = document.getElementById('bexp');

    const curso     = document.getElementById('pcurso')?.value.trim();
    const iniVal    = document.getElementById('pfecha-ini')?.value;
    const finVal    = document.getElementById('pfecha-fin')?.value;
    const hDiarias  = parseFloat(document.getElementById('phoras-dia')?.value) || 0;
    const selDias   = [...document.querySelectorAll('.dbtn.on')].map(b => parseInt(b.dataset.day));

    // Modules
    const rows = modsList?.querySelectorAll('.mod-row') || [];
    const mods = [];
    rows.forEach(r => {
      const inputs = r.querySelectorAll('input');
      const nom = inputs[0]?.value.trim();
      const h   = parseFloat(inputs[1]?.value) || 0;
      if (nom && h > 0) mods.push({nom, h});
    });

    // Validate
    if (!curso || !iniVal || !finVal || hDiarias <= 0 || selDias.length === 0 || mods.length === 0) {
      err.textContent = 'Completa todos los campos: nombre del curso, fechas, horas diarias, días lectivos y al menos un módulo.';
      err.classList.add('show'); resBox.classList.remove('show'); return;
    }
    err.classList.remove('show');

    const ini = new Date(iniVal); const fin = new Date(finVal);
    if (ini > fin) {
      err.textContent = 'La fecha de inicio debe ser anterior a la fecha de fin.';
      err.classList.add('show'); return;
    }

    const diasDisp = diasEntre(ini, fin, selDias);
    const totalHCurso = mods.reduce((s,m) => s + m.h, 0);
    const diasNecesarios = Math.ceil(totalHCurso / hDiarias);

    if (diasDisp.length < diasNecesarios) {
      err.textContent = `No hay suficientes días lectivos. Necesitas ${diasNecesarios} días y solo hay ${diasDisp.length} disponibles en el rango.`;
      err.classList.add('show'); return;
    }

    // Build schedule
    const schedule = []; let dIdx = 0;
    mods.forEach(m => {
      let horasRestantes = m.h; let modRows = [];
      while (horasRestantes > 0 && dIdx < diasDisp.length) {
        const h = Math.min(horasRestantes, hDiarias);
        modRows.push({fecha: diasDisp[dIdx], horas: h});
        horasRestantes -= h; dIdx++;
      }
      schedule.push({...m, dias: modRows});
    });

    // Summary stats
    const totalDias = dIdx;
    const fechaReal = diasDisp[dIdx-1];
    document.getElementById('rTotalH').textContent = totalHCurso + 'h';
    document.getElementById('rTotalD').textContent = totalDias;
    document.getElementById('rHDia').textContent  = hDiarias + 'h';
    document.getElementById('rMods').textContent  = mods.length;
    document.getElementById('rFin').textContent   = fmtDate(fechaReal);

    // Table
    const tbody = document.getElementById('rtbody');
    tbody.innerHTML = '';
    schedule.forEach(m => {
      m.dias.forEach((d, i) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${i===0 ? m.nom : '<span class="tm">↳ cont.</span>'}</td>
          <td>${fmtDate(d.fecha)}</td>
          <td class="th">${d.horas}h</td>
          <td class="tm">${d.fecha.toLocaleDateString('es-ES',{weekday:'long'})}</td>`;
        tbody.appendChild(tr);
      });
    });

    // Calendar
    buildCalendar(ini, fechaReal, schedule, selDias);

    resBox.classList.add('show');
    if (bexp) bexp.classList.add('show');
    resBox.scrollIntoView({behavior:'smooth', block:'start'});

    // Export CSV
    if (bexp) {
      bexp.onclick = () => {
        let csv = '\uFEFFMódulo,Fecha,Horas,Día\n';
        schedule.forEach(m => {
          m.dias.forEach(d => {
            csv += `"${m.nom}","${fmtDate(d.fecha)}",${d.horas},"${d.fecha.toLocaleDateString('es-ES',{weekday:'long'})}"\n`;
          });
        });
        const a = document.createElement('a');
        a.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csv);
        a.download = `planificacion_${(curso||'curso').replace(/\s+/g,'-')}.csv`;
        a.click();
      };
    }
  });
}

// View tabs
document.querySelectorAll('.vtab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.vtab').forEach(t => t.classList.remove('on'));
    tab.classList.add('on');
    const v = tab.dataset.view;
    document.querySelectorAll('.tblv,.calv').forEach(el => {
      el.classList.remove('show'); el.classList.add('hide');
    });
    const target = document.getElementById(v);
    if (target) { target.classList.add('show'); target.classList.remove('hide'); }
  });
});

function buildCalendar(ini, fin, schedule, selDias) {
  const classDates = new Set();
  schedule.forEach(m => m.dias.forEach(d => classDates.add(d.fecha.toISOString().slice(0,10))));

  const wrap = document.getElementById('calWrap');
  if (!wrap) return;
  wrap.innerHTML = '';

  let cur = new Date(ini.getFullYear(), ini.getMonth(), 1);
  const last = new Date(fin.getFullYear(), fin.getMonth()+1, 0);

  while (cur <= last) {
    const y = cur.getFullYear(), m = cur.getMonth();
    const daysInMonth = new Date(y, m+1, 0).getDate();
    const firstDay    = new Date(y, m, 1).getDay();
    const adj         = (firstDay === 0) ? 6 : firstDay - 1;

    const mo = document.createElement('div');
    mo.className = 'cal-mo';
    mo.innerHTML = `<h3>${new Date(y,m,1).toLocaleDateString('es-ES',{month:'long',year:'numeric'})}</h3>
      <div class="cal-g">
        <div class="cal-hd">L</div><div class="cal-hd">M</div><div class="cal-hd">X</div>
        <div class="cal-hd">J</div><div class="cal-hd">V</div><div class="cal-hd">S</div>
        <div class="cal-hd">D</div>
        ${Array(adj).fill('<div class="cd"></div>').join('')}
        ${Array.from({length:daysInMonth},(_,i)=>{
          const d = new Date(y,m,i+1);
          const s = d.toISOString().slice(0,10);
          const wd = d.getDay();
          let cls = 'cd';
          if (classDates.has(s)) cls += ' cl';
          else if (esFestivo(d)) cls += ' fe';
          else if (wd===0||wd===6) cls += ' wk';
          return `<div class="${cls}">${i+1}</div>`;
        }).join('')}
      </div>`;
    wrap.appendChild(mo);
    cur.setMonth(cur.getMonth()+1);
  }
}
