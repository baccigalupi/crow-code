---
name: commit
description: >-
  Run the full pre-commit gate, then commit the current changes. Use when asked
  to commit.
---

# Commit

One command per Bash call (see `correct-command`).

1. Run `agents/pre-commit`. If anything fails, fix it and rerun until it passes.
   Don't run it in the background.
2. `git status --short` to see what will be committed, then stage the changes
   with `git add`.
3. Commit with `git commit -F - <<'EOF' … EOF`: a short subject line, a blank
   line, then a body explaining why.
