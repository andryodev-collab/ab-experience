// A luz que o visitante carrega pelo vazio. Só existe em ponteiro fino —
// em touch não há cursor, então o mistério fica só por conta da escuridão.
export function initCursorLight({ reduced = false } = {}) {
  const el = document.getElementById('cursorLight');
  if (!el || reduced) return;
  if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;

  let x = innerWidth / 2, y = innerHeight / 2, raf = 0, active = false;
  const apply = () => {
    raf = 0;
    el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  };
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    if (!active) { active = true; el.classList.add('is-active'); }
    if (!raf) raf = requestAnimationFrame(apply);
  }, { passive: true });
  addEventListener('pointerdown', () => { el.classList.add('is-active'); }, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) el.classList.remove('is-active');
  });
}
