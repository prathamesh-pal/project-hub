import { useEffect, useRef } from 'react';
import type { MutableRefObject } from 'react';
import { CLUSTERS } from '../data';
import { onScroll, clamp, reducedMotion } from '../scroll';

const TAU = Math.PI * 2;
const ease = (t: number): number => 1 - Math.pow(1 - t, 3);

function rng(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Chord { a: number; b: number; th: number; c: number }
interface Field {
  count: number;
  x: Float32Array; y: Float32Array; z: Float32Array;
  cl: Uint8Array; nth: Float32Array;
  ea: number[]; eb: number[]; eth: number[]; ech: number[];
  adj: number[][];
  chords: Chord[];
}
interface FieldEvent { n: number; t: number; cl: number }

// Build nodes (a slightly irregular sphere), local links, and a few long chords.
function buildField(count: number): Field {
  const rnd = rng(11);
  const ga = Math.PI * (3 - Math.sqrt(5));
  const tetra = [[1, 1, 1], [1, -1, -1], [-1, 1, -1], [-1, -1, 1]].map((v) => {
    const l = Math.hypot(...v);
    return v.map((c) => c / l);
  });
  const x = new Float32Array(count), y = new Float32Array(count), z = new Float32Array(count);
  const cl = new Uint8Array(count), nth = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const yy = 1 - ((i + 0.5) / count) * 2;
    const rr = Math.sqrt(1 - yy * yy);
    const th = ga * i;
    let px = Math.cos(th) * rr, py = yy, pz = Math.sin(th) * rr;
    // jitter breaks the regular spiral so the field reads as organic
    const jit = 0.055;
    px += (rnd() - 0.5) * jit * 2; py += (rnd() - 0.5) * jit * 2; pz += (rnd() - 0.5) * jit * 2;
    const jl = Math.hypot(px, py, pz); px /= jl; py /= jl; pz /= jl;
    const bump = 1 + 0.028 * Math.sin(px * 3.1 + 1.3) * Math.cos(py * 2.3) + 0.02 * Math.sin(pz * 4.2);
    let best = -9, bi = 0;
    tetra.forEach((c, k) => {
      const s = px * c[0] + py * c[1] + pz * c[2] + (rnd() - 0.5) * 0.7;
      if (s > best) { best = s; bi = k; }
    });
    x[i] = px * bump; y[i] = py * bump; z[i] = pz * bump;
    cl[i] = bi; nth[i] = rnd();
  }

  // Links: each node to its nearest few neighbours, found with a spatial hash.
  const spacing = Math.sqrt((4 * Math.PI) / count);
  const maxD = spacing * 2.1;
  const cell = maxD;
  const grid = new Map();
  const key = (a: number, b: number, c: number): string => `${a},${b},${c}`;
  for (let i = 0; i < count; i++) {
    const k = key(Math.floor(x[i] / cell), Math.floor(y[i] / cell), Math.floor(z[i] / cell));
    if (!grid.has(k)) grid.set(k, []);
    grid.get(k).push(i);
  }
  const seen = new Set();
  const ea: number[] = [], eb: number[] = [], eth: number[] = [], ech: number[] = [];
  const seed = tetra[0];
  const adj: number[][] = Array.from({ length: count }, () => []);
  for (let i = 0; i < count; i++) {
    const cx = Math.floor(x[i] / cell), cy = Math.floor(y[i] / cell), cz = Math.floor(z[i] / cell);
    const near: [number, number][] = [];
    for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (let dz = -1; dz <= 1; dz++) {
      const list = grid.get(key(cx + dx, cy + dy, cz + dz));
      if (!list) continue;
      for (const j of list) {
        if (j === i) continue;
        const d = Math.hypot(x[i] - x[j], y[i] - y[j], z[i] - z[j]);
        if (d < maxD) near.push([d, j]);
      }
    }
    near.sort((p, q) => p[0] - q[0]);
    for (const [, j] of near.slice(0, 3)) {
      const a = Math.min(i, j), b = Math.max(i, j);
      const k = a * count + b;
      if (seen.has(k)) continue;
      seen.add(k);
      // Links appear in a wave that spreads outward from the identity cluster.
      const mx = (x[a] + x[b]) / 2, my = (y[a] + y[b]) / 2, mz = (z[a] + z[b]) / 2;
      const ang = Math.acos(clamp((mx * seed[0] + my * seed[1] + mz * seed[2]) / Math.hypot(mx, my, mz), -1, 1)) / Math.PI;
      const idx = ea.length;
      ea.push(a); eb.push(b); eth.push(clamp(ang * 0.82 + rnd() * 0.2)); ech.push(cl[a]);
      adj[a].push(idx); adj[b].push(idx);
    }
  }
  // Long chords between different clusters: the "this connects to that" links.
  const chords: Chord[] = [];
  const want = Math.round(count / 38);
  let guard = 0;
  while (chords.length < want && guard++ < want * 40) {
    const a = Math.floor(rnd() * count), b = Math.floor(rnd() * count);
    if (cl[a] === cl[b]) continue;
    if (Math.hypot(x[a] - x[b], y[a] - y[b], z[a] - z[b]) < 1.0) continue;
    chords.push({ a, b, th: 0.1 + rnd() * 0.8, c: cl[a] });
  }
  return { count, x, y, z, cl, nth, ea, eb, eth, ech, adj, chords };
}

