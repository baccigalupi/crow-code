---
name: style-check
description: Run the automated style-check gate
allowed-tools:
  - exec
permissions:
  allow:
    - Exec(agents/style-check)
    - Exec(agents/style-check --all)
    - Exec(agents/style-check --changed)
triggers:
  - user
  - model
---

Run `agents/style-check` to enforce the mechanical style and test conventions on
every file in the codebase.

Use `agents/style-check --changed` to limit the audit to changed, staged, and
untracked files, or `agents/style-check FILE...` to check named files. Any path
may be named — checks for files under `src/` and `tests/` are
verification-blocking; other files get advisory lint that reports but never
fails the run.
