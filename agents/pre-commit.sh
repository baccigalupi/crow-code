#!/usr/bin/env bash
set -euo pipefail

echo "==> Running pre-commit checks..."

echo ""
echo "--> Typecheck"
npm run typecheck

echo ""
echo "--> Build"
npm run build

echo ""
echo "--> Format check"
npm run format:check

echo ""
echo "--> Tests with coverage (95% per-file on lines, branches, functions)"
npm run coverage
bash agents/check-coverage.sh

echo ""
echo "==> All checks passed."
