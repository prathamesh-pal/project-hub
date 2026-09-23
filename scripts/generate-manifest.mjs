// Scans apps/ for sub-projects (everything except "landing") and writes
// apps/landing/public/manifest.json so the landing page can list them
// without any manual wiring. Runs automatically as part of build:all.
import { readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const appsDir = join(__dirname, '..', 'apps')

const entries = readdirSync(appsDir, { withFileTypes: true })
  .filter((d) => d.isDirectory() && d.name !== 'landing')
  .map((d) => d.name)
  .sort()

const toLabel = (name) =>
  name
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')

const manifest = entries.map((name) => ({
  name,
  label: toLabel(name),
  // Relative (no leading slash) so it resolves correctly whether the
  // site is served at the domain root or under a GitHub Pages
  // /<repo-name>/ subpath.
  path: `${name}/`
}))

const outPath = join(appsDir, 'landing', 'public', 'manifest.json')
writeFileSync(outPath, JSON.stringify(manifest, null, 2) + '\n')
console.log(`generate-manifest: wrote ${manifest.length} app(s) -> ${outPath}`)
