# project-hub

One repo, one home page, many small React apps — each one lives at its own
route (`/app-name/`) and is a fully independent Vite + React + TS project.

## Add a new project

```bash
npm run new-app -- your-project-name
cd apps/your-project-name
npm install
npm run dev
```

That's it. `new-app` scaffolds `apps/your-project-name/` from
`templates/app-template`, wired to build to `/your-project-name/`.
You don't need to touch the landing page, the build script, or any config —
the home page's list is regenerated from whatever folders exist in `apps/`
every time the site builds.

## Run everything locally

### Option 1: preview the full site (matches production)

```bash
npm run build:all
npx serve dist
```

Open the URL it prints (usually `http://localhost:3000`). The landing page is
at `/` and each app at `/<name>/`, so links between them work. There's no hot
reload, so rerun `build:all` after changes.

### Option 2: all dev servers at once (hot reload)

```bash
npm run dev:all
```

This starts every app in `apps/` on its own port, starting at `5173`, and
prints the URLs:

```
landing -> http://localhost:5173/
your-app -> http://localhost:5174/your-app/
```

Notes:

- Each app has `base: '/<name>/'`, so open the printed URL **with** the
  `/<name>/` path. The bare port won't show the app.
- Each app needs its dependencies installed first (`npm install` inside the
  folder, or run `build:all` once).
- The landing page's links to `/<name>/` don't work in this mode because every
  app is on a different port. Use the printed URLs, or Option 1 to test
  navigation.

### Which one to use

| Goal | Use |
|---|---|
| Working on a single app | `cd apps/<name> && npm run dev` |
| Editing several apps with hot reload | `npm run dev:all` |
| Checking the whole site and navigation | `npm run build:all && npx serve dist` |

## Ship it

```bash
git add .
git commit -m "add your-project-name"
git push
```

Pushing to `main` triggers `.github/workflows/deploy.yml`, which runs
`npm run build:all` and publishes `dist/` to the `gh-pages` branch. Nothing
else to do — the new project shows up on the home page automatically.

## One-time GitHub Pages setup

1. Push this repo to GitHub.
2. In the repo's Settings → Pages, set the source to the `gh-pages` branch
   (the first push to `main` will create that branch via the Action above).
3. Your site is now live at `https://<you>.github.io/<repo>/`.

## Local commands

| Command | What it does |
|---|---|
| `npm run new-app -- <name>` | Scaffold a new sub-app |
| `npm run build:all` | Build every app into one `dist/` |
| `npm run dev:all` | Start every app's dev server at once, each on its own port |
| `npx serve dist` | Preview the built site locally (run `build:all` first) |
| `npm run deploy` | Build everything and push `dist/` to `gh-pages` manually (the GitHub Action does this for you on push, so you rarely need this locally) |
| `cd apps/<name> && npm run dev` | Work on one app in isolation |

## How it fits together

- `apps/landing/` — the home page. Reads `manifest.json` (auto-generated
  by `scripts/generate-manifest.mjs`) to list every other app.
- `apps/<name>/` — one folder per project, each its own Vite app with
  `base: '/<name>/'` so it resolves correctly once nested under a path.
- `scripts/build-all.sh` — builds landing first (it owns `dist/` root),
  then every other app into `dist/<name>/`.
- `scripts/dev-all.mjs` — starts every app's dev server at once, each on its
  own port.
- `templates/app-template/` — the starter every `new-app` copies from.