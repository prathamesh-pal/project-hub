import { useState } from 'react';
import { Lines } from './ui';
import { FAQS } from '../data';

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="faq" id="faq" data-tone="light">
      <div className="wrap faq-grid">
        <div className="faq-head" data-reveal>
          <h2 className="h2" aria-label="Questions, answered.">
            <Lines lines={['Questions,', 'answered.']} />
          </h2>
        </div>
        <div className="faq-list">
          {FAQS.map((f, i) => {
            const isOpen = open === i;
            return (
              <div className={`faq-item ${isOpen ? 'is-open' : ''}`} key={f.q}>
                <h3>
                  <button
                    type="button"
                    id={`faq-q-${i}`}
                    aria-expanded={isOpen}
                    aria-controls={`faq-a-${i}`}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <span>{f.q}</span>
                    <i aria-hidden="true" />
                  </button>
                </h3>
                <div className="faq-a" id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`}>
                  <div><p>{f.a}</p></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
