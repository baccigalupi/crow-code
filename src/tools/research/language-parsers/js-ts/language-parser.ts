import type { Node } from 'web-tree-sitter'
import { DocComment } from '../doc-comment.ts'
import grammars from './grammars.json'

export class JsTsLanguageParser {
  grammars() {
    return [...grammars]
  }

  handles(language: string) {
    return grammars.some((grammar) => grammar.language === language)
  }

  signature(node: Node) {
    return this.signatureText(node, this.body(node))
  }

  docComment(node: Node) {
    return new DocComment(node).text()
  }

  private body(node: Node) {
    return (
      node.childForFieldName('body') ||
      this.valueBody(node.childForFieldName('value'))
    )
  }

  private valueBody(value: Node | null) {
    if (value === null) return null

    return value.childForFieldName('body')
  }

  private signatureText(node: Node, body: Node | null) {
    if (body === null) return node.text.split('\n')[0]

    return node.text.slice(0, body.startIndex - node.startIndex)
  }
}
