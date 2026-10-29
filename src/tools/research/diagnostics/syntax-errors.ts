import type { Node } from 'web-tree-sitter'
import type { Diagnostic } from '../language-parsers/types.ts'

export class SyntaxErrors {
  private root: Node

  constructor(root: Node) {
    this.root = root
  }

  diagnostics() {
    return this.collect(this.root)
  }

  private collect(node: Node): Diagnostic[] {
    if (node.isError || node.isMissing) return [this.entry(node)]

    return node.children
      .filter((child) => child.hasError)
      .flatMap((child) => this.collect(child))
  }

  private entry(node: Node): Diagnostic {
    const position = node.startPosition
    const line = position.row + 1
    const column = position.column + 1
    const message = this.message(node)
    return { line, column, severity: 'error', message, source: 'syntax' }
  }

  private message(node: Node) {
    if (node.isMissing) return `missing ${node.type}`

    return 'syntax error'
  }
}
