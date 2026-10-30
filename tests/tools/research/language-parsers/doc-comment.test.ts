import { describe, expect, it } from 'bun:test'
import type { Node } from 'web-tree-sitter'
import { DocComment } from '../../../../src/tools/research/language-parsers/doc-comment.ts'

describe('DocComment', () => {
  it('when contiguous comments sit above the node, joins them in order', () => {
    const first = {
      type: 'comment',
      text: '// Flies',
      endPosition: { row: 0 },
      startPosition: { row: 0 },
      previousNamedSibling: null,
    } as unknown as Node
    const second = {
      type: 'comment',
      text: '// high.',
      endPosition: { row: 1 },
      startPosition: { row: 1 },
      previousNamedSibling: first,
    } as unknown as Node
    const node = {
      parent: { parent: null },
      startPosition: { row: 2 },
      previousNamedSibling: second,
    } as unknown as Node

    const text = new DocComment(node).text()

    expect(text).toBe('// Flies\n// high.')
  })

  it('when a blank line separates the comment, returns an empty string', () => {
    const comment = {
      type: 'comment',
      text: '// Flies.',
      endPosition: { row: 0 },
      previousNamedSibling: null,
    } as unknown as Node
    const node = {
      parent: { parent: null },
      startPosition: { row: 2 },
      previousNamedSibling: comment,
    } as unknown as Node

    const text = new DocComment(node).text()

    expect(text).toBe('')
  })

  it('when a wrapper ends with the node, takes the comment above the wrapper', () => {
    const comment = {
      type: 'comment',
      text: '/** Flies. */',
      endPosition: { row: 0 },
      previousNamedSibling: null,
    } as unknown as Node
    const wrapper = {
      parent: { parent: null },
      endIndex: 40,
      startPosition: { row: 1 },
      previousNamedSibling: comment,
    } as unknown as Node
    const node = {
      parent: wrapper,
      endIndex: 40,
      startPosition: { row: 1 },
      previousNamedSibling: null,
    } as unknown as Node

    const text = new DocComment(node).text()

    expect(text).toBe('/** Flies. */')
  })
})
