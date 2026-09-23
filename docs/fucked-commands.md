# Commands that are all wrong

## Escalating

```
ls /Users/kane/.devin/plans/plan-231073051466bb47.md
```

```
ls "/Applications/Devin.app/Contents/Resources/app/extensions/windsurf/devin/share/devin/docs" 2>/dev/null || ls /Applications/Devin.app/Contents/Resources/app/extensions/windsurf/devin/share 2>/dev/null
``

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
deno fmt
```

## Other problems

`cd /Users/kane/Projects/rho/crow-code && <other-command>` now works

For example:
`cd /Users/kane/Projects/rho/crow-code && git diff HEAD -- agents/hooks/command-allowed.ts dev/test && git diff --cached -- .beads/issues.jsonl | head -30`
