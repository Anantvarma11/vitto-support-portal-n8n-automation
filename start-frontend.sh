#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

if [[ ! -d "$FRONTEND_DIR" ]]; then
  echo "frontend/ folder not found at: $FRONTEND_DIR" >&2
  exit 1
fi

cd "$FRONTEND_DIR"

if [[ ! -d node_modules ]]; then
  npm install
fi

echo ""
echo "Starting frontend at http://localhost:5173"
echo "Tip: set VITE_SUPPORT_TICKET_API_URL in frontend/.env"
echo ""

npm run dev

