#!/bin/bash
# Builds every app in apps/ into a single dist/ folder at the repo root:
#   dist/                 <- landing page (built first, owns the root)
#   dist/<app-name>/      <- one folder per sub-app
# Run from the repo root: npm run build:all
set -e

rm -rf dist

# Regenerate the landing page's list of apps before it builds.
node scripts/generate-manifest.mjs

echo "Building landing..."
(cd apps/landing && npm install --silent && npm run build)

for dir in apps/*/; do
  app=$(basename "$dir")
  if [ "$app" = "landing" ]; then
    continue
  fi
  echo "Building $app..."
  (cd "apps/$app" && npm install --silent && npm run build)
done

echo "All apps built into dist/"
