# Research tools based on tree-sitter

The agent answers structural questions about whatever repository it is working
in — what a file defines, who calls a function, what imports a module — from a
tree-sitter syntax index it builds and maintains itself. The target is any git
repository in any supported language, on a user's machine, with nothing
installed beyond what the agent ships. This project is the first repository the
tools run on (dogfooding); nothing below depends on it.

## How tree-sitter works

- **Grammars.** Each language is a grammar compiled to a parser. Parsers are
  published as C or as `.wasm`; one parser per language.
- **Concrete syntax tree.** Parsing a file yields a tree of typed nodes
  (`function_declaration`, `call_expression`, `import_statement`) with byte and
  row/column ranges. Children are reachable by named fields (`name`,
  `parameters`, `body`), so extracting "the name of this function" is a field
  lookup, not text matching.
- **Error tolerance.** Broken or half-written code still parses; bad regions
  become `ERROR` or `MISSING` nodes and the rest of the tree is intact. This
  matters for an agent reading files mid-edit.
- **Queries.** Patterns are S-expressions matched against the tree, with
  captures and predicates:

  ```scheme
  (function_declaration
    name: (identifier) @definition.function)

  (call_expression
    function: (identifier) @reference.call)

  ((identifier) @constant
    (#match? @constant "^[A-Z_]+$"))
  ```

- **Tags convention.** Most upstream grammars ship a `queries/tags.scm` using
  standard capture names (`@definition.function`, `@definition.class`,
  `@definition.method`, `@reference.call`, `@reference.class`). One extractor
  reads those names across every language.
- **Incremental parsing.** Given an edit (`tree.edit(...)`) the parser reuses
  unchanged subtrees, so reparsing a just-edited file is cheap.
- **No semantics.** Tree-sitter knows syntax, not types or scopes. Resolving a
  call to its declaration, or an import to a file, is separate code layered on
  top, and its answers are best-effort with a stated confidence.

### Runtime

`web-tree-sitter`, the WebAssembly build of tree-sitter, running under Bun's
standard `WebAssembly` API. No native build on the user's machine; one artifact
runs on every platform.

Tested on 2026-10-27 with Bun 1.4.3, `web-tree-sitter` 0.27.1 and
`tree-sitter-typescript` 0.23.2: parsing TypeScript, running the upstream tags
query, and detecting broken code all work, in well under a second.

What the test settled:

- **Load everything from bytes.** `Parser.init({ wasmBinary })` takes the
  runtime's `.wasm` bytes; `Language.load(bytes)` takes a grammar's. Both are
  read with `Bun.file(...).bytes()`, so the library never resolves a path
  itself, and grammars can come from anywhere — bundled, cached or downloaded.
- **Init once, load per language.** `Parser.init` runs once per process;
  `Language.load` once per grammar; one `Parser` per language via
  `setLanguage`.
- **npm grammar packages ship `.wasm`.** `tree-sitter-typescript` contains
  `tree-sitter-typescript.wasm` and `tree-sitter-tsx.wasm`; no build step is
  needed. Bun blocks the package's postinstall (the native binding build),
  which the WASM path never uses.
- **`parse` returns `Tree | null`.** `null` only on cancellation; callers
  handle it explicitly.
- **Broken code still parses.** The tree comes back whole and
  `rootNode.hasError` is `true`; bad regions are `ERROR` / `MISSING` nodes.

### Grammars and query files

- Grammars are loaded dynamically, per language the repository needs (chosen
  by the user, or proposed from the repository's file extensions). Each
  `.wasm` is fetched once from its npm package, pinned to an exact version,
  checksum-verified and cached in the agent's data directory. A manifest of
  known-good (language, grammar version, checksum, query-file version) pairs
  defines what is supported, because each grammar is built for a tree-sitter
  ABI version and `web-tree-sitter` loads only a range of them.
- First languages: TypeScript/TSX, JavaScript, Python, Go, Rust, Java, Ruby.
  Language is chosen by file extension (plus shebang for extensionless
  scripts).
- Query files are small text and ship with the agent for every supported
  language.
- Grammars can extend one another. TypeScript extends JavaScript: the
  JavaScript `tags.scm` runs against the TypeScript grammar unchanged, and
  TypeScript's own `tags.scm` adds only TypeScript constructs (signatures,
  abstract classes, modules, interfaces, type references). Queries for an
  extending grammar are the base file concatenated with its own.
- Concatenated queries can capture the same node twice (TypeScript and
  JavaScript both match `new A()`), so extraction deduplicates captures by
  node range and capture name.
- Captures come back in document order, the whole definition node
  (`@definition.function`) before its `@name`.
