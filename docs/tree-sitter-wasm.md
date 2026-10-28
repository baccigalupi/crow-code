# tree-sitter WASM under Bun

`web-tree-sitter` runs under Bun with no browser and no native build. "Web"
only means it is the WebAssembly build of tree-sitter; Bun provides the
standard `WebAssembly` API it needs.

## Tested

The three examples below were run as `bun:test` tests on 2026-10-27 — 3 pass,
0 fail, about 230 ms total.

| Component                | Version                                 |
| ------------------------ | --------------------------------------- |
| Bun                      | 1.4.3                                   |
| `web-tree-sitter`        | 0.27.1                                  |
| `tree-sitter-typescript` | 0.23.2                                  |
| `tree-sitter-javascript` | installed with `tree-sitter-typescript` |

## Setup

```sh
bun install web-tree-sitter tree-sitter-typescript
```

Both packages ship their `.wasm` files in npm:

| File                                                              | What it is                   |
| ----------------------------------------------------------------- | ---------------------------- |
| `node_modules/web-tree-sitter/web-tree-sitter.wasm`               | the tree-sitter runtime      |
| `node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm` | TypeScript grammar           |
| `node_modules/tree-sitter-typescript/tree-sitter-tsx.wasm`        | TSX grammar                  |
| `node_modules/tree-sitter-typescript/queries/tags.scm`            | TypeScript-only tag patterns |
| `node_modules/tree-sitter-javascript/queries/tags.scm`            | JavaScript tag patterns      |

Bun blocks the grammar package's postinstall script, which builds the native
binding. The WASM path does not need it.

## Loading from bytes

Both the runtime and each grammar are loaded from bytes read with `Bun.file`,
never from a path the library resolves itself. This avoids runtime-specific
path lookup, and it is what allows grammars to be downloaded and loaded at
runtime: any `Uint8Array` works.

- `Parser.init({ wasmBinary })` loads the runtime once per process.
- `Language.load(bytes)` loads one grammar; call it per language.

## Parse TypeScript

```ts
import { Language, Parser } from 'web-tree-sitter'

await Parser.init({
  wasmBinary: await Bun.file(
    'node_modules/web-tree-sitter/web-tree-sitter.wasm',
  ).bytes(),
})
const parser = new Parser()
parser.setLanguage(
  await Language.load(
    await Bun.file(
      'node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm',
    ).bytes(),
  ),
)

const tree = parser.parse('class Crow {}')

tree!.rootNode.firstChild!.type // "class_declaration"
```

`parse` returns `Tree | null`; `null` only when parsing is cancelled.

## Run the tags query

```ts
import { Language, Parser, Query } from 'web-tree-sitter'

await Parser.init({
  wasmBinary: await Bun.file(
    'node_modules/web-tree-sitter/web-tree-sitter.wasm',
  ).bytes(),
})
const typescript = await Language.load(
  await Bun.file(
    'node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm',
  ).bytes(),
)
const parser = new Parser()
parser.setLanguage(typescript)
const tree = parser.parse('function fly() {}')
const query = new Query(
  typescript,
  await Bun.file('node_modules/tree-sitter-javascript/queries/tags.scm').text(),
)

const captures = query.captures(tree!.rootNode)

captures[0]!.name // "definition.function"
captures[1]!.name // "name"
captures[1]!.node.text // "fly"
```

- The TypeScript grammar extends the JavaScript one, so the JavaScript
  `tags.scm` runs against it unchanged. TypeScript's own `tags.scm` only adds
  TypeScript constructs (function and method signatures, abstract classes,
  modules, interfaces, type references); for full coverage concatenate both
  files into one query.
- Captures come back in document order: the whole definition node first
  (`definition.function`), then its `name`.
- With both files combined, `new A()` yielded two `A` captures in an earlier
  run (TypeScript's file has its own `new_expression` pattern), so an extractor
  must deduplicate by node range.

## Broken code

```ts
import { Language, Parser } from 'web-tree-sitter'

await Parser.init({
  wasmBinary: await Bun.file(
    'node_modules/web-tree-sitter/web-tree-sitter.wasm',
  ).bytes(),
})
const parser = new Parser()
parser.setLanguage(
  await Language.load(
    await Bun.file(
      'node_modules/tree-sitter-typescript/tree-sitter-typescript.wasm',
    ).bytes(),
  ),
)

const tree = parser.parse('function fly( {')

tree!.rootNode.hasError // true
```

The parse still succeeds and returns a full tree; the broken region becomes
`ERROR` or `MISSING` nodes. This is the basis for a syntax-only diagnostics
check and for reading files an agent is in the middle of editing.

## Sources

- [web-tree-sitter](https://npmjs.com/package/web-tree-sitter)
- [tree-sitter](https://tree-sitter.github.io/tree-sitter/)
