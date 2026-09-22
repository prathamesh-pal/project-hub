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
| `npm run deploy` | Build everything and push `dist/` to `gh-pages` manually (the GitHub Action does this for you on push, so you rarely need this locally) |
| `cd apps/<name> && npm run dev` | Work on one app in isolation |

## How it fits together

- `apps/landing/` — the home page. Reads `manifest.json` (auto-generated
  by `scripts/generate-manifest.mjs`) to list every other app.
- `apps/<name>/` — one folder per project, each its own Vite app with
  `base: '/<name>/'` so it resolves correctly once nested under a path.
- `scripts/build-all.sh` — builds landing first (it owns `dist/` root),
  then every other app into `dist/<name>/`.
- `templates/app-template/` — the starter every `new-app` copies from.