- Node types differ per grammar (`import_statement`, `import_declaration`,
  `use_declaration`), so each language gets its own query files — data, not
  code:
  - `tags.scm` — definitions and references (reuse upstream).
  - `imports.scm` — import specifiers.
  - `calls.scm` — call sites with their receiver.
  - `tests.scm` — test cases and their names.
- One import resolver per language family maps specifiers to files: relative
  paths and `index` files for JS/TS (plus `tsconfig` `paths`), packages and
  `__init__.py` for Python, module path from `go.mod` for Go, crate/module
  paths for Rust. Unresolved specifiers become external package rows.
- Adding a language = one `.wasm`, one query directory, optionally one
  resolver. Files with no grammar are still listed, with no symbols.

## Connecting to a repository

The index belongs to the repository the agent is working in, identified by
`applicationData.repositoryRoot`. The agent already resolves it at bootstrap:
`GitRepositoryRoot` (`src/application-data/allowed-paths/repository-root.ts`)
runs `git rev-parse --show-toplevel`, and when git fails (not a repository, git
not installed) logs the failure and falls back to `runtime.cwd`. The indexer
resolves no root of its own.

The same root is the default allowed directory for read permissions, so the
indexed tree and the tree the agent may read start out identical.

Two modes follow from how the root was found:

| Mode  | When                       | File set                                        | Freshness                    |
| ----- | -------------------------- | ----------------------------------------------- | ---------------------------- |
| Git   | `rev-parse` succeeded      | `git ls-files`, tracked + untracked non-ignored | tree sha diff + `git status` |
| Plain | fell back to `runtime.cwd` | directory walk, skip rules only                 | stat pass only               |

Plain mode has no history, so git-derived data (co-change, fix history) is
empty there; syntax tools work the same.

### Initial build

- Triggered on the first syntax-backed tool call in a repository with no index
  (lazy), or by an explicit index command. No background work in a repo the
  user never asks about.
- File set: `git ls-files` plus untracked, non-ignored files
  (`git ls-files --others --exclude-standard`). This respects `.gitignore`
  without reimplementing it.
- Skip by rule: files over a size limit (e.g. 1 MB), minified files (very long
  lines), generated/vendored paths (`node_modules/`, `vendor/`, `dist/`,
  `*.min.js`, lockfiles, `linguist-generated` in `.gitattributes`).
- Parse in batches, commit rows per batch, report progress. A partial index is
  usable; tools say which files are not yet indexed.
- Path permissions: every path is checked against
  `applicationData.readPathPermissions()` before parsing, like the agent's
  other read-only tools; additional allowed directories outside the root are
  not indexed.

### When indexing happens

Two points only:

1. **First syntax-backed tool call** in a working tree with no index. If the
   main checkout has an index, it is copied and the freshness check (below)
   reparses only what differs. Only when the repository has no index anywhere
   does the initial build parse every file.
2. **Freshness check before every query.** The index records the tree sha it
   was built from. Before answering, it diffs that against the current tree
   (`git diff --name-only <recorded tree> HEAD`) and adds uncommitted changes
   (`git status`). Every file that differs is reparsed, then the current tree
   sha is recorded.

The freshness check catches every kind of change the same way — the agent's
own edits, the user's editor, checkouts, merges, rebases — so there is no
separate trigger for agent edits. The index never installs git hooks or writes
into the repository. Every tool response carries the recorded tree sha.

### Worktrees and branches

One index per working tree, each its own database file. A new worktree seeds
its index by copying the main checkout's database; its first freshness check
reparses only the files that differ. Indexes never exchange data with each
other.

Worked example — two worktrees landing in either order:

1. Main's index records tree `T0`.
2. Worktree A is created and copies main's index (recorded `T0`). The agent
   edits `a.ts` in A; A's next query reparses `a.ts` in A's index only. Main's
   index is untouched.
3. Worktree B is created the same way and edits `b.ts`; only B's index
   changes.
4. B lands first; main's checkout moves to tree `T1`. On main's next query its
   index sees recorded `T0` ≠ current `T1`, runs `git diff --name-only T0 T1`,
   gets `b.ts`, reparses it, and records `T1`.
5. A lands second; main moves to `T2`. The `T1`→`T2` diff gives `a.ts` (plus
   any file the merge combined), which is reparsed, and `T2` is recorded.
6. An abandoned worktree's index is only its own database file; none of its
   changes ever reached main's index.

Landing order does not matter because main never imports another worktree's
index: it always reparses whatever differs between the tree it last indexed
and the tree it has now. The cost is that main reparses files a worktree
already parsed.

