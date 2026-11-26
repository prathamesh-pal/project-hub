import { Lines } from './ui';
import { CONTEXTS } from '../data';

function Glyph({ id }: { id: string }) {
  const p = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.25, strokeLinecap: 'square' } as const;
  return (
    <svg viewBox="0 0 64 64" className="ctx-glyph" aria-hidden="true" focusable="false">
      {id === 'recruiters' && (<g {...p}><path d="M10 22h44v30H10zM24 22v-8h16v8M10 34h44" /><path d="M29 34v6h6v-6" /></g>)}
      {id === 'digital' && (<g {...p}><path d="M8 14h48v36H8zM8 24h48" /><path d="M22 36l16 4-6 3 6 6" /></g>)}
      {id === 'banking' && (<g {...p}><path d="M8 24 32 10l24 14M12 24h40M16 24v22M28 24v22M36 24v22M48 24v22M10 46h44M8 52h48" /></g>)}
    </svg>
  );
}

export default function Contexts() {
  return (
    <section className="contexts" id="recruiters" data-tone="light">
      <div className="wrap">
        <div className="contexts-head" data-reveal>
          <h2 className="h3" aria-label="Where it matters">
            <Lines lines={['Where it matters']} />
          </h2>
          <p className="meta mono">Three places a record is asked for</p>
        </div>
        <ul className="ctx-list">
          {CONTEXTS.map((c) => (
            <li className="ctx" key={c.id} data-reveal>
              <h3>{c.name}</h3>
              <p>{c.text}</p>
              <Glyph id={c.id} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
