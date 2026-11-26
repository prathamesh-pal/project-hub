import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import type { CSSVars } from './ui';
import { Mark, ArrowIcon } from './ui';
import { NAV } from '../data';
import { onScroll } from '../scroll';

export default function Header() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [tone, setTone] = useState<string>('light');
  const [active, setActive] = useState<string | null>('top');
  const linksRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);

  useEffect(
    () =>
      onScroll(({ y, vh }) => {
        setScrolled(y > 24);
        let t = 'light';
        document.querySelectorAll('[data-tone]').forEach((el) => {
          const r = el.getBoundingClientRect();
          if (r.top <= 34 && r.bottom > 34) t = (el as HTMLElement).dataset.tone ?? 'light';
        });
        setTone(t);
        let cur = null;
        NAV.forEach(({ id }) => {
          const el = document.getElementById(id);
          if (!el) return;
          const r = el.getBoundingClientRect();
          if (r.top <= vh * 0.35 && r.bottom > vh * 0.35) cur = id;
        });
        setActive(cur);
      }),
    []
  );

  // Slide the active indicator under the current link.
  useLayoutEffect(() => {
    const ind = indicatorRef.current;
    const link = linksRef.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!ind) return;
    if (!link) { ind.style.opacity = '0'; return; }
    ind.style.opacity = '1';
    ind.style.width = `${link.offsetWidth}px`;
    ind.style.transform = `translateX(${link.offsetLeft}px)`;
  }, [active]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = ''; };
  }, [open]);

  const close = () => setOpen(false);
  const cls = ['header', scrolled && 'is-scrolled', `tone-${open ? 'light' : tone}`, open && 'is-open'].filter(Boolean).join(' ');

  return (
    <header className={cls}>
      <div className="header-inner">
        <a className="brand" href="#top" aria-label="TrueHuman, home" onClick={close}>
          <Mark />
          <span>TrueHuman</span>
        </a>

        <nav className="nav" aria-label="Main">
          <div className="nav-links" ref={linksRef}>
            <span className="nav-indicator" ref={indicatorRef} aria-hidden="true" />
            {NAV.map((item) => (
              <a key={item.id} href={item.href} data-id={item.id} aria-current={active === item.id ? 'true' : undefined}>
                {item.label}
              </a>
            ))}
          </div>
          <a className="nav-cta" href="#contact">
            <span>Get in touch</span>
            <ArrowIcon />
          </a>
        </nav>

        <button className="menu-btn" aria-expanded={open} aria-controls="mobile-menu" onClick={() => setOpen((o) => !o)}>
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="menu-bars" aria-hidden="true"><i /><i /></span>
        </button>
      </div>

      <div className="menu" id="mobile-menu" aria-hidden={!open}>
        <nav aria-label="Mobile">
          {NAV.map((item, i) => (
            <a key={item.id} href={item.href} onClick={close} style={{ '--i': i } as CSSVars} tabIndex={open ? 0 : -1}>
              <span className="menu-idx">{String(i + 1).padStart(2, '0')}</span>
              {item.label}
            </a>
          ))}
          <a className="menu-cta" href="#contact" onClick={close} style={{ '--i': NAV.length } as CSSVars} tabIndex={open ? 0 : -1}>
            Get in touch <ArrowIcon />
          </a>
        </nav>
      </div>
    </header>
  );
}
