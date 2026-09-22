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
      .then((r) => r.json())
      .then(setApps)
      .catch(() => setApps([]))
  }, [])

  return (
    <div className="landing">
      <header className="landing-header">
        <h1>Projects</h1>
        <p>A running set of small builds, each its own app.</p>
      </header>

      <main className="landing-grid">
        {apps === null && <p className="landing-status">loading…</p>}

        {apps?.length === 0 && (
          <p className="landing-status">
            No projects yet — run <code>npm run new-app -- your-project-name</code> to add one.
          </p>
        )}

        {apps?.map((app) => (
          <a key={app.name} className="landing-card" href={app.path}>
            <span className="landing-card-label">{app.label}</span>
            <span className="landing-card-path">{app.path}</span>
          </a>
        ))}
      </main>
    </div>
  )
}
