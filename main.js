// Año footer
const _yr = document.getElementById('currentYear');
if (_yr) _yr.textContent = new Date().getFullYear();

// Hamburger nav
const _tog = document.getElementById('navTog');
const _nav = document.getElementById('navLinks');
if (_tog && _nav) {
  const _close = () => {
    _nav.classList.remove('open');
    _tog.setAttribute('aria-expanded', 'false');
    _tog.setAttribute('aria-label', 'Abrir menú');
    document.body.style.overflow = '';
  };
  _tog.addEventListener('click', () => {
    const o = _nav.classList.toggle('open');
    _tog.setAttribute('aria-expanded', String(o));
    _tog.setAttribute('aria-label', o ? 'Cerrar menú' : 'Abrir menú');
    document.body.style.overflow = o ? 'hidden' : '';
  });
  _nav.querySelectorAll('a').forEach(a => a.addEventListener('click', _close));
  document.addEventListener('keydown', e => e.key === 'Escape' && _close());
  document.addEventListener('click', e => {
    if (!_nav.contains(e.target) && !_tog.contains(e.target)) _close();
  });
}
