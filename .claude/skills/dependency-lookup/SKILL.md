---
name: dependency-lookup
description: >-
  Look up Bun runtime APIs (and crow-code's own code) in indexed dependency
  graphs instead of guessing signatures. Triggers on: Bun.* API, bun:test
  imports, Ink/React TUI components, Signal, "which component", "how do I
  draw", dependency API questions.
---

# Dependency lookup

Note on the TUI: the TUI (`src/tui/*`) is built on **Ink + React** with
**`@preact/signals-core`** for state. No indexed dependency project covers it.
Read `src/tui/*` source directly for TUI questions instead.

Bun runtime types are indexed as a `codebase-memory-mcp` project, backed by
`node_modules/bun-types`. Verify dependency signatures against the graph — never
write `Bun.*` API calls from memory.

## Projects

| Project                             | Covers                                     | Source (readable)        |
| ----------------------------------- | ------------------------------------------ | ------------------------ |
| `bun-types`                         | `Bun.*` namespace, `bun:test`, web globals | `node_modules/bun-types` |
| `Users-kane-Projects-rho-crow-code` | this codebase                              | repo root                |

## Routing

The file's imports pick the project:

- `Bun.` globals, `bun:*` imports, runtime APIs → `bun-types`
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
best usage examples — then resolve the definition in `bun-types`.

## Fallbacks

- Zero hits → read the file under `node_modules/bun-types` directly with
  `Read`/`Grep`.
- Need a file the package lacks →
  `curl https://raw.githubusercontent.com/oven-sh/bun/<rev>/<path>`.
- No MCP access → the local read or curl fallback above.

## Freshness

`bun-types` is pinned by `bun.lock` (`@types/bun`). On a bump, run
`bun install`, then
`index_repository(repo_path="node_modules/bun-types", name="bun-types", mode="full", persistence=true)`.
Always `mode="full"` — `moderate`/`fast` skip `*.d.ts` and would gut the index.
