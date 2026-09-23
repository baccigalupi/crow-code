# Commands that are all wrong

## Escalating

```
ls /Users/kane/.devin/plans/plan-231073051466bb47.md
```

```
ls "/Applications/Devin.app/Contents/Resources/app/extensions/windsurf/devin/share/devin/docs" 2>/dev/null || ls /Applications/Devin.app/Contents/Resources/app/extensions/windsurf/devin/share 2>/dev/null
```

```
cd /Users/kane/Projects/rho/crow-code && ls agents/scripts agents/hooks 2>/dev/null; cat agents/typecheck agents/pre-commit.sh 2>/dev/null
```

```
ls /Users/kane/.devin/plans/ 2>/dev/null; echo '---'; ls /Users/kane/Projects/rho/crow-code/agents /Users/kane/Projects/rho/crow-code/src/tools /Users/kane/Projects/rho/crow-code/src/cli 2>/dev/null
```

```
git add docs/fucked-commands.md src/cli.ts src/cli/cli.ts src/cli/commands/help.ts tests/cli.test.ts tests/cli/commands/help.test.ts && git commit -m "$(cat <<'EOF'
Move CLI usage into help command
 
Keep user-facing command guidance owned by Help and verify its stable output without coupling tests to the full command list.
 
Generated with [Devin](https://devin.ai)
 
Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

```
it commit src/api-request.ts src/cli.ts src/cli/subcommands.ts src/model-info/catalog/build-model-catalog.ts src/model-info/catalog/providers/fetch-provider.ts src/model-info/catalog/providers/fetch-providers.ts src/model-info/catalog/providers/nous.ts src/model-info/catalog/providers/ollama.ts src/model-info/catalog/providers/openrouter.ts src/model-info/nous2/get-nous-models.ts src/model-info/types.ts src/plan/goals/request.ts src/tools/git-commit/commit.ts src/tools/git-commit/current-diff.ts src/tools/git-commit/request.ts src/types.ts tests/cli.test.ts tests/tools/git-commit/commit.test.ts tests/tools/git-commit/current-diff.test.ts tests/tools/git-commit/request.test.ts -m "$(cat <<'EOF'
Centralize shared CLI dependency types
 
Keep shared dependency contracts explicit and independent from their concrete implementations.
 
Generated with [Devin](https://devin.ai)
 
Co-Authored-By: Devin <158243242+devin-ai-integration[bot]@users.noreply.github.com>
EOF
)"
```

```
find /Users/kane/.config/devin /Users/kane/.devin /Users/kane/Projects -maxdepth 4 \( -path "*/rules/*.md" -o -name "SKILL.md" \) 2>/dev/null | head -30
```

```
ls /Users/kane/Projects/rho; echo "---"; find /Users/kane/Projects/rho -maxdepth 4 -path "*.devin*" -not -path "*/node_modules/*" 2>/dev/null | head -40
```

## Crashes

```
set -euo pipefail tmpdir=$(mktemp -d)
mkdir -p "$tmpdir/.devin" cp tests/support/fixtures/devin-config.json
"$tmpdir/.devin/config.json"

payload='{"tool_name":"exec","tool_input":{"command":"git commit -m
\"subject\n\nbody\""}}' echo "$payload" | DEVIN_PROJECT_DIR="$tmpdir" deno run
--allow-env --allow-read agents/block-random-execs.ts || true

payload='{"tool_name":"exec","tool_input":{"command":"git commit -m \"$(cat
<<'\''EOF'\''\nbody\nEOF\n)\""}}' echo "$payload" | DEVIN_PROJECT_DIR="$tmpdir"
deno run --allow-env --allow-read agents/block-random-execs.ts || true

rm -rf "$tmpdir"
```

```
echo '{"tool_name":"exec","tool_input":{"command":"git commit -m
\"subject\n\nbody\""}}' | DEVIN_PROJECT_DIR=/Users/kane/Projects/rho/crow-code
deno run --allow-env --allow-read agents/block-random-execs.ts Permission denied
for this tool by a deny rule in the project settings.
```

```
deno fmt
```

## Other problems

`cd /Users/kane/Projects/rho/crow-code && <other-command>` now works

For example:
`cd /Users/kane/Projects/rho/crow-code && git diff HEAD -- agents/hooks/command-allowed.ts dev/test && git diff --cached -- .beads/issues.jsonl | head -30`

```
```
