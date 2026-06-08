#!/bin/bash
set -e

HARNESS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$HARNESS_DIR/.." && pwd)"

echo "=== Harness Verification ==="

echo "=== npm run lint ==="
cd "$REPO_ROOT/medusa-store"
npm run lint

echo "=== backend unit tests ==="
npm run test:unit --workspace=@dtc/backend

echo "=== npm run build ==="
npm run build

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Record command and output summary in .harness/progress.md"
echo "2. Update .harness/feature_list.json for the active feature"
echo "3. Update .harness/session-handoff.md with files, blockers, and next step"
