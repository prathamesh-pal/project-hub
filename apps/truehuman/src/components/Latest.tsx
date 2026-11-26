import { Lines } from './ui';
import { ARTICLES } from '../data';

// Typographic cover: rings of dots around a scan line — verification as an image.
function Cover() {
  const rings = [52, 92, 132, 172, 212];
  return (
    <svg className="cover-art" viewBox="0 0 640 480" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <g transform="translate(320 240)" fill="currentColor"><g className="cover-rings">
        {rings.map((r, k) =>
          Array.from({ length: 12 + k * 10 }, (_, i) => {
            const a = (i / (12 + k * 10)) * Math.PI * 2;
            return <circle key={`${k}-${i}`} cx={Math.cos(a) * r} cy={Math.sin(a) * r} r={k === 0 ? 2.6 : 1.7} opacity={0.35 + k * 0.1} />;
          })
        )}
      </g></g>
      <path className="cover-scan" d="M320 0v480" stroke="currentColor" strokeWidth="1" />
      <circle cx="320" cy="240" r="30" fill="#f4dc49" />
      <path d="m306 241 10 10 19-21" stroke="#231913" strokeWidth="2.4" fill="none" />
    </svg>
  );
}

export default function Latest() {
  const [lead, ...rest] = ARTICLES;
  return (
    <section className="latest" id="latest" data-tone="light">
      <div className="wrap">
        <div className="latest-head" data-reveal>
          <h2 className="h2" aria-label="Latest from TrueHuman">
            <Lines lines={['Latest from', 'TrueHuman']} />
          </h2>
          <a className="link" href="https://truehuman.id/" target="_blank" rel="noreferrer">Visit truehuman.id</a>
        </div>

        {lead && (
          <a className="lead-article" href={lead.href} target="_blank" rel="noreferrer">
            <div className="cover"><Cover /></div>
            <div className="lead-text">
              {(lead.date || lead.readTime) && (
                <p className="meta mono">{[lead.date, lead.readTime].filter(Boolean).join('  ·  ')}</p>
              )}
              <h3>{lead.title}</h3>
              <span className="read">
                <span>Read the article</span>
                <i aria-hidden="true" />
              </span>
            </div>
          </a>
        )}

        {rest.length > 0 && (
          <ul className="more-articles">
            {rest.map((a) => (
              <li key={a.id}>
                <a href={a.href} target="_blank" rel="noreferrer">
                  <span>{a.title}</span>
                  {a.date && <span className="meta mono">{a.date}</span>}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
