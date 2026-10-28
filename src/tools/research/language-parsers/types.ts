import type { Tree } from 'web-tree-sitter'

export type Grammar = {
  language: string
  packageName: string
  file: string
  extensions: string[]
  interpreters: string[]
}

export type ParsedFile = {
  path: string
  language: string
  tree: Tree | null
}
