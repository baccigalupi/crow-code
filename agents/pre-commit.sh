#!/usr/bin/env bash
set -euo pipefail

echo "==> Running pre-commit checks..."

echo ""
echo "--> Lint"
deno lint

echo ""
echo "--> Typecheck"
deno check src bin tests agents

echo ""
echo "--> Format check"
deno fmt --check

echo ""
echo "--> Tests with coverage (95% per-file on branches, functions, lines)"
deno test --coverage --allow-env --allow-read --allow-write
deno coverage --lcov --output coverage/lcov.info
bash agents/check-coverage.sh

echo ""
echo "==> All checks passed."
