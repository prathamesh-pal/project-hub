import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import { Mark, Lines, Button } from './ui';
import { reducedMotion } from '../scroll';

type Pt = [number, number];
const P = (cx: number, cy: number, r: number, a: number): Pt => [+(cx + r * Math.cos(a)).toFixed(1), +(cy + r * Math.sin(a)).toFixed(1)];
const S = (pt: Pt) => `${pt[0]} ${pt[1]}`;
// Pointed lotus petal: base radius r0 -> tip radius r1, centred on angle a
const petal = (cx: number, cy: number, r0: number, r1: number, a: number, w = 0.3) => {
  const m = (r0 + r1) / 2 + 1;
  return `M${S(P(cx, cy, r0, a - w))}Q${S(P(cx, cy, m, a - w * 0.7))} ${S(P(cx, cy, r1, a))}Q${S(P(cx, cy, m, a + w * 0.7))} ${S(P(cx, cy, r0, a + w))}Z`;
};

// Engraved arch: concentric voussoir rings, fluted pilasters and a lotus rosette,
// with Indian temple-inspired ornament (cusped torana border, jaali, lotus bands).
function Arch({ narrow }: { narrow: boolean }) {
  const cx = 600, cy = 330;
  const rings = [270, 246, 222];
  const stones = Array.from({ length: 23 }, (_, i) => {
    const a = Math.PI + (Math.PI * (i + 1)) / 24;
    return [cx + Math.cos(a) * 222, cy + Math.sin(a) * 222, cx + Math.cos(a) * 270, cy + Math.sin(a) * 270];
  });
  const flutes = (x: number) => Array.from({ length: 5 }, (_, i) => x + 10 + i * 12);
  const ink = '#5e440f';

  // Cusped (foliated) border inside the inner arch
  const CUSPS = 11;
  let cuspD = `M${S(P(cx, cy, 196, Math.PI))}`;
  for (let i = 0; i < CUSPS; i++) {
    const am = Math.PI + ((i + 0.5) * Math.PI) / CUSPS;
    const a1 = Math.PI + ((i + 1) * Math.PI) / CUSPS;
    cuspD += `Q${S(P(cx, cy, 166, am))} ${S(P(cx, cy, 196, a1))}`;
  }
  const cuspDots = Array.from({ length: CUSPS }, (_, i) => P(cx, cy, 186, Math.PI + ((i + 0.5) * Math.PI) / CUSPS));
  const joints = Array.from({ length: CUSPS - 1 }, (_, i) => P(cx, cy, 196, Math.PI + ((i + 1) * Math.PI) / CUSPS));
  const cols = [0, 1, 2, 3, 4];

  return (
    <svg className="arch" viewBox="0 0 1200 760" preserveAspectRatio={narrow ? 'xMidYMax slice' : 'xMidYMax meet'} aria-hidden="true" focusable="false">
      <defs>
        <pattern id="hatch" width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <path d="M0 0v9" stroke={ink} strokeWidth="1" opacity=".3" />
        </pattern>
        {/* Jaali: interlocking diamond lattice with a small floral centre */}
        <pattern id="jaali" width="24" height="24" patternUnits="userSpaceOnUse">
          <path d="M12 0L24 12L12 24L0 12Z" fill="none" stroke={ink} strokeWidth=".8" opacity=".32" />
          <path d="M12 6L18 12L12 18L6 12Z" fill="none" stroke={ink} strokeWidth=".7" opacity=".28" />
          <circle cx="12" cy="12" r="1.3" fill={ink} opacity=".3" />
          <circle cx="0" cy="0" r="1" fill={ink} opacity=".25" />
          <circle cx="24" cy="0" r="1" fill={ink} opacity=".25" />
          <circle cx="0" cy="24" r="1" fill={ink} opacity=".25" />
          <circle cx="24" cy="24" r="1" fill={ink} opacity=".25" />
        </pattern>
        {/* Frieze for the band between the two wall courses (y 520-560) */}
        <pattern id="frieze" width="20" height="40" patternUnits="userSpaceOnUse">
          <path d="M10 529l6 11l-6 11l-6-11z" fill="none" stroke={ink} strokeWidth=".8" opacity=".5" />
          <circle cx="10" cy="540" r="1.2" fill={ink} opacity=".5" />
          <circle cx="0" cy="540" r=".9" fill={ink} opacity=".4" />
        </pattern>
        <linearGradient id="inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fff3a8" stopOpacity=".55" />
          <stop offset="1" stopColor="#d9b400" stopOpacity=".18" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={ink} strokeWidth="1.4" opacity=".85">
        {rings.map((r) => (<path key={r} d={`M${cx - r} 760V${cy}A${r} ${r} 0 0 1 ${cx + r} ${cy}V760`} />))}
        <path d={`M${cx - 198} 760V${cy}A198 198 0 0 1 ${cx + 198} ${cy}V760Z`} fill="url(#inner)" stroke="none" />
        <path d={`M${cx - 198} 760V${cy}A198 198 0 0 1 ${cx + 198} ${cy}V760`} />
        {stones.map((s, i) => (<path key={i} d={`M${s[0]} ${s[1]}L${s[2]} ${s[3]}`} strokeWidth="1" opacity=".7" />))}

        {/* Cusped temple-arch border, inside the original semicircle */}
        <path d={cuspD} strokeWidth="1" opacity=".8" />
        <path d={`M${cx - 168} ${cy}A168 168 0 0 1 ${cx + 168} ${cy}`} strokeWidth=".9" strokeDasharray="1 5" strokeLinecap="round" opacity=".6" />
        {joints.map((j, i) => (<circle key={`j${i}`} cx={j[0]} cy={j[1]} r="1.8" fill={ink} stroke="none" opacity=".8" />))}
        {cuspDots.map((d, i) => (<circle key={`c${i}`} cx={d[0]} cy={d[1]} r="1.5" fill={ink} stroke="none" opacity=".6" />))}

        {/* Keystone + lotus medallion */}
        <path d={`M${cx - 20} ${cy - 270}h40l-6 48h-28z`} fill="#f4dc49" strokeWidth="1.4" />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={`p${i}`} d={petal(cx, cy - 246, 9, 15.5, (i * Math.PI) / 4, 0.32)} strokeWidth=".8" />
        ))}
        <circle cx={cx} cy={cy - 246} r="9" />
        <circle cx={cx} cy={cy - 246} r="3" fill={ink} />
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <path key={i} d={`M${cx} ${cy - 246}l${Math.cos((i * Math.PI) / 4) * 9} ${Math.sin((i * Math.PI) / 4) * 9}`} strokeWidth=".9" />
        ))}
      </g>
      {[0, 1].map((side) => {
        const x = side ? 888 : 242; // pilasters flank the arch
        const mx = x + 35;
        return (
          <g key={side} fill="none" stroke={ink} strokeWidth="1.2" opacity=".7">
            <rect x={x} y="140" width="70" height="620" fill="url(#hatch)" />
            <rect x={x - 8} y="130" width="86" height="14" />
            <rect x={x - 8} y="740" width="86" height="20" />

            {/* capital: dentil ticks */}
            {Array.from({ length: 11 }, (_, i) => (
              <path key={`d${i}`} d={`M${x - 3 + i * 7.6} 133v8`} strokeWidth=".7" />
            ))}

            {/* upper zone: inverted lotus petals, banding, diamond chain */}
            {cols.map((i) => (
              <g key={`u${i}`}>
                <path d={`M${x + i * 14} 150Q${x + i * 14} 178 ${x + i * 14 + 7} 190Q${x + i * 14 + 14} 178 ${x + i * 14 + 14} 150`} strokeWidth=".9" />
                <path d={`M${x + i * 14 + 3.5} 150Q${x + i * 14 + 3.5} 170 ${x + i * 14 + 7} 178Q${x + i * 14 + 10.5} 170 ${x + i * 14 + 10.5} 150`} strokeWidth=".6" opacity=".7" />
                <path d={`M${x + i * 14 + 7} 212l7 7l-7 7l-7-7z`} strokeWidth=".8" />
                <circle cx={x + i * 14 + 7} cy="219" r="1.2" fill={ink} stroke="none" />
              </g>
            ))}
            <path d={`M${x} 200h70M${x} 206h70M${x} 232h70M${x} 236h70`} strokeWidth=".8" />

            {/* flutes: original map and keys, broken around the central medallion */}
            {flutes(x).map((fx) => (<path key={fx} d={`M${fx} 238V410M${fx} 466V640`} strokeWidth=".8" />))}

            {/* central mandala medallion */}
            <path d={`M${x} 410h70M${x} 414h70M${x} 462h70M${x} 466h70`} strokeWidth=".8" />
            <circle cx={mx} cy="438" r="21" strokeWidth=".9" />
            <circle cx={mx} cy="438" r="5" fill={ink} stroke="none" opacity=".8" />
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <path key={`m${i}`} d={petal(mx, 438, 6, 19, (i * Math.PI) / 4, 0.3)} strokeWidth=".8" />
            ))}

            {/* lower zone: diamond chain and upright lotus petals */}
            <path d={`M${x} 644h70M${x} 648h70M${x} 672h70M${x} 676h70`} strokeWidth=".8" />
            {cols.map((i) => (
              <g key={`l${i}`}>
                <path d={`M${x + i * 14 + 7} 654l7 7l-7 7l-7-7z`} strokeWidth=".8" />
                <circle cx={x + i * 14 + 7} cy="661" r="1.2" fill={ink} stroke="none" />
                <path d={`M${x + i * 14} 738Q${x + i * 14} 712 ${x + i * 14 + 7} 700Q${x + i * 14 + 14} 712 ${x + i * 14 + 14} 738`} strokeWidth=".9" />
                <path d={`M${x + i * 14 + 3.5} 738Q${x + i * 14 + 3.5} 720 ${x + i * 14 + 7} 712Q${x + i * 14 + 10.5} 720 ${x + i * 14 + 10.5} 738`} strokeWidth=".6" opacity=".7" />
              </g>
            ))}
          </g>
        );
      })}
      {/* Walls: jaali lattice replaces the generic hatch */}
      <g fill="url(#jaali)" stroke={ink} strokeWidth="1.2" opacity=".6">
        <path d="M-2400 0h2630v760h-2630z" /><path d="M970 0h2630v760H970z" />
      </g>
      <g fill="url(#frieze)" stroke="none" opacity=".6">
        <rect x="-2400" y="520" width="2630" height="40" />
        <rect x="970" y="520" width="2630" height="40" />
      </g>
      <g stroke={ink} strokeWidth="1.2" fill="none" opacity=".75">
        <path d="M230 0v760M970 0v760" />
        <path d="M-2400 520h2630M970 520h2630M-2400 560h2630M970 560h2630" strokeWidth=".8" />
      </g>
    </svg>
  );
}

export default function Claim() {
  const ref = useRef<HTMLElement>(null);
  const [narrow, setNarrow] = useState(() => window.innerWidth < 860);
  useEffect(() => {
    const on = () => setNarrow(window.innerWidth < 860);
    window.addEventListener('resize', on);
    return () => window.removeEventListener('resize', on);
  }, []);
  const light = (e: PointerEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };
  return (
    <section className="claim" id="claim" ref={ref} data-tone="yellow" onPointerMove={light}>
      <Arch narrow={narrow} />
      <div className="claim-light" aria-hidden="true" />
      <div className="claim-body" data-reveal>
        <Mark className="claim-mark" />
        <h2 className="h2 claim-title" aria-label="Your record starts here.">
          <Lines lines={['Your record', 'starts here.']} />
        </h2>
        <Button href="https://truehuman.id/" external variant="light" className="claim-btn">Claim your TrueHuman ID</Button>
      </div>
    </section>
  );
}