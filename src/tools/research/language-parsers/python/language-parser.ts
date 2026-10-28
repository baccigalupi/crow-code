import type { Node } from 'web-tree-sitter'
import grammars from './grammars.json'

export class PythonLanguageParser {
  grammars() {
    return [...grammars]
  }

  handles(language: string) {
    return grammars.some((grammar) => grammar.language === language)
  }

  signature(node: Node) {
    return this.signatureText(node, node.childForFieldName('body'))
  }

  private signatureText(node: Node, body: Node | null) {
    if (body === null) return node.text.split('\n')[0]

    return node.text.slice(0, body.startIndex - node.startIndex)
  }
}
