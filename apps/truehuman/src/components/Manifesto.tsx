import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Lines } from './ui';
import type { CSSVars } from './ui';
import { STATEMENT, STATIONS } from '../data';
import { onScroll, clamp, flowProgress, reducedMotion } from '../scroll';

function Glyph({ id }: { id: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'square' } as const;
  return (
    <svg viewBox="0 0 64 64" className="glyph" aria-hidden="true" focusable="false">
      {id === 'identity' && (<g {...p}><circle cx="32" cy="32" r="6" /><circle cx="32" cy="32" r="14" /><circle cx="32" cy="32" r="22" strokeDasharray="2 4" /></g>)}
      {id === 'credentials' && (<g {...p}><path d="M14 22h30v30H14zM20 16h30v30" /><path d="m23 37 5 5 10-11" /></g>)}
      {id === 'opportunities' && (<g {...p}><path d="M8 32h20M28 32l22-18M28 32h24M28 32l22 18" /><circle cx="54" cy="12" r="3" /><circle cx="56" cy="32" r="3" /><circle cx="54" cy="52" r="3" /></g>)}
      {id === 'trust' && (<g {...p}><circle cx="24" cy="32" r="14" /><circle cx="40" cy="32" r="14" /><path d="M32 22v20" strokeDasharray="2 3" /></g>)}
    </svg>
  );
}

export default function Manifesto() {
  const words = STATEMENT.split(' ');
  const stmtRef = useRef<HTMLParagraphElement>(null);
  const trackRef = useRef<HTMLOListElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const [d, setD] = useState('');
  const [len, setLen] = useState(0);
  const [step, setStep] = useState(0);

  // Words go from quiet to full strength as the statement scrolls through.
  useEffect(() => {
    const stmt = stmtRef.current;
    if (!stmt) return undefined;
    const spans = stmt.querySelectorAll('span');
    if (reducedMotion()) { spans.forEach((s) => (s.style.opacity = '1')); return undefined; }
    return onScroll(({ vh }) => {
      const r = stmt.getBoundingClientRect();
      const p = clamp((vh * 0.82 - r.top) / (vh * 0.55 + r.height * 0.6));
      spans.forEach((s, i) => {
        const t = (p * 1.25 - (i / spans.length) * 1.1) * 6;
        s.style.opacity = String(0.16 + 0.84 * clamp(t));
      });
    });
  }, []);

  // Measure station dots so the connecting line follows the real layout.
  useLayoutEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const measure = () => {
      const base = track.getBoundingClientRect();
      const pts = [...track.querySelectorAll<HTMLElement>('.station-dot')].map((dot) => {
        const r = dot.getBoundingClientRect();
        return [r.left - base.left + r.width / 2, r.top - base.top + r.height / 2];
      });
      let path = `M${pts[0][0]} ${pts[0][1]}`;
      for (let i = 1; i < pts.length; i++) {
        const [x1, y1] = pts[i - 1], [x2, y2] = pts[i];
        const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1) * 0.5 && window.innerWidth >= 860;
        path += horizontal
          ? ` C${x1 + (x2 - x1) / 2} ${y1} ${x1 + (x2 - x1) / 2} ${y2} ${x2} ${y2}`
          : ` L${x2} ${y2}`;
      }
      setD(path);
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(track);
    return () => ro.disconnect();
  }, []);
  useLayoutEffect(() => { if (pathRef.current) setLen(pathRef.current.getTotalLength()); }, [d]);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return undefined;
    const still = reducedMotion();
    return onScroll(({ vh }) => {
      const p = still ? 1 : flowProgress(track, vh, 0.8, 0.8);
      track.style.setProperty('--p', p.toFixed(3));
      setStep(Math.min(4, Math.floor(p * 4.6 + 0.2)));
    });
  }, []);

  return (
    <section className="manifesto" id="manifesto" data-tone="light">
      <div className="wrap">
        <div className="statement-row">
          <p className="meta mono">Manifesto</p>
          <p className="statement" ref={stmtRef}>
            {words.map((w, i) => (<span key={i}>{w}{' '}</span>))}
          </p>
        </div>

        <div className="track-head">
          <h2 className="h2" data-reveal aria-label="A track record that travels with you.">
            <Lines lines={['A track record', 'that travels', 'with you.']} />
          </h2>
          <p className="track-note">One verified identity, carried through every place you’re asked to prove who you are.</p>
        </div>

        <ol className="track" ref={trackRef} style={{ '--p': 0 } as CSSVars}>
          <svg className="track-line" aria-hidden="true">
            <path d={d} className="track-base" />
            <path ref={pathRef} d={d} className="track-draw" style={{ strokeDasharray: len, strokeDashoffset: `calc(${len}px * (1 - var(--p)))` }} />
          </svg>
          {STATIONS.map((s, i) => (
            <li key={s.id} className={`station ${step > i ? 'is-on' : ''}`}>
              <span className="station-dot" />
              <span className="station-no mono">{String(i + 1).padStart(2, '0')}</span>
              <Glyph id={s.id} />
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
