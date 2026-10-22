---
name: correct-command
description: >-
  Stop command patterns that fail allowlist matching and force escalation.
  Use when about to prefix with cd, chain with && or ;, run bare deno/bash/sh,
  or invent ad-hoc scripts — especially under pressure after a failure. One
  correct command per Bash call, from the repo root (or a worktree entered
  via EnterWorktree).
---

# Correct command

**Stop before the shell runs.** `.claude/hooks/claude-command-gate.ts` decides
every Bash call deterministically — allow or deny, never a human prompt. It uses
this repo's tested gate logic (`agents/hooks/command-allowed.ts` +
`devin-config.ts` + `block-reason.ts`, backed by `.devin/config.json`, a legacy
directory name) as its single source of truth — there is one allowlist. Under
pressure, agents `cd`, chain commands, run bare `deno`/`bash`/`sh`, or invent
workarounds — none of that matches, the deny carries a rewrite, and retrying the
same shape just repeats the deny.

## The gate is real and terminal

- **Pre-approved** (run without a prompt, per `.devin/config.json`): `dev/*`,
  `agents/*`, `bin/crow`, `bd`, `curl`, `chmod`, `rm`, `deno doc`, `bun install`, and `git mv`.
- **Read-only inspectors are pre-approved too, but checked separately**: `rg`,
  `grep`, `egrep`, `fgrep`, `ls`, `find`, `ps`, `cat`, `head`, `tail`, `sed`,
  `awk`, `wc`, `jq`, `sort`, `uniq`, `stat`, `file`, `tree`, `diff`, `pwd`,
  `echo`, `printf`, `basename`, `dirname`, `realpath`. These aren't in
  `.devin/config.json` at all. This session has no dedicated search tool, so
  Bash is the only way to grep the repo; `claude-command-gate.ts` allows these
  by name with its **own** quote-aware check (track `'...'`/`"..."` state, deny
  only a _live_ `` ` $( < > ; | & `` or newline outside quotes) — not the
  quote-blind check used for allowlisted commands.
- **`git` is otherwise ungated by command text** — any subcommand except `push`
  passes (`git worktree`, `git rebase`, `git reset`, etc. all pass
  mechanically). The restraint on _which_ git operations are appropriate (never
  force-push, never merge onto `main` unprompted, the fixed landing sequence, …)
  is enforced by **instruction** in `AGENTS.md`, not by this gate — `git push`
  is the only one denied outright at this layer.
- **Shell shape is denied outright for everything else, not reviewed**: for any
  command that isn't a read-only inspector, the allowlist check is
  **quote-blind** — any `` ` ``, `$(`, `<`, `>`, `;`, `|`, `&`, or literal
  newline _anywhere in the command text_ fails it, even inside quotes. No
  piping, ever, for `dev/*`/`agents/*`/`git`/etc. The two exceptions:
  `git commit -m "subject" -m "body"` (repeated `-m`, the
  literal-multiline-commit shape) and `git commit -F - <<'EOF' … EOF` (the
  heredoc form) — both scan clean despite their embedded newlines, because the
  gate special-cases exactly these two shapes. A quoted alternation like
  `grep -E "foo|bar"` is fine (quote-aware check); `dev/test "foo|bar"` is not
  (quote-blind check) — don't carry a pipe-containing quoted argument into a
  non-inspector command.
- **DENIED, with no retry path** — rewrite instead: bare `deno` (only `deno doc`
  is approved — use `dev/test`/`dev/lint`/`dev/coverage`/ `agents/typecheck` for
  everything else), `bash`/`sh` (issue the command directly, not wrapped), `cd`
  (see **Worktrees** below), `git push`, anything not named in
  `.devin/config.json`'s allow list or the read-only inspector list above.

`claude-command-gate.ts` has **no fall-through**: a command matching nothing
above is **denied**, not escalated to a permission prompt. The deny reason names
the fix — do not retry a variant of a denied command, run the approved form it
names. If a command is genuinely missing from the gate, the fix is adding it to
`.devin/config.json`'s `permissions.allow`, not working around the deny.

## Worktrees — no `cd`, use `EnterWorktree`

Claude Code's Bash tool has no per-call working-directory parameter — `cd` is
the only shell mechanism to change it, and the gate denies it outright (the
reason text says so explicitly, pointing here since there is no `workdir`
parameter in this harness). The actual fix for "I need to run tests against
files in a worktree" is the **`EnterWorktree`** tool, not `cd`:

1. `EnterWorktree({ name: "<kebab-case-work-description>" })` (never an issue
   ID) — creates `.claude/worktrees/<name>` on a new branch and switches the
   session's effective working directory into it.
   (`.claude/hooks/worktree-path-gate.ts` rejects absolute, `~`-relative,
   `..`-containing, or out-of-tree `path` arguments if you instead re-enter an
   existing worktree by path.)
2. `bd update <id> --claim`.
3. All subsequent `dev/*`/`agents/*`/file-tool calls now naturally target the
   worktree — no absolute paths, no `--config` flags, no `cd`. `dev/test` picks
   up the worktree's own `deno.json` because the session's cwd really is the
   worktree now, not a flag pointed at it from outside.
4. To return to the main checkout for the landing sequence (rebase,
   `git
merge --ff-only`), call **`ExitWorktree({ action: "keep" })`** — this
   leaves the worktree and branch on disk and restores the original cwd. Use
   `action: "remove"` only once the branch is fully merged or the work is
   abandoned.

Why this matters: Deno's config auto-discovery walks up from the process's
actual `cwd`, not from an argument's absolute path. Running
`dev/test /abs/path/to/.worktrees/x/tests/foo.test.ts` from the main checkout
still discovers the **main checkout's** `deno.json` — which excludes
`.worktrees` and `.claude/worktrees` — so the file is filtered out ("No test
modules found") no matter how the path is spelled. There is no flag-only fix;
the session's cwd has to actually be inside the worktree, which is exactly what
`EnterWorktree` does and `cd` cannot do safely here.

## Hard rules (shell)

1. **One command per Bash call** — no `&&`, `;`, subshells, or background `&`,
   for anything. A **live** (unquoted) pipe is also denied everywhere. A
   **quoted** pipe inside a single read-only inspector's own argument (e.g.
   `grep -E "foo|bar"`) is fine — that's a regex alternation, not shell piping —
   but piping one command's _output_ into another (`rg foo | head`) is still
   denied; there's no piped-read-only-inspector exception for that.
2. **No shell loops** — `for`, `while`, `until`, `do`/`done`, `if`/`then`.
   Repeating one command over N inputs is **N Bash calls in ONE message**; they
   run in parallel and finish sooner than a loop would.
3. **No subshells `( )`, command substitution `$( )`/backticks, or redirection
   `>`/`<`/`2>&1`.** Write files with the Write tool, read them with Read. The
   only exceptions are the two commit shapes named above.
4. **No `cd` prefix, ever** — see **Worktrees** above.
5. **No bare `deno`** — `deno doc` is the only exception; everything else has a
   `dev/*`/`agents/*` equivalent.
6. **No ad-hoc `bash -c`/`sh -c`** — issue the real command directly.
7. Don't background `dev/test`, `dev/coverage`, or `agents/pre-commit` — they
   clean the shared `coverage/` directory; a backgrounded
   second run stomps on a foreground one. This check lives in
   `claude-command-gate.ts`, on top of the allowlist.

## Wrong → right

| ❌ Escalation bait                                     | ✅ Correct                                                        |
| ------------------------------------------------------ | ----------------------------------------------------------------- |
| `cd .worktrees/foo && dev/test tests/x.test.ts`        | `EnterWorktree({ name: "foo" })`, then `dev/test tests/x.test.ts` |
| `EnterWorktree({ name: "akj" })` (bare ID postfix)     | `EnterWorktree({ name: "crow-code-akj" })` or `"write-tool"`      |
| `dev/test && agents/typecheck`                         | Two Bash calls: `dev/test` then `agents/typecheck`                |
| `deno test tests/x.test.ts`                            | `dev/test tests/x.test.ts`                                        |
| `deno fmt` / `deno lint --fix`                         | `dev/lint`                                                        |
| `bash agents/pre-commit`                               | `agents/pre-commit`                                               |
| `dev/test path --config /abs/.worktrees/foo/deno.json` | Enter the worktree first, then run `dev/test path` with no flags  |
| `rg foo src/ \| head -20`                              | Not granted here — run `rg foo src/` alone, or two calls          |

## Command table

Run from the repo root, or inside a worktree entered via `EnterWorktree`.

| Task                                         | Command                                               |
| -------------------------------------------- | ----------------------------------------------------- |
| Lint + format (auto-fix) + typecheck         | `dev/lint`                                            |
| Full unit suite with coverage                | `dev/test`                                            |
| One test file                                | `dev/test tests/path/to/file.test.ts`                 |
| Tests with coverage + human-readable summary | `dev/coverage`                                        |
| Typecheck only                               | `agents/typecheck`                                    |
| Format check only (no writes)                | `agents/format-check`                                 |
| Style/test-convention gate                   | `agents/style-check [--changed \| --all \| FILE...]`  |
| Coverage reports (lcov/html)                 | `agents/coverage-report`                              |
| Enforce 95% per-file coverage                | `agents/check-coverage`                               |
| Full pre-commit gate                         | `agents/pre-commit`                                   |
| Install npm dependencies                     | `bun install`                                         |
| Beads ready work / claim / close             | `bd ready`, `bd update <id> --claim`, `bd close <id>` |
| Enter a worktree                             | `EnterWorktree({ name: "<full-id-or-feature>" })`     |
| Leave a worktree (keep it)                   | `ExitWorktree({ action: "keep" })`                    |

## When stuck (do not escalate inventively)

- **Lint/test/typecheck failed:** fix the code, rerun the **same** command — do
  not swap to bare `deno`, raw binaries, or probe scripts.
- **A command you expect to be approved gets denied:** the deny reason names the
  fix — follow it. If the command is genuinely missing from the gate, say so;
  the fix is adding it to `.devin/config.json`, not working around the deny.
- **Need to target a worktree:** `EnterWorktree`, never `cd`, `--config`, or an
  absolute path flag — see **Worktrees** above.
