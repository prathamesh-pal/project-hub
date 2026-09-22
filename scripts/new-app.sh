#!/bin/bash
# Scaffolds a new sub-app from templates/app-template.
# Usage: npm run new-app -- my-project-name
set -e

NAME="$1"

if [ -z "$NAME" ]; then
  echo "Usage: npm run new-app -- <project-name>"
  echo "Example: npm run new-app -- pomodoro-timer"
  exit 1
fi

if [[ ! "$NAME" =~ ^[a-z0-9-]+$ ]]; then
  echo "Use lowercase letters, numbers, and hyphens only (e.g. pomodoro-timer)."
  exit 1
fi

DEST="apps/$NAME"

if [ -d "$DEST" ]; then
  echo "apps/$NAME already exists."
  exit 1
fi

cp -r templates/app-template "$DEST"

# Fill in the placeholder with the real folder/app name everywhere.
find "$DEST" -type f -exec sed -i.bak "s/__APP_NAME__/$NAME/g" {} \;
find "$DEST" -type f -name "*.bak" -delete

echo ""
echo "Created apps/$NAME"
echo ""
echo "Next steps:"
echo "  cd apps/$NAME && npm install && npm run dev"
echo ""
echo "When you're ready to ship it, just push to main —"
echo "it'll build and appear on the home page automatically."
