# crow-code

This is a CLI based coding agent.

## Exec, scripts and tools

This application is locked down to prevent incorrect exec commands from running.
Devin config at `.devin/config.json` is the source of truth for allowed
commands.

Only the `agents/` and `dev/` scripts listed in `.devin/config.json` can be run.
Never create scripts there to try to circumvent permissions.

### Common commands

- Tests: `dev/test`
- Lint: `dev/lint`
- Coverage: `agents/coverage-report`
- Deno formatting: `agents/format-check`
- TS check: `agents/typecheck`
- Full gate (format, lint, typecheck, tests, coverage): `agents/pre-commit`

### Exec rules

- NEVER use `cd` in exec commands. The exec tool accepts a `workdir` parameter
  for the working directory.
- Commands must not use `&&`, `;`, `|`, `>`, `<`, backticks, or `$(...)`. One
  command per exec call.
- Run only the approved commands above. Do not try `deno`, `npm`, `bash`, etc.

### Gates

- Run `agents/style-check` before finishing TypeScript changes.
  - `agents/style-check [code|tests|both] [changed|all]` — defaults to changed
    files only; use `all` to audit the whole tracked codebase.
- Before finishing a requested task, run `agents/pre-commit`.

## Database conventions

- Table names must be pluralized.
- Tables must use auto-incrementing IDs as their primary keys, not composite
  keys or semantic columns.
- Do not add foreign key constraints.
- Never modify existing migrations; make schema changes with additive
  migrations.

## Git rules

- NEVER commit, stage, or push unless the user explicitly asks
- `git push` is denied to the agent by the exec allowlist
- No `$(...)` or backtick substitution in commit messages. Plain `-m 'text'` or
  a quoted heredoc (`<<'EOF'`) is fine.
- When asked to commit, stage everything `git status` shows — modified and
  untracked — unless the user says to commit only specific work.

## Planning

- Invoke `/planning` whenever creating, researching, or revising a plan.
- Never ask planning questions in chat; record all unknowns in the plan's
  Assumptions table and resolve them through research or mark them as requiring
  a user decision.

## Beads Issue Tracker

This project uses **bd (beads)** for issue tracking. Run `bd prime` to see full
workflow context and commands.

### Quick Reference

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work
bd close <id>         # Complete work
```

### Rules

- Before starting a plan (not a session), `bd create` an issue for it and
  `bd update <id> --claim`
- Close an issue when the user confirms the work is done: `bd close <id>`
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files
- `.beads/*.jsonl` is tracked state — always stage it with the work it records.
  Never leave it behind as "unrelated"
- A rejected or canceled tool call is not a stopping condition — continue
  permitted work (retry canceled siblings individually) without reporting blocks
  to the user.
- Never batch a verification command (dev/test, agents/typecheck) in the same
  parallel block as calls that may be rejected — one rejection cancels the rest.

## Dependency lookup

Core dependencies are indexed as named `codebase-memory-mcp` projects, backed by
checkouts under `.deps/` (gitignored). Indexes persist across sessions in the
daemon store — no reindex needed per session. A `UserPromptSubmit` hook
(`agents/hooks/dependency-lookup-context.ts`) injects the routing summary into
context on dep-flavored prompts.

| Project       | Source                                                       | Pinned to                              | Covers                                  |
| ------------- | ------------------------------------------------------------ | -------------------------------------- | --------------------------------------- |
| `terminal-ui` | `.deps/terminal-ui` (clone of `Ismail-elkorchi/terminal-ui`) | `v0.1.5` = `deno.lock` pin             | All terminal-ui source, tests, examples |
| `deno`        | `.deps/deno` (fetched d.ts files)                            | Deno `v2.9.7` (`cli/tsc/dts/`)         | `Deno.*` namespace + web globals        |
| `deno-std`    | `.deps/std` (clone of `denoland/std`)                        | HEAD — drifts vs `deno.lock` @std pins | All @std packages                       |

### Routing — which project to query

- terminal-ui / TUI components / `defineTui` / `createTuiRuntime` / `textArea` /
  `logViewer` → `terminal-ui`
- `Deno.*` globals, runtime APIs, permissions → `deno`
- `@std/*` imports (`walk`, `assertEquals`, `join`, …) → `deno-std`
- crow-code's own code → `Users-kane-Projects-rho-crow-code`
- The file's imports pick the project: `@ismail-elkorchi/terminal-ui*` →
  `terminal-ui`, `@std/*` → `deno-std`, `Deno.` globals → `deno`

### Query pattern

1. `search_graph(project=..., name_pattern="...")` or `query` for exact lookup;
   `semantic_query=[...]` for discovery when names are unknown.
2. `get_code_snippet(project=..., qualified_name=...)` for the source — use the
   exact `qn` returned by `search_graph`.
3. `trace_path(project=..., function_name=..., direction="both")` for
   callers/callees.
4. "How does crow use X?": run `trace_path`/`search_graph` on the crow-code
   project first to find real call sites, then look up the definition in the dep
   project. (There are no cross-project `CROSS_*` edges —
   `cross-repo-intelligence` only links service calls, verified 0 edges.)
5. Zero hits → fan out `search_graph` across the other dep projects, then fetch
   the exact file via curl: `https://jsr.io/@scope/pkg/<ver>/<path>` (JSR) or
   `https://raw.githubusercontent.com/denoland/std/<rev>/<path>`.

**Verify dep signatures against the graph — never write terminal-ui/Deno code
from memory.** `semantic_query` scores on these niche APIs are weak
(~0.02–0.04); treat low scores as "no match" and switch to
`name_pattern`/`query`.

Note: `.deps/` is gitignored (keeps dep code out of `git status` and crow's own
index) and is in `deno.json`'s `exclude` (keeps `deno test`/`lint`/`fmt`
discovery out of dep test suites) — but file tools CAN read and grep inside it,
so it doubles as a local source fallback alongside `get_code_snippet` and the
curl URLs above.

### Reindexing

- On a `deno.json`/`deno.lock` dep bump:
  `git -C .deps/terminal-ui fetch --depth 1
  origin tag vX.Y.Z`,
  `git -C .deps/terminal-ui checkout vX.Y.Z` — the daemon watcher re-indexes git
  checkouts automatically, or run
  `index_repository(repo_path, name="terminal-ui", mode="full", persistence=true)`.
- `.deps/deno` is not a git repo — after re-fetching d.ts files for a new Deno
  tag, re-run `index_repository(..., name="deno", mode="full")` manually.
- Always use `mode="full"` for dep projects — `moderate`/`fast` skip `*.d.ts`
  and other filtered patterns, which would gut the `deno` index.
