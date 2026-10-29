import { describe, expect, it } from 'bun:test'
import type { Node } from 'web-tree-sitter'
import { SymbolMatch } from '../../../../src/tools/research/read-symbol/symbol-match.ts'

describe('SymbolMatch', () => {
  it('when the name is dotted, matches only the definition nested in the outer name', () => {
    const crow = {
      node: { startIndex: 0, endIndex: 30 } as Node,
      symbol: {
        name: 'Crow',
        kind: 'class',
        signature: '',
        startLine: 1,
        endLine: 3,
        children: [],
      },
    }
    const method = {
      node: { startIndex: 13, endIndex: 28 } as Node,
      symbol: {
        name: 'fly',
        kind: 'method',
        signature: '',
        startLine: 2,
        endLine: 2,
        children: [],
      },
    }
    const fly = {
      node: { startIndex: 31, endIndex: 48 } as Node,
      symbol: {
        name: 'fly',
        kind: 'function',
        signature: '',
        startLine: 4,
        endLine: 4,
        children: [],
      },
    }

    const matches = new SymbolMatch([crow, method, fly]).matches('Crow.fly')

    expect(matches).toEqual([method])
  })

  it('when the name is bare, matches every definition with that name', () => {
    const crow = {
      node: { startIndex: 0, endIndex: 30 } as Node,
      symbol: {
        name: 'Crow',
        kind: 'class',
        signature: '',
        startLine: 1,
        endLine: 3,
        children: [],
      },
    }
    const method = {
      node: { startIndex: 13, endIndex: 28 } as Node,
      symbol: {
        name: 'fly',
        kind: 'method',
        signature: '',
        startLine: 2,
        endLine: 2,
        children: [],
      },
    }
    const fly = {
      node: { startIndex: 31, endIndex: 48 } as Node,
      symbol: {
        name: 'fly',
        kind: 'function',
        signature: '',
        startLine: 4,
        endLine: 4,
        children: [],
      },
    }

    const matches = new SymbolMatch([crow, method, fly]).matches('fly')

    expect(matches).toEqual([method, fly])
  })
})
