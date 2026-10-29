import type { Node } from 'web-tree-sitter'

export class DocComment {
  private node: Node

  constructor(node: Node) {
    this.node = node
  }

  text() {
    return this.comments(this.outermost(this.node))
      .map((comment) => comment.text)
      .join('\n')
  }

  private outermost(node: Node): Node {
    if (!this.wraps(node.parent, node)) return node

    return this.outermost(node.parent!)
  }

  private wraps(parent: Node | null, node: Node) {
    return (
      parent !== null &&
      parent.parent !== null &&
      parent.endIndex === node.endIndex
    )
  }

  private comments(node: Node): Node[] {
    if (!this.isAdjacentComment(node.previousNamedSibling, node)) return []

    const comment = node.previousNamedSibling!
    return [...this.comments(comment), comment]
  }

  private isAdjacentComment(sibling: Node | null, node: Node) {
    return (
      sibling !== null &&
      sibling.type === 'comment' &&
      sibling.endPosition.row === node.startPosition.row - 1
    )
  }
}
