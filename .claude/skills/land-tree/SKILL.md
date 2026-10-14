---
name: land-tree
description: >-
  Land the current worktree's branch on main by fast-forward merge, closing its
  Beads issue first so .beads/ changes travel with the work. Use when asked to
  land, merge, or finish the work in a worktree.
---

# Land tree

Run from inside the worktree entered via `EnterWorktree`. One command per Bash
call (see `correct-command`).

In every report to the user, name the issue by title or full ID, and the
worktree by its full name. Never a bare ID postfix.

## Sequence

1. **Settle the tree.** `git status --short`. If there is uncommitted work, run
   `agents/pre-commit`, fix anything red and rerun until it passes, then commit
   it with `git commit -F - <<'EOF' … EOF`. If the tree is clean, check it with
   `agents/pre-commit` anyway.
2. **Close the issue in the worktree.** `bd close <full-issue-id>`. Closing
   before the merge keeps `.beads/*.jsonl` changes on the branch with the work
   instead of dirtying the main checkout afterwards.
3. **Commit `.beads/` with the work.** Amend it into the last commit
   (`git add .beads`, then `git commit --amend --no-edit`), or make a small
   separate commit. Nothing may remain in `git status`.
4. **Rebase.** `git rebase main`. On conflict, stop and report the files. If the
   rebase pulled in new commits from `main`, rerun `agents/pre-commit`.
5. **Leave the worktree.** `ExitWorktree({ action: "keep" })`.
6. **Fast-forward merge.** `git merge --ff-only <branch>` in the main checkout.
   Never a merge commit. If `main` moved, re-enter the worktree and repeat from
   step 4.
7. **Clean up.** `git worktree remove .claude/worktrees/<name>`, then
   `git branch -d <branch>`.

If the work is abandoned instead of landed, leave the issue open and run
`ExitWorktree({ action: "remove" })`.
