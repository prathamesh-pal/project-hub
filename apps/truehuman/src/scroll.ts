// One shared, rAF-throttled scroll/resize loop. Every scroll-linked effect
// subscribes here so the page never runs more than one scroll listener.
export interface ScrollState {
  y: number;
  vh: number;
}
type ScrollCallback = (state: ScrollState) => void;

const subs = new Set<ScrollCallback>();
let queued = false;
let bound = false;

function run() {
  queued = false;
  const state: ScrollState = { y: window.scrollY, vh: window.innerHeight };
  subs.forEach((cb) => cb(state));
}
function request() {
  if (queued) return;
  queued = true;
  requestAnimationFrame(run);
}

export function onScroll(cb: ScrollCallback): () => void {
  subs.add(cb);
  if (!bound) {
    window.addEventListener('scroll', request, { passive: true });
    window.addEventListener('resize', request);
    bound = true;
  }
  request();
  return () => {
    subs.delete(cb);
  };
}

export const clamp = (v: number, a = 0, b = 1): number => Math.min(b, Math.max(a, v));
export const reducedMotion = (): boolean =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Progress of a normal (non-sticky) block moving up through the viewport.
export function flowProgress(el: Element, vh: number, lead = 0.85, span = 0.9): number {
  const r = el.getBoundingClientRect();
  return clamp((vh * lead - r.top) / (r.height * span));
}
// Progress through a tall section that contains a sticky stage.
export function stickyProgress(el: Element, vh: number): number {
  const r = el.getBoundingClientRect();
  return clamp(-r.top / Math.max(1, r.height - vh));
}