Open: deleting the database files of removed worktrees.

## Storing the data

### SQLite

One SQLite file per working tree, in the agent's own data directory, keyed by
`applicationData.repositoryRoot` (absolute path). Nothing is written into the user's
repository. It embeds with no install (Bun ships `bun:sqlite`).

- One-hop questions — who imports X, who calls Y — are indexed lookups on
  edge tables.
- Transitive reach (blast radius, call chains) uses `WITH RECURSIVE` queries.
- Graph algorithms (PageRank for "most depended-on files") run in memory over
  edges loaded from SQLite.

### Schema

Rows are extracted facts; trees themselves are never stored (they are cheap to
rebuild and large).

| Table        | Columns (sketch)                                                                              |
| ------------ | --------------------------------------------------------------------------------------------- |
| `index_meta` | repo_root, head_sha, indexed_at, grammar_versions                                             |
| `files`      | path, language, size, mtime, content_hash, parse_errors, indexed_at                           |
| `symbols`    | file_id, parent_symbol_id, name, kind, start_line, end_line, signature, doc_comment, exported |
| `references` | file_id, enclosing_symbol_id, name, kind (call, type, value), line, column                    |
| `imports`    | file_id, specifier, imported_names, resolved_file_id, external_package                        |
| `calls`      | reference_id, callee_symbol_id, resolution, confidence                                        |

- A file's rows are deleted and rewritten together in one transaction on
  reparse; `ON DELETE` cleanup is by `file_id`.
- `references` keeps every captured name; `calls` holds only the resolved
  subset, so unresolved references are still searchable by name.
- Resolution tiers, following repowise: same file (0.95), imported name
  (0.90), same directory/package (0.85), unique name repo-wide (0.50). Tools
  return the tier with each edge and state the basis beside an empty result
  instead of claiming "no callers".
- A grammar or query-file version change invalidates that language's rows.

## Tools

Each tool and its existing issue in the Research tools for agents epic:

| Tool                 | Issue                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------- |
| symbols / outline    | `crow-code-40t.1` symbols/outline tool: list functions/classes in a file               |
| read_symbol          | `crow-code-40t.12.1` read_symbol tool: read one function or class by name              |
| find_definition      | `crow-code-40t.2` find_definition tool: where a symbol is defined                      |
| find_references      | `crow-code-40t.3` find_references tool: all usages of a symbol                         |
| callers / callees    | `crow-code-40t.9` callers/callees tool: call-hierarchy queries                         |
| imports              | `crow-code-40t.8` imports tool: file dependency graph                                  |
| dependents           | `crow-code-40t.12.2` dependents tool: files that transitively depend on a change       |
| related_tests        | `crow-code-40t.12.3` related_tests tool: test files and test cases related to a change |
| project_map          | `crow-code-40t.10` project_map tool: high-level repo structure digest                  |
| ast_search           | `crow-code-40t.7` ast_search tool: structural/syntax-aware code search                 |
| diagnostics (syntax) | `crow-code-40t.4` diagnostics tool: structured errors/warnings per file                |

### symbols / outline

- **Use:** see a file's shape — every class, function and method with its
  signature and line range — before deciding what to read. Replaces reading a
  whole file to find one function.
- **Implementation:** parse the single file (no index needed), run `tags.scm`
  definition captures, nest symbols by range, return name, kind, signature
  (first line of the node up to the body) and lines. Served from `symbols` when
  the file is indexed and fresh.

### read_symbol

- **Use:** read exactly one function or class body by name instead of a whole
  file or a guessed line range.
- **Implementation:** look up `symbols` by `path::Name` (or name alone,
  disambiguated by path), return its source by line range plus its doc comment.

### find_definition

- **Use:** jump from a name seen in code to its declaration.
- **Implementation:** `symbols` lookup by name. With a calling file given,
  rank candidates: same file, then files that file imports, then exported
  symbols elsewhere. Return each candidate with its resolution tier.

### find_references

- **Use:** size a rename or signature change; find every place a function or
  type is used.
- **Implementation:** `references` by name, filtered to files that import the
  defining file (or the defining file itself) for high confidence; remaining
  name matches returned separately as low confidence. Syntax-aware, so
  comments and strings are excluded, unlike text search.

### callers / callees

- **Use:** trace who triggers a behaviour and what a function depends on;
  follow a call chain a few levels.
- **Implementation:** `calls` joined to `symbols`, both directions. Depth
  beyond one uses a recursive CTE, capped, dropping edges below a confidence
  threshold (repowise uses 0.7). Each edge carries its tier.

### imports

