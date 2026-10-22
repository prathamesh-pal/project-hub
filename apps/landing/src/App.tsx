
import { useEffect, useState } from 'react'

interface AppEntry {
  name: string
  label: string
  path: string
}

export default function App() {
  const [apps, setApps] = useState<AppEntry[] | null>(null)

  useEffect(() => {
    fetch('manifest.json')
      .then((r) => {
        if (!r.ok) throw new Error('Manifest unavailable')
        return r.json()
      })
      .then((data: AppEntry[]) => setApps(data))
      .catch(() => setApps([]))
  }, [])

  return (
    <div className="landing">
      <header className="landing-header">
        <div className="landing-kicker">
          <span className="signal-dot" />
          PERSONAL EXPERIMENTS / DIGITAL LAB
          <span className="landing-version">INDEX_01</span>
        </div>

        <div className="landing-heading">
          <h1>
            Small things.
            <br />
            <span>Strange ideas.</span>
          </h1>

          <div className="landing-intro">
            <span className="intro-index">[ A—Z / 001 ]</span>
            <p>
              A growing collection of experiments,
              tools, and things built just to see
              what happens.
            </p>
          </div>
        </div>

        <div className="landing-rule">
          <span>THE PROJECT ARCHIVE</span>
          <span>
            {apps === null
              ? 'SCANNING...'
              : `${String(apps.length).padStart(2, '0')} PROJECTS`}
          </span>
        </div>
      </header>

      <main className="landing-grid">
        {apps === null && (
          <p className="landing-status">Establishing connection...</p>
        )}

        {apps?.length === 0 && (
          <p className="landing-status">
            No projects detected. Run{' '}
            <code>npm run new-app -- your-project-name</code> to add one.
          </p>
        )}

        {apps?.map((app, index) => (
          <a
            key={app.name}
            className="landing-card"
            href={app.path}
            target="_blank"
            rel="noopener noreferrer"
            style={{ '--card-index': index } as React.CSSProperties}
          >
            <div className="card-topline">
              <span className="card-number">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="card-status">
                <span className="card-status-dot" />
                DEPLOYED
              </span>
            </div>

            <div className="card-art" aria-hidden="true">
              <span className="card-art-coordinate">
                FIG.{String(index + 1).padStart(2, '0')}
              </span>

              <span className="card-art-glyph">
                {String(index + 1).padStart(2, '0')}
              </span>

              <span className="card-art-cross">+</span>
              <span className="card-art-axis" />
            </div>

            <div className="card-content">
              <div className="card-category">EXPERIMENT / {app.name}</div>

              <h2 className="landing-card-label">{app.label}</h2>

              <div className="card-bottom">
                <span className="landing-card-path">{app.path}</span>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </div>
            </div>
          </a>
        ))}
      </main>

      <footer className="landing-footer">
        <span>MADE OUT OF CURIOSITY.</span>
        <span>MORE EXPERIMENTS IN PROGRESS <span className="footer-cross">✳</span></span>
      </footer>
    </div>
  )
}