export default function IdentityField({ focusRef }: { focusRef: MutableRefObject<number> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;
    const host = canvas.parentElement as HTMLElement;
    const section = (canvas.closest('section') || host) as HTMLElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return undefined;
    const still = reducedMotion();
    const small = window.innerWidth < 860;
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4;
    const count = Math.round((small ? 1100 : 3200) * (lowPower ? 0.7 : 1));
    const F = buildField(count);
    const sx = new Float32Array(count), sy = new Float32Array(count), sz = new Float32Array(count);

    let w = 1, h = 1, dpr = 1, raf = 0, running = false, visible = true;
    let yaw = 0.6, yawOff = 0, tiltOff = 0, last = 0, t0 = 0, scrollY = 0, fcMix = 0;
    const pointer = { x: -999, y: -999, tx: 0, ty: 0, on: false, mix: 0 };
    let events: FieldEvent[] = [];
    let nextEvent = 0;

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = Math.max(1, r.width); h = Math.max(1, r.height);
      dpr = Math.min(window.devicePixelRatio || 1, w < 860 ? 1.5 : 2);
      canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (!running) draw(performance.now(), 0);
    };

    const rgba = (c: number[], a: number): string => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

    const draw = (now: number, dt: number): void => {
      const wide = w >= 860;
      const intro = still ? 1 : clamp((now - t0 - 250) / 3000);
      const heroH = Math.max(1, section.getBoundingClientRect().height);
      const scrollP = clamp(scrollY / (heroH * 0.9));
      const c = still ? 1 : ease(intro) * 0.62 + scrollP * 0.38;
      const nodeIntro = still ? 1 : clamp(intro * 1.7);

      const cx = wide ? w * 0.69 : w * 0.5;
      const cy = (wide ? h * 0.5 : h * 0.31) - scrollY * 0.07;
      const R = wide ? Math.min(h * 0.46, w * 0.33) : Math.min(w * 0.4, h * 0.22);
      const sc = clamp(R / 360, 0.5, 1.4);

      // smooth pointer influence
      pointer.mix += ((pointer.on ? 1 : 0) - pointer.mix) * 0.08;
      pointer.tx += (pointer.x - pointer.tx) * 0.2;
      pointer.ty += (pointer.y - pointer.ty) * 0.2;
      const px = clamp(((pointer.x - cx) / (w * 0.5)), -1, 1), py = clamp(((pointer.y - cy) / (h * 0.5)), -1, 1);
      yawOff += ((pointer.on ? px * 0.35 : 0) - yawOff) * 0.04;
      tiltOff += ((pointer.on ? py * 0.16 : 0) - tiltOff) * 0.04;
      if (!still) yaw += dt * 0.000075;
      const fc = focusRef.current;
      fcMix += ((fc >= 0 ? 1 : 0) - fcMix) * 0.14;
      const dim = 1 - 0.68 * fcMix;

      const cY = Math.cos(yaw + yawOff), sY = Math.sin(yaw + yawOff);
      const cX = Math.cos(0.2 + tiltOff), sX = Math.sin(0.2 + tiltOff);
      const near: [number, number][] = [];
      for (let i = 0; i < count; i++) {
        const x1 = F.x[i] * cY - F.z[i] * sY;
        const z1 = F.x[i] * sY + F.z[i] * cY;
        const y2 = F.y[i] * cX - z1 * sX;
        const z2 = F.y[i] * sX + z1 * cX;
        const p = 1 / (1.35 - z2 * 0.26);
        sx[i] = cx + x1 * R * p; sy[i] = cy + y2 * R * p; sz[i] = z2;
        if (pointer.mix > 0.05 && z2 > -0.1) {
          const d = Math.hypot(sx[i] - pointer.tx, sy[i] - pointer.ty);
          if (d < 100 * sc + 20) near.push([d, i]);
        }
      }
      ctx.clearRect(0, 0, w, h);

      // soft ring to hold the sphere without a hard edge
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(35,25,19,.07)';
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.17, 0, TAU); ctx.stroke();
      ctx.strokeStyle = 'rgba(35,25,19,.045)';
      ctx.beginPath(); ctx.arc(cx, cy, R * 1.36, 0, TAU); ctx.stroke();

      const nearSet = new Set(near.map((n) => n[1]));
      const flagged = near.length ? nearSet : null;

      // chords (curved through the interior)
      ctx.lineWidth = 0.7;
      for (const ch of F.chords) {
        if (ch.th > c) continue;
        const k = clamp((c - ch.th) * 5);
        const ax = sx[ch.a], ay = sy[ch.a], bx = sx[ch.b], by = sy[ch.b];
        ctx.strokeStyle = rgba(CLUSTERS[ch.c].rgb, 0.17 * k * dim + (fc === ch.c ? 0.25 * fcMix * k : 0));
        ctx.beginPath(); ctx.moveTo(ax, ay);
        ctx.quadraticCurveTo(cx + ((ax + bx) / 2 - cx) * 0.45, cy + ((ay + by) / 2 - cy) * 0.45, bx, by);
        ctx.stroke();
      }

      // links, batched by depth; the growth front and focus are drawn separately
      const back = new Path2D(), mid = new Path2D(), front = new Path2D(), focus = new Path2D();
      const accent = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
      const growing: number[] = [];
      for (let e = 0; e < F.ea.length; e++) {
        const th = F.eth[e];
        if (th > c) continue;
        const a = F.ea[e], b = F.eb[e];
        const k = (c - th) * 7;
        if (k < 1 && !still) { growing.push(e, k); continue; }
        const d = (sz[a] + sz[b]) / 2;
        const path = d < -0.25 ? back : d < 0.25 ? mid : front;
        path.moveTo(sx[a], sy[a]); path.lineTo(sx[b], sy[b]);
        if (fcMix > 0.02 && F.cl[a] === fc && F.cl[b] === fc) { focus.moveTo(sx[a], sy[a]); focus.lineTo(sx[b], sy[b]); }
        if (flagged && (flagged.has(a) || flagged.has(b)) && d > -0.2) { accent[F.ech[e]].moveTo(sx[a], sy[a]); accent[F.ech[e]].lineTo(sx[b], sy[b]); }
      }
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = `rgba(35,25,19,${0.05 * dim})`; ctx.stroke(back);
      ctx.strokeStyle = `rgba(35,25,19,${0.1 * dim})`; ctx.stroke(mid);
      ctx.strokeStyle = `rgba(35,25,19,${0.2 * dim})`; ctx.stroke(front);
      if (fcMix > 0.02) { ctx.lineWidth = 0.9; ctx.strokeStyle = rgba(CLUSTERS[fc >= 0 ? fc : 0].rgb, 0.6 * fcMix); ctx.stroke(focus); }
      ctx.lineWidth = 0.9;
      for (let k = 0; k < 4; k++) { ctx.strokeStyle = rgba(CLUSTERS[k].rgb, 0.55 * pointer.mix); ctx.stroke(accent[k]); }
      ctx.lineWidth = 0.9;
      for (let g = 0; g < growing.length; g += 2) {
        const e = growing[g], k = growing[g + 1];
        const a = F.ea[e], b = F.eb[e];
        ctx.strokeStyle = rgba(CLUSTERS[F.ech[e]].rgb, 0.55 * (1 - k) + 0.12 * k);
        ctx.beginPath(); ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]); ctx.stroke();
      }

      // pointer: connect the nodes nearest the cursor to each other
      if (near.length > 1 && pointer.mix > 0.05) {
        near.sort((p, q) => p[0] - q[0]);
        const pick = near.slice(0, 11);
        ctx.lineWidth = 0.9;
        for (let i = 0; i < pick.length; i++) for (let j = i + 1; j < Math.min(pick.length, i + 3); j++) {
          const a = pick[i][1], b = pick[j][1];
          ctx.strokeStyle = rgba(CLUSTERS[F.cl[a]].rgb, 0.45 * pointer.mix);
          ctx.beginPath(); ctx.moveTo(sx[a], sy[a]); ctx.lineTo(sx[b], sy[b]); ctx.stroke();
        }
      }

      // nodes: 2 depth layers x 4 clusters
      for (let layer = 0; layer < 2; layer++) {
        const paths = [new Path2D(), new Path2D(), new Path2D(), new Path2D()];
        for (let i = 0; i < count; i++) {
          if ((sz[i] >= 0 ? 1 : 0) !== layer) continue;
          const vis = clamp((nodeIntro - F.nth[i] * 0.85) * 9);
          if (vis <= 0) continue;
          const r = (0.8 + (sz[i] + 1) * 0.62) * sc * vis * (flagged && flagged.has(i) ? 1.7 : 1);
          paths[F.cl[i]].moveTo(sx[i] + r, sy[i]);
          paths[F.cl[i]].arc(sx[i], sy[i], r, 0, TAU);
        }
        for (let k = 0; k < 4; k++) {
          const mine = fc === k ? 1 : dim;
          ctx.fillStyle = rgba(CLUSTERS[k].rgb, (layer ? 0.88 : 0.3) * mine);
          ctx.fill(paths[k]);
        }
      }

      // small events: a record is added somewhere in the network
      if (!still && intro >= 1) {
        if (now > nextEvent) {
          const n = Math.floor(Math.random() * count);
          if (sz[n] > 0.15) events.push({ n, t: now, cl: F.cl[n] });
          nextEvent = now + 1100 + Math.random() * 900;
        }
        events = events.filter((ev) => now - ev.t < 2400);
        events.forEach((ev, idx) => {
          const age = (now - ev.t) / 2400;
          const x = sx[ev.n], y = sy[ev.n], col = CLUSTERS[ev.cl].rgb;
          F.adj[ev.n].forEach((e) => {
            if (F.eth[e] > c) return;
            ctx.strokeStyle = rgba(col, (1 - age) * 0.7); ctx.lineWidth = 1.1;
            ctx.beginPath(); ctx.moveTo(sx[F.ea[e]], sy[F.ea[e]]); ctx.lineTo(sx[F.eb[e]], sy[F.eb[e]]); ctx.stroke();
          });
          ctx.strokeStyle = rgba(col, (1 - age) * 0.8); ctx.lineWidth = 1;
          ctx.beginPath(); ctx.arc(x, y, (3 + ease(Math.min(1, age * 1.4)) * 20) * sc, 0, TAU); ctx.stroke();
          ctx.fillStyle = rgba(col, 1 - age * 0.4);
          ctx.beginPath(); ctx.arc(x, y, 2.6 * sc + 0.6, 0, TAU); ctx.fill();
          const roomy = wide ? x > w * 0.5 : y < h * 0.6;
          if (idx === events.length - 1 && roomy && age < 0.85 && x > 70 && x < w - 150) {
            const text = CLUSTERS[ev.cl].event;
            const a = Math.min(1, (1 - age) * 3, age * 8);
            ctx.font = '500 11px "Geist Mono Variable", ui-monospace, monospace';
            const tw = ctx.measureText(text).width + 16;
            const lx = x + 18, ly = y - 26;
            ctx.globalAlpha = a;
            ctx.strokeStyle = rgba(col, 0.7); ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(x + 4, y - 4); ctx.lineTo(lx, ly + 11); ctx.stroke();
            ctx.fillStyle = 'rgba(245,240,228,.94)'; ctx.fillRect(lx, ly, tw, 22);
            ctx.strokeRect(lx + 0.5, ly + 0.5, tw - 1, 21);
            ctx.fillStyle = '#231913'; ctx.textBaseline = 'middle'; ctx.fillText(text, lx + 8, ly + 11.5);
            ctx.globalAlpha = 1;
          }
        });
      }
    };

    const loop = (now: number) => {
      if (!running) return;
      const dt = Math.min(48, now - (last || now));
      last = now;
      draw(now, dt);
      raf = requestAnimationFrame(loop);
    };
    const start = () => {
      if (still || running || !visible || document.hidden) return;
      running = true; last = 0; raf = requestAnimationFrame(loop);
    };
    const stop = () => { running = false; cancelAnimationFrame(raf); };

    t0 = performance.now();
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; visible ? start() : stop(); });
    io.observe(section);
    const vis = () => (document.hidden ? stop() : start());
    document.addEventListener('visibilitychange', vis);
    const off = onScroll(({ y }) => { scrollY = y; if (!running) draw(performance.now(), 0); });

    const move = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      pointer.x = e.clientX - r.left; pointer.y = e.clientY - r.top; pointer.on = true;
    };
    const leave = () => { pointer.on = false; };
    section.addEventListener('pointermove', move);
    section.addEventListener('pointerleave', leave);
    start();

    return () => {
      stop(); ro.disconnect(); io.disconnect(); off();
      document.removeEventListener('visibilitychange', vis);
      section.removeEventListener('pointermove', move);
      section.removeEventListener('pointerleave', leave);
    };
  }, [focusRef]);

  return (
    <canvas
      ref={canvasRef}
      className="field-canvas"
      role="img"
      aria-label="An animated network of thousands of connected nodes, grouped into identity, credentials, skills and achievements"
    />
  );
}
