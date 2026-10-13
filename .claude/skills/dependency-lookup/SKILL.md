---
name: dependency-lookup
description: >-
  Look up Deno runtime and @std APIs (and crow-code's own code) in indexed
  dependency graphs instead of guessing signatures. Triggers on: Deno.* API,
  @std imports, Ink/React TUI components, Signal, "which component", "how do
  I draw", dependency API questions.
---

# Dependency lookup

Claude Code port of Devin's `dependency-lookup` skill
(`.devin/skills/dependency-lookup/SKILL.md`) — corrected, not copied verbatim:
that file still pins a project named `exotui` as crow-code's TUI dependency. It
isn't. `CLAUDE.md`'s own Dependency lookup section already flags this: the TUI
(`src/tui/*`) is built on **Ink + React** with **`@preact/signals-core`** for
state; nothing in `src/` or `deno.json`/`deno.lock` references `exotui` or
`terminal-ui`. Don't route TUI questions to either indexed project — there isn't
one. Read `src/tui/*` source directly for TUI questions instead.

Core dependencies are indexed as `codebase-memory-mcp` projects, backed by
checkouts under `.deps/` (gitignored). Verify dependency signatures against the
graph — never write Deno/`@std` API calls from memory.

## Projects

| Project                             | Covers                                            | Source checkout (gitignored, readable) |
| ----------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `deno`                              | `Deno.*` namespace + web globals (v2.9.7 d.ts)    | `.deps/deno`                           |
| `deno-std`                          | All `@std` packages (HEAD; drifts vs `deno.lock`) | `.deps/std`                            |
| `Users-kane-Projects-rho-crow-code` | this codebase                                     | repo root                              |

## Routing

The file's imports pick the project:

- `Deno.` globals, runtime APIs, permissions → `deno`
- `@std/*` imports (`walk`, `assertEquals`, `join`, …) → `deno-std`
- crow-code's own code (including `src/tui/*`) →
  `Users-kane-Projects-rho-crow-code`

## Query loop

1. Exact lookup: `search_graph(project=..., name_pattern="...")` or `query`.
   Discovery: `search_graph(project=..., semantic_query=["..."])` — semantic
   scores on niche APIs run weak (~0.02–0.04); treat a low score as "no match"
   and switch to `name_pattern`.
2. Source: `get_code_snippet(project=..., qualified_name=<exact qn>)` — pass the
   `qn` `search_graph` returned, not a guessed name.
3. Call graph: `trace_path(project=..., function_name=..., direction="both")`.

## "How does crow use X?"

There are no `CROSS_*` edges (service-call linkers only, 0 edges verified). Use
the two-project hop: `search_graph`/`trace_path` on
`Users-kane-Projects-rho-crow-code` first to find real crow call sites — the
best usage examples — then resolve the definition in the dep project.

## Fallbacks

- Zero hits → fan out `search_graph` across the other dep projects in parallel.
- Need a file the graph lacks → `curl https://jsr.io/@scope/pkg/<ver>/<path>`
  (JSR, version-exact) or
  `curl https://raw.githubusercontent.com/denoland/std/<rev>/<path>`.
- `.deps/` checkouts are gitignored but readable — `Read`/`Grep` inside them
  work as a local source fallback when the graph lacks a file.
- No MCP access → the curl fallback above for the exact file, then read it.

## Freshness

Pinned sources: `deno` = v2.9.7 d.ts, `deno-std` = HEAD clone (drifts vs
`deno.lock` @std pins). On a dep bump, re-fetch/re-checkout `.deps/*` and re-run
`index_repository(repo_path, name=<project>, mode="full",
persistence=true)` —
git checkouts (`deno-std`) also self-refresh via the daemon watcher;
`.deps/deno` (fetched d.ts files, not a git repo) needs the manual rerun. Always
`mode="full"` — `moderate`/`fast` skip `*.d.ts` and would gut the `deno` index.
