---
name: land-tree
description: >-
  Land the current worktree's branch on main by fast-forward merge, then close
  its Beads issue (and any parents left with no open children) on main and
  commit .beads/ there. Use when asked to land,
  merge, or finish the work in a worktree.
---

# Land tree

Run from inside the worktree entered via `EnterWorktree`. One command per Bash
call (see `correct-command`).

In every report to the user, name the issue by title or full ID, and the
worktree by its full name. Never a bare ID postfix.

## Beads lives on main

`bd` has one database, in the main checkout's `.beads/embeddeddolt`. Every `bd`
command, even one run inside a worktree, re-exports `.beads/issues.jsonl` and
`.beads/interactions.jsonl` into the **main checkout's** working tree. The
worktree's copies never change, so beads changes cannot travel with the branch.
Do not run `bd close` in the worktree and expect it to be committed there. Close
the issue and any finished parents on main and commit `.beads/` on main (steps
6-8).

## Sequence

1. **Settle the tree.** `git status --short`. If there is uncommitted work, run
   `agents/pre-commit`, fix anything red and rerun until it passes, then commit
   it with `git commit -F - <<'EOF' … EOF`. If the tree is clean, check it with
   `agents/pre-commit` anyway.
2. **Rebase.** `git rebase main`. On conflict, resolve it yourself: read each
   conflicted file, keep what `main` changed and what the branch intended,
   `git add` the file, and `git rebase --continue`. Never stop to ask. If the
   rebase pulled in new commits from `main`, rerun `agents/pre-commit`.
3. **Leave the worktree.** `ExitWorktree({ action: "keep" })`.
4. **Fast-forward merge.** `git merge --ff-only <branch>` in the main checkout.
   Never a merge commit. If `main` moved, re-enter the worktree and repeat from
   step 2.
5. **Clean up.** `git worktree remove .claude/worktrees/<name>`, then
   `git branch -d <branch>`.
6. **Close the issue on main.** `bd close <full-issue-id>`.
7. **Close finished parents.** `bd show <full-issue-id>` and read its parent. If
   there is one, `bd show <parent-id>`: when every child is complete (it reports
   "eligible for close"), `bd close <parent-id>`. Then repeat for that parent's
   own parent, until a parent still has open children or there is no parent.
   Report each parent closed by title. A parent with open children stays open.
8. **Commit `.beads/` on main.** `git add .beads`, then commit with a message
   naming the issue by title, e.g. `Close <issue title>`; when parents were
   closed, name them too. `.beads/` may also hold earlier claims, retitles, and
   closes; they are committed together.
9. **Verify.** `git status --short` on main must be empty. If anything remains,
   report it; never report the work as landed with a dirty main.

If the work is abandoned instead of landed, leave the issue open and run
`ExitWorktree({ action: "remove" })`.
