# Research tools

## Essential (P2)

- `symbols`/`outline` — list functions/classes in a file
- `find_definition` — where a symbol is defined
- `find_references` — all usages of a symbol
- `diagnostics` — errors/warnings per file
- `docs` — fetch library/API documentation
- `web_search`/`web_fetch` — look up docs, errors, and API references that
  aren't local

## Nice-to-have (P3)

- `ast_search` — structural/syntax-aware code search
- `imports` — file dependency graph
- `callers`/`callees` — call-hierarchy queries
- `project_map` — high-level repo structure digest
- `semantic_search` — meaning-based code search when names are unknown

## Symbol storage and retrieval

Symbol-level tools need stored index data — per-call file scanning does not
scale. Three implementation options:

| Implementation | What it is                                                 | Provides                                              |
| -------------- | ---------------------------------------------------------- | ----------------------------------------------------- |
| LSP server     | per-language process queried live                          | definitions, references, diagnostics, call hierarchy  |
| ctags          | flat tag file rebuilt on demand                            | definitions, outline only                             |
| graph index    | persistent symbol/edge database (e.g. codebase-memory-mcp) | definitions, references, callers/callees, project_map |

Several tools below rely on tree-sitter: a parser generator and incremental
parsing library with grammars for ~100 languages. It produces concrete syntax
trees queried with S-expression patterns, and tolerates broken/incomplete code —
suitable for agent-side analysis of in-progress files.
https://tree-sitter.github.io/tree-sitter/

## Tool backing

### `symbols`/`outline`

- Recommended: tree-sitter parse of the single file — no index, no server, one
  dependency
- Other: ctags tag file; LSP `documentSymbol`

### `find_definition`

- Recommended: graph index edge lookup
- Other: LSP `textDocument/definition`; ctags lookup (definitions only, no
  disambiguation)

### `find_references`

- Recommended: graph index edge lookup
- Other: LSP `textDocument/references`; grep fallback is noise-prone and not
  recommended

### `diagnostics`

Structured `{line, col, severity, message, source}` entries.

- Recommended: project-configured lint/typecheck command with structured output
  (`tsc --noEmit`, `eslint -f json`, `cargo check --message-format=json`)
- Other: LSP `textDocument/publishDiagnostics` (requires server)

### `docs`

- Recommended: fetch from package registry docs (JSR, crates.io, pkg.go.dev)
  into a local cache dir (`.crow/docs/<pkg>/<version>/`), then serve via
  existing `read`/`search` tools
- Extraction layer: for `.d.ts` and typed sources, a tree-sitter pass emitting
  `{symbol, signature, doc comment}` entries so the agent queries "docs for
  `createTuiRuntime`" instead of grepping raw files
- Other: external doc-search API

### `web_search`/`web_fetch`

- Recommended: provider search API (Brave, Tavily) behind a configured key;
  `web_fetch` retrieves a URL and converts to text
- Other: self-hosted SearXNG endpoint; defer to `docs` tool when the answer is
  in a cached package

### `ast_search`

- Recommended: tree-sitter query (S-expression patterns) over files from
  `search`/`list`
- Other: semgrep CLI; graph index AST nodes

### `imports`

- Recommended: tree-sitter S-expression queries over import nodes, results
  stored as an edge set
- Node types are not standardized across grammars — one query per language
  (`import_statement` Python, `import_declaration` TS, `use_declaration` Rust),
  ~20 lines each; no shared abstraction
- Forward queries ("what does X import") are cheap per-file — parse on demand,
  no storage
- Reverse/transitive queries ("who imports X") need every file parsed per call
  unless edges are persisted — store the edge set with mtime-based invalidation
  past a size threshold
- Other: LSP has no standard import-graph query — custom analysis either way

### `callers`/`callees`

- Recommended: graph index call edges
- Other: LSP `callHierarchy` (language-dependent coverage)

### `project_map`

- Recommended: graph index aggregated to directory/module level
- Other: generated from `imports` output; tree-sitter walk of top- level
  declarations per file

### `semantic_search`

Answers "where is retry logic" when symbol names are unknown — complements
literal `search`.

Pipeline: chunk each file (by tree-sitter function/class node, or fixed lines
with overlap) → embed chunks → store vectors → at query time embed the query and
return top-k chunks with path/line ranges.

- Recommended: local embedding model (nomic-embed-text, bge-small) via
  onnxruntime — no API key, no per-query cost; vectors in SQLite/Dolt or a flat
  file alongside the repo index
- Other: provider embeddings API (OpenAI `text-embedding-3-small`, Voyage
  `voyage-code-3`) — better quality, needs key + cost; dedicated vector store
  (LanceDB, Qdrant) only if SQLite proves insufficient
- Caveat: stale embeddings after edits — must re-embed on mtime change like
  `imports`; hybrid BM25+vector scoring beats either alone
