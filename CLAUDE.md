# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with
code in this repository.

## What this is

`crow` — a CLI-based coding agent, written in TypeScript on Deno. Entry point:
`bin/crow` → `src/cli.ts`.

## Commands

```
dev/lint               # deno lint --fix, deno fmt, then agents/typecheck
dev/test [args]        # deno test with coverage (--allow-env --allow-read --allow-write --allow-ffi --allow-run --allow-sys=hostname); args forward to deno test
dev/coverage [args]    # dev/test, then lcov export + human-readable coverage summary
agents/typecheck       # TS check only
agents/format-check    # deno fmt check only
agents/style-check [--changed | --all | FILE...]   # style/test-convention audit (src/, tests/ blocking; other paths advisory)
agents/coverage-report # generate lcov/html coverage reports
agents/check-coverage  # enforce 95% per-file coverage on branches/functions/lines
agents/pre-commit      # full gate: format-check, lint, typecheck, style-check, test, coverage-report, check-coverage
```

Run a single test file: `dev/test tests/path/to/file.test.ts`. Tests use
`node:test` (`describe`/`it`), `@std/expect`, and `@std/testing/mock`
(`spy`/`stub`/`returnsNext`).

### Execution restrictions (this environment)

This repo is locked down to an allowlist of safe commands in
`.devin/config.json`. **For Claude Code specifically**, that same allowlist is
enforced live by `.claude/settings.json` +
`.claude/hooks/claude-command-gate.ts`, which decides every Bash call
deterministically (allow or deny, never a prompt) by calling the existing,
tested Devin gate (`agents/hooks/command-allowed.ts` + `devin-config.ts` +
`block-reason.ts`) against `.devin/config.json` — one allowlist, not two that
can drift — see `.claude/skills/correct-command/SKILL.md` for the full command
table and wrong→right rewrites. In short: only `dev/*`, `agents/*`, `bin/crow`,
`bd`, `curl`, `chmod`, `rm`, `git mv`, any `git` subcommand except `push`, and
`deno doc` are permitted — never bare `deno`, `bash`, `sh`, or `cd`. Any shell
metacharacter (`` ` ``, `$(`, `<`, `>`, `;`, `|`, `&`, literal newline) anywhere
in the command denies it outright — there is no piping, even between two
read-only inspectors — except the two commit shapes: repeated `-m` flags, or
`git commit -F - <<'EOF' ... EOF`.

**No `cd`, no `--config` flags, no absolute-path workarounds for targeting a
worktree.** The Claude Code Bash tool has no `workdir` parameter, so `cd` is the
_only_ shell-level way to change it — which is exactly why it's denied. Deno's
config auto-discovery walks up from the process's actual `cwd`, not from a file
argument's path, so running `dev/test` against an absolute path into a worktree
from the main checkout still picks up the main checkout's `deno.json` (which
excludes worktree directories) and silently finds nothing. The actual fix is the
`EnterWorktree` tool, which creates `.claude/worktrees/<name>` and switches the
session's real cwd into it — then `dev/test`, `agents/*`, and file paths all
just work, unprefixed. Use `ExitWorktree({ action: "keep" })` to return to the
main checkout for the landing sequence. This supersedes AGENTS.md's manual
`git worktree add .worktrees/<name>` instructions when operating as Claude Code
— that flow is written for an exec tool with a real `workdir` parameter, which
this harness's Bash tool doesn't have.

Before finishing any TypeScript change, run `agents/style-check` (narrow with
`--changed` or explicit files). Before finishing any requested task, run
`agents/pre-commit`.

## TDD

Strict red-green: write the failing test first (`dev/test`, watch it fail),
implement the minimal code in `src/`, then `dev/test` again (watch it pass),
then refactor.

## Architecture

### Operation pattern

Most business logic is a subclass of `Operation`/`OperationWithResult`
(`src/operation.ts`): constructed with
`{ applicationData, operationArguments }`, exposes `run()` →
`Promise<AsyncOperation>`, `success()`, and (for `OperationWithResult`)
`result()`. An operation can run nested work via
`this.runSubOperation(childOperation)`, which short-circuits once `succeeded` is
false and propagates the first failure's `reason`. CLI commands
(`src/cli/commands/*`, extending `Command` in `src/cli/commands/command.ts`),
and most of `src/domain/*`, `src/tasks/*`, and `src/application-data/*` builders
follow this shape. `SubOperations` (`src/application-data/sub-operations.ts`) is
a standalone helper used by `ApplicationDataBuilder` for the same
run/fail/report-reasons flow outside the `Operation` class hierarchy.

### AppData / bootstrap

`ApplicationDataBuilder` (`src/application-data/builder.ts`) assembles the
`AppData` object (`src/application-data/app-data.ts`) that nearly everything
else depends on: parses Deno args/env (`DenoRuntime`), loads config,
opens+migrates the SQLite database (`verifyDatabase` /
`openAndMigrateDatabase`), resolves the git repository root, and wires up `Io`
(console, fetch, logger). Each step runs through `subOperations.run(...)` so a
failure anywhere is recorded with a human-readable action string and reported
via `consoleError()` without aborting the remaining setup steps. `AppData` uses
two class decorators from `src/decorators.ts`:

- `@delegate(members, attribute)` — forwards named methods to an underlying
  collaborator (e.g. `AppData#args()` forwards to `denoRuntime.args()`;
  `AppData#logger()` forwards to `io.logger()`).
- `@memoize` — caches a zero-arg method's result per-instance (used for
  `database()`, `pathPermissions()`, `gitPathPermissions()`).

`AppData#withDatabase(db)` returns a prototype-chained clone with a fixed
`database()` — used to inject a test/alternate database without mutating the
original instance.

### CLI commands

`src/cli.ts` lists the available `Command` subclasses (`src/cli/commands/*`) and
runs the first one whose `isMatch()` returns true against the parsed arguments.
Each command is an `Operation<ParsedArguments>`; on failure it logs via
`reportFailure()`/`failureMessage()`, falling back to a humanized class name
when no explicit command text is available.

### Domain layer

`src/domain/*` holds the data model for providers/models/availability
(`providers`, `models`, `availabilties`) and the knex-backed
`database-query.ts`/`create.ts` helpers they're built from.
`src/domain/parsers/*` and `src/domain/models/parse-params.ts` normalize CLI
filter params (e.g. cost/reasoning filters in `src/domain/models/filters/*`)
into query-ready keys.

### Database

`src/database/open-and-migrate-database.ts` opens the SQLite DB (via
`better-sqlite3`/`knex`) and runs pending migrations from
`src/database/migrations/`. Convention (see `AGENTS.md`): table names are
pluralized, auto-incrementing integer PKs only (no composite/semantic keys), no
FK constraints, and existing migrations are never modified — schema changes are
always additive new migration files.

### Model requests / discovery

`src/model-requests/framework/*` is the shared request pipeline (`runner.ts`,
`openai-request.ts`, `model-api-request.ts`, `request-parser.ts`,
`request-logger.ts`, `model-request-error-handler.ts`) that other request types
(e.g. `commit-message.ts`) build on, using `AppData#chatClient()` (a configured
`OpenAI` client). `src/model-discovery/populate/*` fetches and normalizes model
catalogs from multiple providers (`nous`, `ollama`, `openrouter`), each with its
own `get-*-models.ts` fetcher + `parser.ts`, merged by `populate-models.ts` /
`save-catalog-models.ts`.

### Tools

`src/tools/*` implements the agent's file and git tools (read-only: `read`,
`list`, `search`, `find`, git `log`/`blame`/`diff`/`show`; mutating: file
`edit`/`mkdir`, git `add`/`commit`). All path-taking tools are checked against
`AppData#pathPermissions()`/`gitPathPermissions()`
(`src/application-data/path-permissions.ts`) before touching the filesystem —
permissions are resolved against allowed directories (default: cwd) and cached
per-path.

### TUI

`src/tui/*` is an Ink/React (`react-jsx`) terminal UI. `app/` is the main chat
REPL (view-models in `*-view-model.ts` paired with `.tsx` views,
`interactions/state/chat-session.ts` for session state, `interactions/keymap.ts`
for key bindings); `install/` is the first-run config wizard with an analogous
view-model/view/interaction split. State uses `@preact/signals-core` (see
`use-signal-value.ts`).

## Style gates

`agents/style-checks/*` are custom `deno lint` plugins enforcing
project-specific conventions beyond standard lint — notably `void-guard-calls`
(flags guard-shaped `if` statements that return a void/Promise<void> call, since
the return value communicates nothing). Run through `agents/style-check`, which
classifies files by path (`src/**/*.ts(x)` = code, `tests/**/*.test.ts(x)` =
test, other `tests/**/*.ts(x)` = support) to decide which checks are blocking
vs. advisory.

## Git / worktree / issue workflow

See `AGENTS.md` for the full, authoritative rules (written for an exec tool with
a `workdir` parameter) — summary, with the Claude Code-specific worktree
mechanism called out:

- Never commit/stage/push without explicit user ask; commit messages via
  `git commit -F - <<'EOF'` heredoc.
- All planned work happens in a dedicated worktree, created as the first step of
  implementation (not planning). **As Claude Code**, use
  `EnterWorktree({ name: "<id>" })` — not
  `git worktree add .worktrees/<name> -b <branch>` — so the session's actual cwd
  moves into `.claude/worktrees/<name>` (gitignored, excluded from `deno.json`)
  and `dev/*`/`agents/*` resolve the worktree's own `deno.json` with no flags or
  absolute paths. See `.claude/skills/correct-command/SKILL.md` § Worktrees for
  why `cd`/`--config` don't work here.
- Landing is a fixed, approval-gated sequence: commit in the worktree →
  `git rebase main` → `ExitWorktree({ action: "keep" })` back to the main
  checkout → `git merge --ff-only <branch>` → `bd close <id>` →
  `ExitWorktree({ action: "remove" })` (or re-enter and remove) once merged.
- Issues are tracked with **bd (beads)**: `bd ready`, `bd show <id>`,
  `bd update <id> --claim`, `bd close <id>`; run `bd prime` for full context.
  `.beads/*.jsonl` is tracked state — always stage it with the work it records.

## Command gate (Claude Code)

`.claude/settings.json` + `.claude/hooks/*.ts` turn the allowlist above into a
live, deterministic PreToolUse decision on every Bash call — allow or deny,
never a permission prompt (idea modeled on a hook system from a sibling project,
adapted to reuse what this repo already had). `claude-command-gate.ts` is the
decision hook; it reuses the existing, tested Devin gate
(`agents/hooks/command-allowed.ts` + `devin-config.ts` + `block-reason.ts`,
backed by `.devin/config.json`) as the single source of truth, so there's one
allowlist, not two that can drift — it only patches the one Devin-specific
wording (`workdir` parameter → `EnterWorktree`) and adds a Claude-only check
(deny backgrounding `dev/test`/`dev/coverage`/`agents/pre-commit`, which would
stomp the shared `coverage/` directory). `worktree-path-gate.ts` (decision logic
in `worktree-path-decision.ts`) separately validates `EnterWorktree`'s `path`
argument. Tests: `tests/claude-hooks/*.test.ts`. A deny always names the exact
command to run instead; don't retry a variant of a denied command. Full command
table and wrong→right rewrites: `.claude/skills/correct-command/SKILL.md`.

## Dependency lookup (codebase-memory-mcp)

Core deps (`deno`, `deno-std`) are indexed as named `codebase-memory-mcp`
projects backed by checkouts under `.deps/` (gitignored, excluded from
`deno.json`). Verify dependency signatures against the graph
(`search_graph`/`get_code_snippet`/`trace_path`) rather than writing Deno API
calls from memory — see `AGENTS.md` § Dependency lookup for the query pattern.

`AGENTS.md`'s dependency-lookup table also lists a `terminal-ui` project
(`.deps/terminal-ui`, pinned to `Ismail-elkorchi/terminal-ui`) — that checkout
is stale. The TUI (`src/tui/*`) is actually built on **Ink + React**, with
**`@preact/signals-core`** for state (see the TUI section above and
`deno.json`'s `imports`); nothing in `src/` or `deno.json`/`deno.lock`
references `terminal-ui`. Don't route TUI questions there.
