// EFBPad app transitions. Apps zoom out of the icon (or dock tile) that launched them and
// shrink back into it when closed, while the home screen recedes and settles behind them.
// Uses the View Transitions API where available, with a lightweight CSS fallback elsewhere.

type Kind = 'open' | 'close' | 'switch';

let current = 'home';
let token = 0;
let lastPress: { x: number; y: number; w: number; h: number; t: number } | null = null;

function remember(event: Event) {
  const target = event.target instanceof Element ? event.target.closest('button, a, [role="button"]') : null;
  if (!target) return;
  const icon = target.querySelector('.os-app-icon, .os-dock-icon') || target;
  const rect = icon.getBoundingClientRect();
  if (!rect.width) return;
  lastPress = { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width, h: rect.height, t: performance.now() };
}
document.addEventListener('pointerdown', remember, true);
document.addEventListener('click', remember, true);

function stage() {
  return document.querySelector<HTMLElement>('.app-content');
}

function iconFor(id: string) {
  const selectors = [`#home-screen [data-app-id="${id}"] .os-app-icon`, `.os-dock .dock-${id} .os-dock-icon`];
  for (const selector of selectors) {
    const el = document.querySelector(selector);
    const rect = el?.getBoundingClientRect();
    if (rect && rect.width) return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2, w: rect.width, h: rect.height };
  }
  return null;
}

// Publishes the zoom origin (relative to the app stage) as CSS variables read by efbpad.css.
function setOrigin(point: { x: number; y: number; w: number; h: number } | null) {
  const area = stage()?.getBoundingClientRect();
  const root = document.documentElement.style;
  if (!area || !area.width) return;
  const p = point || { x: area.left + area.width / 2, y: area.top + area.height * 0.55, w: area.width * 0.3, h: area.width * 0.3 };
  const scale = Math.min(0.6, Math.max(0.06, Math.max(p.w / area.width, p.h / area.height) * 1.15));
  root.setProperty('--os-vt-x', `${Math.round(p.x - area.left)}px`);
  root.setProperty('--os-vt-y', `${Math.round(p.y - area.top)}px`);
  root.setProperty('--os-vt-s', scale.toFixed(3));
  root.setProperty('--os-vt-r', `${Math.round(24 / scale)}px`);
}

function fallback(kind: Kind) {
  const area = stage();
  if (!area) return;
  area.dataset.osAnim = '';
  void area.offsetWidth; // restart the animation when navigating quickly
  area.dataset.osAnim = kind;
  window.setTimeout(() => { if (area.dataset.osAnim === kind) delete area.dataset.osAnim; }, 650);
}

/** Runs a screen change (DOM + React state) inside an animated app transition. */
export function transitionTo(target: string, update: () => void) {
  const from = current;
  current = target;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const booting = !!document.querySelector('.os-boot:not(.is-leaving)');
  if (from === target || reduce || booting || document.hidden) { update(); return; }

  const kind: Kind = target === 'home' ? 'close' : from === 'home' ? 'open' : 'switch';
  const recent = lastPress && performance.now() - lastPress.t < 1200 ? lastPress : null;
  lastPress = null;
  if (kind !== 'close') setOrigin(recent || iconFor(target));

  const root = document.documentElement;
  const start = (document as Document & { startViewTransition?: (cb: () => void) => { finished: Promise<void> } }).startViewTransition;
  if (!start) {
    update();
    if (kind === 'close') setOrigin(iconFor(from));
    fallback(kind);
    return;
  }

  const id = ++token;
  root.dataset.osTransition = kind;
  const transition = start.call(document, () => {
    update();
    // The home icon only has a position once the home screen is visible again.
    if (kind === 'close') setOrigin(iconFor(from));
  });
  transition.finished.finally(() => { if (token === id) delete root.dataset.osTransition; });
}
