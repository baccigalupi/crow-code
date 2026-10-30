import type { Node } from 'web-tree-sitter'
import { DocComment } from '../doc-comment.ts'
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

  docComment(node: Node) {
    if (this.hasDocstring(node)) {
      return this.docstring(node.childForFieldName('body'))
    }

    return new DocComment(node).text()
  }

  private hasDocstring(node: Node) {
    return this.docstring(node.childForFieldName('body')) !== ''
  }

  private docstring(body: Node | null) {
    if (body === null) return ''

    return this.statementString(body.firstNamedChild)
  }

  private statementString(statement: Node | null) {
    if (statement === null || statement.type !== 'expression_statement') {
      return ''
    }

    return this.stringText(statement.firstNamedChild)
  }

  private stringText(expression: Node | null) {
    if (expression === null || expression.type !== 'string') return ''

    return expression.text
  }

  private signatureText(node: Node, body: Node | null) {
    if (body === null) return node.text.split('\n')[0]

    return node.text.slice(0, body.startIndex - node.startIndex)
  }
}
