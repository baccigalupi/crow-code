import type { QueryCapture } from 'web-tree-sitter'
import type { LanguageParser } from '../language-parsers/types.ts'

export class Definitions {
  private captures: QueryCapture[]
  private languageParser: LanguageParser

  constructor(captures: QueryCapture[], languageParser: LanguageParser) {
    this.captures = captures
    this.languageParser = languageParser
  }

  list() {
    return this.captures.flatMap((capture, index) =>
      this.definitionAt(capture, index),
    )
  }

  private definitionAt(capture: QueryCapture, index: number) {
    if (!capture.name.startsWith('definition.')) return []

    return [{ node: capture.node, symbol: this.symbol(capture, index) }]
  }

  private symbol(capture: QueryCapture, index: number) {
    const node = capture.node
    const kind = capture.name.replace('definition.', '')
    const signature = this.signature(capture)
    const startLine = node.startPosition.row + 1
    const endLine = node.endPosition.row + 1
    const name = this.name(index)
    return { name, kind, signature, startLine, endLine, children: [] }
  }

  private name(index: number) {
    return this.captures
      .slice(index + 1)
      .find((capture) => capture.name === 'name')!.node.text
  }

  private signature(capture: QueryCapture) {
    return this.languageParser
      .signature(capture.node)
      .replace(/\s+/g, ' ')
      .trim()
  }
}
