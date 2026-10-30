import { describe, expect, it } from 'bun:test'
import type { Node } from 'web-tree-sitter'
import { Parsers } from '../../../../src/tools/research/language-parsers/parsers.ts'
import { SymbolText } from '../../../../src/tools/research/read-symbol/symbol-text.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('SymbolText', () => {
  it('when asked for source, returns the lines of the definition', () => {
    const definition = {
      node: {} as Node,
      symbol: {
        name: 'fly',
        kind: 'function',
        signature: '',
        startLine: 2,
        endLine: 3,
        children: [],
      },
    }
    const symbolText = new SymbolText(
      definition,
      'python',
      'X = 1\ndef fly():\n    pass\nY = 2\n',
    )

    const source = symbolText.source()

    expect(source).toBe('def fly():\n    pass')
  })

  it('when asked for the doc comment, asks the parser for the definition language', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const text = 'def fly():\n    """Flies."""\n    pass\n'
    const definition = {
      node: parser.parse(text)!.rootNode.firstChild!,
      symbol: {
        name: 'fly',
        kind: 'function',
        signature: '',
        startLine: 1,
        endLine: 3,
        children: [],
      },
    }
    const symbolText = new SymbolText(definition, 'python', text)

    const docComment = symbolText.docComment()

    expect(docComment).toBe('"""Flies."""')
  })
})
