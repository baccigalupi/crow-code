#!/usr/bin/env bash
set -euo pipefail

echo "==> Running pre-commit checks..."

echo ""
echo "--> Typecheck"
npm run typecheck

echo ""
echo "--> Tests (with coverage)"
npm test

echo ""
echo "--> Format check"
npm run format:check

echo ""
echo "==> All checks passed."
