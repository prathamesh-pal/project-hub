import { useRef } from 'react';
import IdentityField from './IdentityField';
import { Button, Lines } from './ui';
import { CLUSTERS } from '../data';

export default function Hero() {
  const focusRef = useRef(-1);
  const set = (v: number) => () => { focusRef.current = v; };
  return (
    <section className="hero" id="top" data-tone="light">
      <div className="hero-field">
        <IdentityField focusRef={focusRef} />
      </div>
      <p className="hero-fig mono">· The human record : Internet </p>

      <div className="hero-body wrap">
        <h1 className="hero-title" data-reveal aria-label="One identity. A lifetime of proof.">
          <Lines lines={['One identity.', 'A lifetime', 'of proof.']} />
        </h1>

        <div className="hero-foot">
          <div className="hero-copy">
            <p>Your verified identity, credentials and achievements. One record that moves with you.</p>
            <div className="hero-actions">
              <Button href="https://truehuman.id/" external>Get your TrueHuman ID</Button>
              <a className="link" href="#manifesto">Explore the idea</a>
            </div>
          </div>

          <ul className="legend" aria-label="What the network is made of. Hover or focus to isolate a group.">
            {CLUSTERS.map((c, i) => (
              <li key={c.id}>
                <button
                  type="button"
                  onPointerEnter={set(i)}
                  onPointerLeave={set(-1)}
                  onFocus={set(i)}
                  onBlur={set(-1)}
                >
                  <i style={{ background: `rgb(${c.rgb.join(',')})` }} aria-hidden="true" />
                  {c.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
