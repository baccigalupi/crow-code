import type { Node, Tree } from 'web-tree-sitter'

export type Grammar = {
  language: string
  packageName: string
  version: string
  file: string
  extensions: string[]
  interpreters: string[]
  tags: string[]
}

export type LanguageParser = {
  grammars(): Grammar[]
  handles(language: string): boolean
  signature(node: Node): string
}

export type OutlineSymbol = {
  name: string
  kind: string
  signature: string
  startLine: number
  endLine: number
  children: OutlineSymbol[]
}

export type Definition = {
  node: Node
  symbol: OutlineSymbol
}

export type FileOutline = {
  path: string
  language: string
  symbols: OutlineSymbol[]
}

export type SymbolSource = {
  path: string
  name: string
  kind: string
  startLine: number
  endLine: number
  docComment: string
  source: string
}

export type Diagnostic = {
  line: number
  column: number
  severity: 'error'
  message: string
  source: 'syntax'
}

export type FileDiagnostics = {
  path: string
  language: string
  diagnostics: Diagnostic[]
}

export type ParsedFile = {
  path: string
  language: string
  tree: Tree | null
}
