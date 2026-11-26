import { useEffect, useRef, useState } from 'react';
import { Lines } from './ui';
import type { CSSVars } from './ui';
import { PROFILE } from '../data';
import { onScroll, clamp, stickyProgress, reducedMotion } from '../scroll';

const SHORT: Record<string, string> = { experience: 'Experience' };
const total = PROFILE.length;
const span = total + 0.6; // scroll range per item; the tail holds the finished profile

function Visual({ id }: { id: string }) {
  switch (id) {
    case 'identity':
      return (
        <div className="v-identity">
          <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true">
            <circle cx="24" cy="24" r="22" /><circle cx="24" cy="24" r="14" strokeDasharray="2 3" /><path d="m17 24.5 5 5 9-10.5" />
          </svg>
          <div className="v-lines"><b /><i /></div>
          <span className="v-badge mono">verified</span>
        </div>
      );
    case 'credentials':
      return (
        <div className="v-seals">
          {[0, 1, 2].map((i) => (
            <svg key={i} viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden="true" style={{ '--d': `${i * 90}ms` } as CSSVars}>
              <path d="M16 2l3.4 3.2 4.7-.3 1.2 4.6 4 2.5-1.6 4.4 1.6 4.4-4 2.5-1.2 4.6-4.7-.3L16 30l-3.4-3.2-4.7.3-1.2-4.6-4-2.5 1.6-4.4L2.7 11l4-2.5 1.2-4.6 4.7.3L16 2Z" />
              <path d="m11 16 3.5 3.5L21 13" />
            </svg>
          ))}
        </div>
      );
    case 'qualifications':
      return (
        <div className="v-quals">
          {[78, 58, 66].map((w, i) => (<p key={i} style={{ '--d': `${i * 90}ms` } as CSSVars}><i /><b style={{ width: `${w}%` }} /></p>))}
        </div>
      );
    case 'skills':
      return (
        <div className="v-skills">
          {[88, 64, 92, 46].map((w, i) => (<span key={i}><b style={{ '--w': w / 100, '--d': `${i * 90}ms` } as CSSVars} /></span>))}
        </div>
      );
    case 'achievements':
      return (
        <div className="v-ach">
          {[1, 1, 1, 0, 0].map((on, i) => (
            <svg key={i} viewBox="0 0 24 24" aria-hidden="true" style={{ '--d': `${i * 80}ms` } as CSSVars}>
              <path d="M12 2 22 12 12 22 2 12Z" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ))}
        </div>
      );
    case 'endorsements':
      return (
        <div className="v-endo">
          <span className="quote-mark" aria-hidden="true">“</span>
          <div className="v-lines"><b /><i /></div>
          <div className="faces" aria-hidden="true"><i /><i /><i /></div>
        </div>
      );
    default:
      return (
        <div className="v-exp" aria-hidden="true">
          <span /><span /><span /><span />
        </div>
      );
  }
}

export default function TrueProfile() {
  const ref = useRef<HTMLElement>(null);
  const still = useRef(reducedMotion()).current;
  const [step, setStep] = useState(still ? total : 0);

  useEffect(() => {
    const el = ref.current;
    if (still || !el) return undefined;
    return onScroll(({ vh }) => {
      const p = stickyProgress(el, vh);
      setStep(clamp(Math.ceil(p * span), 0, total));
    });
  }, [still]);

  const jump = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const range = el.offsetHeight - window.innerHeight;
    window.scrollTo({ top: top + range * ((i + 0.6) / span), behavior: still ? 'auto' : 'smooth' });
  };

  const current = PROFILE[Math.max(0, step - 1)];

  return (
    <section className={`profile ${still ? 'is-static' : ''}`} id="profile" ref={ref} data-tone="dark">
      <div className="profile-stage">
        <div className="wrap profile-grid">
          <div className="profile-copy">
            <h2 className="h2" data-reveal aria-label="More than a name. A whole record.">
              <Lines lines={['More than a name.', 'A whole record.']} />
            </h2>
            <p className="profile-lead">Your TrueProfile brings seven parts of your story into one verified view.</p>

            <ol className="index" aria-label="TrueProfile parts">
              {PROFILE.map((item, i) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className={`${step > i ? 'is-on' : ''} ${step === i + 1 ? 'is-current' : ''}`}
                    onClick={() => jump(i)}
                    aria-label={`Show ${item.label}`}
                  >
                    <i aria-hidden="true" />
                    {item.label}
                  </button>
                </li>
              ))}
            </ol>
            <p className="index-desc" aria-live="polite">{current.description}</p>
          </div>

          <div className="sheet-wrap">
            <div className="sheet" style={{ '--s': step } as CSSVars} role="group" aria-label="An abstract TrueProfile that builds as you scroll">
              <div className="sheet-top mono"><span>TrueProfile</span><span>{step} / {total}</span></div>
              <div className="spine" aria-hidden="true"><i /></div>
              {PROFILE.map((item, i) => (
                <div key={item.id} className={`row ${step > i ? 'on' : ''} ${step > i + 1 ? 'link' : ''}`}>
                  <span className="row-dot" aria-hidden="true" />
                  <span className="row-label mono">{SHORT[item.id] || item.label}</span>
                  <div className="row-visual"><Visual id={item.id} /></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
