---
name: dependency-lookup
allowed-tools:
  - read
  - grep
  - glob
  - exec
  - mcp__codebase-memory-mcp__*
triggers:
  - model
description: Look up exotui, Deno runtime, and @std APIs in indexed dependency graphs instead of guessing signatures. Triggers on: exotui, TUI component, Signal, TextBox, LogViewer, TerminalApp, Deno.* API, @std imports, "which component", "how do I draw", dependency API questions.
---

# Dependency Lookup

crow-code's core dependencies are indexed as `codebase-memory-mcp` projects.
Verify dependency signatures against the graph — never write exotui/Deno code
from memory.

## Projects

| Project                             | Covers                                            | Source checkout (gitignored, readable) |
| ----------------------------------- | ------------------------------------------------- | -------------------------------------- |
| `exotui`                            | exotui v0.8.1 source + tests + examples           | `.deps/exotui`                         |
| `deno`                              | `Deno.*` namespace + web globals (v2.9.7 d.ts)    | `.deps/deno`                           |
| `deno-std`                          | All `@std` packages (HEAD; drifts vs `deno.lock`) | `.deps/std`                            |
| `Users-kane-Projects-rho-crow-code` | this codebase                                     | repo root                              |

## Routing

The file's imports pick the project:

- `@ubernaut/exotui/*`, TUI components, `Signal`, `App`, `Computed` → `exotui`
- `Deno.` globals, runtime APIs, permissions → `deno`
- `@std/*` imports (`walk`, `assertEquals`, `join`, …) → `deno-std`
- crow's own code → `Users-kane-Projects-rho-crow-code`

## Query loop

1. Exact lookup: `search_graph(project=..., name_pattern="...")` or `query`.
   Discovery: `search_graph(project=..., semantic_query=["..."])` — semantic
   scores on these niche APIs are weak (~0.02–0.04); treat low scores as "no
   match" and switch to `name_pattern`.
2. Source: `get_code_snippet(project=..., qualified_name=<exact qn>)` — pass the
   `qn` from `search_graph`, not a guessed name.
3. Call graph: `trace_path(project=..., function_name=..., direction="both")`.

## "How does crow use X?"

There are no `CROSS_*` edges (service-call linkers only). Use the two-project
hop: `search_graph`/`trace_path` on `Users-kane-Projects-rho-crow-code` to find
real crow call sites first — they are the best usage examples — then resolve the
definition in the dep project.

## Fallbacks

- Zero hits → fan out `search_graph` across the other dep projects in parallel.
- Need a file the graph lacks → `curl https://jsr.io/@scope/pkg/<ver>/<path>`
  (version-exact) or
  `curl https://raw.githubusercontent.com/<owner>/<repo>/<rev>/<path>`.
- `.deps/` checkouts are gitignored but readable — `read`/`grep` inside them
  work as a local source fallback when the graph lacks a file.
- No MCP access → JSR/GitHub curl for the exact file, then read it.

## Freshness

Pinned sources: `exotui` = `deno.lock` pin (v0.8.1), `deno` = v2.9.7, `deno-std`
= HEAD clone. On dep bumps, re-checkout `.deps/*` and re-run
`index_repository(repo_path, name=<project>, mode="full", persistence=true)`
(git checkouts also self-refresh via the daemon watcher). Always `mode="full"` —
`moderate`/`fast` skip `*.d.ts`.
