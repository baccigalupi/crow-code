#!/usr/bin/env bash
set -euo pipefail

echo "==> Running pre-commit checks..."

echo ""
echo "--> Format check"
bash agents/format-check

echo ""
echo "--> Lint (read-only)"
deno lint

echo ""
echo "--> Typecheck"
bash agents/typecheck

echo ""
echo "--> Tests with coverage (95% per-file on branches, functions, lines)"
bash dev/test
bash agents/coverage-report
bash agents/check-coverage.sh

echo ""
echo "==> All checks passed."
