import { describe, expect, it } from 'bun:test'
import { Parsers } from '../../../../src/tools/research/language-parsers/parsers.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('Parsers', () => {
  it('when asked for javascript, parses javascript', async () => {
    const parsers = new Parsers(mockApplicationData())
    const parser = await parsers.parserFor({
      language: 'javascript',
      packageName: 'tree-sitter-javascript',
      file: 'tree-sitter-javascript.wasm',
      extensions: ['.js'],
      interpreters: [],
    })

    const tree = parser.parse('class Crow {}')

    expect(tree!.rootNode.firstChild!.type).toBe('class_declaration')
  })

  it('when asked twice for one language, returns the same parser', async () => {
    const parsers = new Parsers(mockApplicationData())
    const grammar = {
      language: 'javascript',
      packageName: 'tree-sitter-javascript',
      file: 'tree-sitter-javascript.wasm',
      extensions: ['.js'],
      interpreters: [],
    }
    const first = await parsers.parserFor(grammar)

    const second = await parsers.parserFor(grammar)

    expect(second).toBe(first)
  })

  it('when asked for typescript, parses typescript without errors', async () => {
    const parsers = new Parsers(mockApplicationData())
    const parser = await parsers.parserFor({
      language: 'typescript',
      packageName: 'tree-sitter-typescript',
      file: 'tree-sitter-typescript.wasm',
      extensions: ['.ts'],
      interpreters: [],
    })

    const tree = parser.parse('let a: number = 1')

    expect(tree!.rootNode.hasError).toBe(false)
  })

  it('when asked for tsx, parses tsx without errors', async () => {
    const parsers = new Parsers(mockApplicationData())
    const parser = await parsers.parserFor({
      language: 'tsx',
      packageName: 'tree-sitter-typescript',
      file: 'tree-sitter-tsx.wasm',
      extensions: ['.tsx'],
      interpreters: [],
    })

    const tree = parser.parse('const a = <div />')

    expect(tree!.rootNode.hasError).toBe(false)
  })
})
