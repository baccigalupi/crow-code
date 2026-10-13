---
name: style-check
description: >-
  Run the automated style-check gate. Use before finishing any TypeScript
  change, or whenever asked to check style/test conventions.
---

# Style check

Claude Code port of Devin's `style-check` skill
(`.devin/skills/style-check/SKILL.md`). Devin's version also declared
`permissions.allow` entries for the three `agents/style-check` invocations — not
needed here: `.claude/hooks/claude-command-gate.ts` already allows
`agents/style-check` (and its `--changed`/`--all`/`FILE...` forms) by reusing
the same `.devin/config.json` allowlist, so there's nothing extra to grant.

Run `agents/style-check` to enforce the mechanical style and test conventions on
every file in the codebase.

Use `agents/style-check --changed` to limit the audit to changed, staged, and
untracked files, or `agents/style-check FILE...` to check named files. Any path
may be named — checks for files under `src/` and `tests/` are
verification-blocking; other files get advisory lint that reports but never
fails the run.