- **Use:** what a file depends on, and what depends on it.
- **Implementation:** forward from `imports` for the file; reverse by
  `resolved_file_id`. External packages listed separately.

### dependents (blast radius)

- **Use:** before changing files, list everything that transitively depends on
  them — the code a change could break and the tests likely affected.
- **Implementation:** recursive CTE over reverse imports from the given files,
  with depth per result; test files flagged by language naming conventions
  (`*.test.ts`, `*_test.go`, `test_*.py`, `*Test.java`). Counts are a floor:
  dynamic imports and reflection are invisible to syntax.

### related_tests

- **Use:** for a set of changed files (or symbols), list the test files and
  the individual test cases that exercise them — what to run, and what may
  need updating.
- **Implementation:**
  - Test files are files that import a test framework (`bun:test`, `vitest`,
    `pytest`, Go `testing`, …), from `imports`.
  - A test file is related when it imports a changed file, directly or
    transitively through reverse `imports`, with depth per result.
  - When symbols are given (or derived from the changed line ranges via
    `symbols`), test files are narrowed to those whose `references` name a
    changed symbol.
  - Test cases come from a per-language `tests.scm` query: `describe`/`it`/
    `test` calls in JS/TS, `def test_*` and `Test*` classes in Python,
    `func Test*` in Go, `#[test]` functions in Rust, `@Test` methods in Java.
    Each reference is mapped to its enclosing test case by line range, so
    results name the test (`describe > it` path) and its lines.
  - Each result states its basis (direct import, transitive import, symbol
    reference). Counts are a floor: tests reaching code through dynamic
    imports, fixtures or reflection are invisible to syntax.

### project_map

- **Use:** orient in an unfamiliar repository: directories, what each
  contains, where the entry points and central files are.
- **Implementation:** aggregate `files` and `symbols` by directory (languages,
  file counts, exported symbols); rank files by import in-degree (or PageRank
  in memory); entry points = manifest-declared `main`/`bin` files plus files
  with no importers. Cached per HEAD.

### ast_search

- **Use:** find code by shape rather than text: every `try` without a `catch`,
  every call to `fetch` with two arguments, every class extending a base.
- **Implementation:** take a tree-sitter query and a path glob; select files
  from `files` by language and glob, parse each, run the query, return captures
  with file, lines and the captured text. Validate the query against the
  grammar first and return its error position if invalid.

### diagnostics (syntax)

- **Use:** confirm a file the agent just edited still parses, in any supported
  language, without a project-specific toolchain.
- **Implementation:** walk the tree for `ERROR` and `MISSING` nodes, return
  `{line, column, severity: "error", message, source: "syntax"}`. Type and lint
  errors come from the repository's own checker, outside this layer.

## Planning tools

The five planning tools each draw part of their answer from this index. The
parts that come from git history, decision docs and manifests are not covered
here; this section lists only what tree-sitter supplies.

### `get_overview`

- Languages by file count, from `files`.
- Directory map with the most-imported files per directory, from `imports`
  in-degree (the project_map tool).
- Entry points: files with no importers, from reverse `imports`.

### `get_answer`

- Symbol lookup by name (find_definition) for "where is X" questions.
- Chunk boundaries for later semantic search: one chunk per symbol, taken from
  the line ranges already in `symbols`.

### `get_context`

- Outline: symbols with signatures and line ranges (symbols / outline).
- Imports and importers (imports).
- Callers and callees with resolution tier (callers / callees).
- For a `path::Symbol` target, the symbol's own source (read_symbol).

### `get_why`

- `WHY:` / `DECISION:` / `REJECTED:` / `RATIONALE:` markers are matched only
  inside `comment` nodes, so the same text in a string or identifier is not a
  marker, and comment syntax needs no per-language regex.
- Each marker is scoped to its file and to its enclosing symbol, from
  `symbols` line ranges.

### `get_risk`

- Dependents: reverse imports of the changed files (dependents), reported as a
  floor.
- Tests related to the changed files, with test case names (related_tests).

## Order

1. Parser, grammar manifest and loader, single-file parse; symbols/outline
   and read_symbol (no index).
2. Syntax diagnostics (still per file).
3. Index: schema, initial build, freshness check.
4. imports, dependents, related_tests.
5. find_definition, find_references, callers/callees.
6. project_map, ast_search.
7. More grammars and resolvers.

## Sources

- [tree-sitter](https://tree-sitter.github.io/tree-sitter/)
- [web-tree-sitter](https://npmjs.com/package/web-tree-sitter)
- [repowise GRAPH.md](https://github.com/repowise-dev/repowise/blob/main/docs/layers/GRAPH.md)
