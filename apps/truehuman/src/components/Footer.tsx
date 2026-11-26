import { Mark } from './ui';
import { FOOTER_LINKS } from '../data';
import type { FooterLink } from '../data';

const Link = ({ label, href, external }: FooterLink) => (
  <a href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>{label}</a>
);

export default function Footer() {
  return (
    <footer className="footer" id="contact" data-tone="dark">
      <div className="wrap">
        <div className="footer-top">
          <div className="footer-brand">
            <Mark className="footer-mark" />
            <p>A universal track record for every human.</p>
          </div>
          <nav className="footer-cols" aria-label="Footer">
            <div>
              <h2 className="meta mono">Explore</h2>
              {FOOTER_LINKS.explore.map((l) => <Link key={l.label} {...l} />)}
            </div>
            <div>
              <h2 className="meta mono">Follow</h2>
              {FOOTER_LINKS.social.map((l) => <Link key={l.label} {...l} />)}
            </div>
            <div>
              <h2 className="meta mono">Legal</h2>
              {FOOTER_LINKS.legal.map((l) => <Link key={l.label} {...l} />)}
            </div>
          </nav>
        </div>
      </div>

      <div className="wrap wordmark-wrap">
        <svg className="wordmark" viewBox="0 0 1000 170" aria-hidden="true" focusable="false">
          <text x="-6" y="158" textLength="1012" lengthAdjust="spacingAndGlyphs">TrueHuman</text>
        </svg>
      </div>

      <div className="wrap footer-bottom">
        <span>© {new Date().getFullYear()} TrueHuman</span>
        <a href="#top">Back to top</a>
      </div>
    </footer>
  );
}
