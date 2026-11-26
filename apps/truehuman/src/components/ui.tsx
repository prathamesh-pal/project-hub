import { useRef } from 'react';
import type { CSSProperties, PointerEvent, ReactNode } from 'react';
import { reducedMotion } from '../scroll';

/** Inline style that also accepts CSS custom properties (e.g. `--i`). */
export type CSSVars = CSSProperties & Record<`--${string}`, string | number>;

export function Mark({ className = '' }: { className?: string }) {
  return (
    <svg className={`mark ${className}`} viewBox="0 0 36 36" fill="none" aria-hidden="true" focusable="false">
      <path d="M18 4.5 22.2 12l-4.2 7.4L13.8 12 18 4.5Z" fill="currentColor" />
      <path d="m8.2 20.2 8.5-1.3 4.9 6.9-8.5 1.3-4.9-6.9Z" fill="currentColor" opacity=".7" />
      <path d="m27.8 20.2-8.5-1.3-4.9 6.9 8.5 1.3 4.9-6.9Z" fill="currentColor" opacity=".9" />
      <path d="m18 20.5 4.6 7.9H13.4l4.6-7.9Z" fill="currentColor" />
    </svg>
  );
}

export function ArrowIcon() {
  return (
    <svg className="arrow-icon" viewBox="0 0 16 16" width="16" height="16" fill="none" aria-hidden="true" focusable="false">
      <path d="M3 8h9.5M8.5 4 12.5 8l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
    </svg>
  );
}

interface LinesProps {
  lines: string[];
  start?: number;
}

// Headline split into masked lines. Reveals when an ancestor gets `.is-in`.
export function Lines({ lines, start = 0 }: LinesProps) {
  return (
    <>
      {lines.map((text, i) => (
        <span className="line" key={text} aria-hidden="true">
          <span style={{ '--i': i + start } as CSSVars}>{text}</span>
        </span>
      ))}
    </>
  );
}

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: 'ink' | 'light';
  external?: boolean;
  className?: string;
}

// Button with a fill-sweep hover, a small magnetic pull and a press state.
export function Button({ href, children, variant = 'ink', external = false, className = '' }: ButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const move = (e: PointerEvent<HTMLAnchorElement>) => {
    const el = ref.current;
    if (!el || reducedMotion() || e.pointerType === 'touch') return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left - r.width / 2) / r.width;
    const y = (e.clientY - r.top - r.height / 2) / r.height;
    el.style.setProperty('--tx', `${(x * 10).toFixed(1)}px`);
    el.style.setProperty('--ty', `${(y * 8).toFixed(1)}px`);
  };
  const leave = () => {
    ref.current?.style.setProperty('--tx', '0px');
    ref.current?.style.setProperty('--ty', '0px');
  };
  return (
    <a
      ref={ref}
      className={`btn btn-${variant} ${className}`}
      href={href}
      onPointerMove={move}
      onPointerLeave={leave}
      {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      <span className="btn-label">{children}</span>
      <ArrowIcon />
    </a>
  );
}
