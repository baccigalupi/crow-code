import { describe, expect, it } from 'bun:test'
import { SyntaxErrors } from '../../../../src/tools/research/diagnostics/syntax-errors.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('SyntaxErrors', () => {
  it('when the code has unparseable text, reports a syntax error at its 1-based position', async () => {
    const parser = await mockApplicationData()
      .parsers()
      .parserFor({
        language: 'typescript',
        packageName: 'tree-sitter-typescript',
        version: '0.23.2',
        file: 'js-ts/tree-sitter-typescript.wasm',
        extensions: ['.ts'],
        interpreters: [],
        tags: ['js-ts/javascript-tags.scm', 'js-ts/typescript-tags.scm'],
      })
    const tree = parser.parse('const = 1\n')!

    const diagnostics = new SyntaxErrors(tree.rootNode).diagnostics()

    expect(diagnostics).toEqual([
      {
        line: 1,
        column: 1,
        severity: 'error',
        message: 'syntax error',
        source: 'syntax',
      },
    ])
  })

  it('when the code lacks an expected token, reports it as missing', async () => {
    const parser = await mockApplicationData()
      .parsers()
      .parserFor({
        language: 'typescript',
        packageName: 'tree-sitter-typescript',
        version: '0.23.2',
        file: 'js-ts/tree-sitter-typescript.wasm',
        extensions: ['.ts'],
        interpreters: [],
        tags: ['js-ts/javascript-tags.scm', 'js-ts/typescript-tags.scm'],
      })
    const tree = parser.parse('function fly() {\n')!

    const diagnostics = new SyntaxErrors(tree.rootNode).diagnostics()

    expect(diagnostics).toEqual([
      {
        line: 1,
        column: 17,
        severity: 'error',
        message: 'missing }',
        source: 'syntax',
      },
    ])
  })

  it('when separate statements are broken, reports one error per statement in order', async () => {
    const parser = await mockApplicationData()
      .parsers()
      .parserFor({
        language: 'typescript',
        packageName: 'tree-sitter-typescript',
        version: '0.23.2',
        file: 'js-ts/tree-sitter-typescript.wasm',
        extensions: ['.ts'],
        interpreters: [],
        tags: ['js-ts/javascript-tags.scm', 'js-ts/typescript-tags.scm'],
      })
    const tree = parser.parse('const = (1 +;\nconst b = 2\nlet = ) 3\n')!

    const diagnostics = new SyntaxErrors(tree.rootNode).diagnostics()

    expect(diagnostics).toEqual([
      {
        line: 1,
        column: 1,
        severity: 'error',
        message: 'syntax error',
        source: 'syntax',
      },
      {
        line: 3,
        column: 7,
        severity: 'error',
        message: 'syntax error',
        source: 'syntax',
      },
    ])
  })
})
