#!/bin/bash
set -e

echo "=== Harness Verification ==="

echo "=== npm run lint ==="
cd medusa-store
npm run lint

echo "=== npm test ==="
npm test

echo "=== npm run build ==="
npm run build

echo "=== Verification Complete ==="
echo ""
echo "Next steps:"
echo "1. Record command and output summary in progress.md"
echo "2. Update feature_list.json for the active feature"
echo "3. Update session-handoff.md with files, blockers, and next step"
