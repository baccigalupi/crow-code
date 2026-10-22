# crow-code

This is a CLI based coding agent.

## Exec, scripts and tools

This application is locked down to prevent incorrect exec commands from running.
The allowlist in `.devin/config.json` is the source of truth for allowed
commands; the Claude Code command gate enforces it on every Bash call.

Only the `agents/` and `dev/` scripts listed in `.devin/config.json` can be run.
Never create scripts there to try to circumvent permissions.

### Common commands

- Tests: `dev/test`
- Lint: `dev/lint`
- Coverage: `agents/coverage-report`
- Prettier formatting: `agents/format-check`
- TS check: `agents/typecheck`
- Full gate (format, lint, typecheck, tests, coverage): `agents/pre-commit`

### Exec rules

- NEVER use `cd` in Bash commands. To work in a worktree, use `EnterWorktree`,
  which moves the session's working directory.
- Commands must not use `&&`, `;`, `|`, `>`, `<`, backticks, or `$(...)`. One
  command per Bash call.
- Run only the approved commands above. Do not try `deno`, `npm`, `bash`, etc.
- A rejected or canceled tool call is not a stopping condition — continue
  permitted work (retry canceled siblings individually) without reporting blocks
  to the user.
- Never batch a verification command (dev/test, agents/typecheck) in the same
  parallel block as calls that may be rejected — one rejection cancels the rest.

### Gates

- Run `agents/style-check` before finishing TypeScript changes.
  - `agents/style-check` audits the whole codebase. Narrow it with
    `agents/style-check --changed` (changed/staged/untracked files) or
    `agents/style-check FILE...` (named files; `src/` and `tests/` checks are
    blocking, other paths get advisory lint).
- Before finishing a requested task, run `agents/pre-commit`.

## Database conventions

- Table names must be pluralized.
- Tables must use auto-incrementing IDs as their primary keys, not composite
  keys or semantic columns.
- Do not add foreign key constraints.
- Never modify existing migrations; make schema changes with additive
  migrations.

## Git rules

- NEVER commit, stage, or push unless the user explicitly asks — approval to
  land a plan is that explicit ask (see Worktrees › Landing)
- `git push` is denied to the agent by the exec allowlist
- Commit messages must use the `-F -` heredoc form: `git commit -F - <<'EOF'`
- When asked to commit, stage everything `git status` shows — modified and
  untracked — unless the user says to commit only specific work.

## Worktrees

- All planned work happens in a dedicated git worktree, never directly on the
  main checkout.
- Worktrees live under `.claude/worktrees/` (already gitignored).
- Creating the worktree is the first step of implementing a plan, never part of
  planning: call `EnterWorktree({ name: "<name>" })`, where `<name>` is the
  value recorded in the plan (derived from the Beads issue or feature name). It
  creates the branch and moves the session's working directory into the
  worktree.
- `<name>`/`<branch>` and every reference to an issue in plans and reports is
  the full issue ID (e.g. `crow-code-4vz.2`), the issue title, or a description
  of the feature. Never a bare ID postfix (`4vz`) — it is unreadable.
- Do all subsequent work inside the worktree — file paths and verification
  commands all target it, not the main checkout. `dev/*` and `agents/*` need no
  flags or absolute paths once the session is inside it.

### Landing

Landing is a fixed sequence. Request approval once — "approval to land the work"
— and a granted approval authorizes the entire sequence, including the commit
(it counts as the explicit ask Git rules require):

1. In the worktree, stage everything `git status` shows and commit with
   `git commit -F - <<'EOF'`. `.beads/*.jsonl` will not appear there: `bd` has
   one database in the main checkout and always writes its exports to the main
   checkout's `.beads/`, never the worktree's.
2. `git rebase main` in the worktree, then `ExitWorktree({ action: "keep" })`.
3. `git merge --ff-only <branch>` in the main checkout. If it fails because
   `main` moved, repeat step 2, rerun `agents/pre-commit`, and retry — never
   create a merge commit.
4. `git worktree remove .claude/worktrees/<name>`, then
   `git branch -d <branch>`.
5. `bd close <id>` in the main checkout, then stage `.beads/` and commit it
   there (`Close <issue title>`). `git status` on `main` must end empty.

The work is not landed until `main` points at the branch tip. Never rebase,
merge, or fast-forward onto `main` unprompted.

## Planning

- Invoke `/planning` whenever creating, researching, or revising a plan.
- Never ask planning questions in chat; resolve unknowns through research before
  writing the plan, and record only decisions the user must make in the plan's
  Open decisions table.

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

- When plan implementation begins (never during planning), `bd create` an issue
  for it — unless the plan names an existing issue — and
  `bd update <id> --claim`
- Close the issue as part of landing: `bd close <id>` in the main checkout after
  the merge, then commit `.beads/` there (see Worktrees › Landing)
- Run `bd prime` for detailed command reference and session close protocol
- Use `bd remember` for persistent knowledge — do NOT use MEMORY.md files
- `.beads/*.jsonl` is tracked state, but `bd` always exports it into the main
  checkout, even when run from a worktree. Commit it on `main` as part of
  landing; never leave it behind as "unrelated"

## Dependency lookup

Core dependencies are indexed as named `codebase-memory-mcp` projects. Indexes
persist across sessions in the daemon store — no reindex needed per session. A
`UserPromptSubmit` hook (`agents/hooks/dependency-lookup-context.ts`) injects
the routing summary into context on dep-flavored prompts.

| Project     | Source                   | Pinned to                 | Covers                                     |
| ----------- | ------------------------ | ------------------------- | ------------------------------------------ |
| `bun-types` | `node_modules/bun-types` | `bun.lock` (`@types/bun`) | `Bun.*` namespace, `bun:test`, web globals |

### Routing — which project to query

- `Bun.*` globals, `bun:test`, runtime APIs → `bun-types`
- crow-code's own code → `Users-kane-Projects-rho-crow-code`
- The file's imports pick the project: `bun:*` imports and `Bun.` globals →
  `bun-types`

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
5. Zero hits → fetch the exact file via curl, e.g.
   `https://raw.githubusercontent.com/oven-sh/bun/<rev>/<path>`.

**Verify dep signatures against the graph — never write `Bun.*` code from
memory.** `semantic_query` scores on niche APIs are weak (~0.02–0.04); treat low
scores as "no match" and switch to `name_pattern`/`query`.

Note: file tools can read and grep inside `node_modules/bun-types` directly, so
it doubles as a local source fallback alongside `get_code_snippet`.

### Reindexing

- On a `bun.lock` bump of `@types/bun`/`bun-types`, run
  `index_repository(repo_path="node_modules/bun-types", name="bun-types", mode="full", persistence=true)`.
- Always use `mode="full"` for dep projects — `moderate`/`fast` skip `*.d.ts`
  and other filtered patterns, which would gut the `bun-types` index.
