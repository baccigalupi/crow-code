import { describe, expect, it } from 'bun:test'
import { Parsers } from '../../../../src/tools/research/language-parsers/parsers.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('Parsers', () => {
  it('when asked for javascript, parses javascript', async () => {
    const parsers = new Parsers(mockApplicationData())
    const parser = await parsers.parserFor({
      language: 'javascript',
      packageName: 'tree-sitter-javascript',
      version: '0.23.1',
      file: 'js-ts/tree-sitter-javascript.wasm',
      extensions: ['.js'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm'],
    })

    const tree = parser.parse('class Crow {}')

    expect(tree!.rootNode.firstChild!.type).toBe('class_declaration')
  })

  it('when asked twice for one language, returns the same parser', async () => {
    const parsers = new Parsers(mockApplicationData())
    const grammar = {
      language: 'javascript',
      packageName: 'tree-sitter-javascript',
      version: '0.23.1',
      file: 'js-ts/tree-sitter-javascript.wasm',
      extensions: ['.js'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm'],
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
      version: '0.23.2',
      file: 'js-ts/tree-sitter-typescript.wasm',
      extensions: ['.ts'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm', 'js-ts/typescript-tags.scm'],
    })

    const tree = parser.parse('let a: number = 1')

    expect(tree!.rootNode.hasError).toBe(false)
  })

  it('when asked for the javascript tags query, captures function definitions', async () => {
    const parsers = new Parsers(mockApplicationData())
    const grammar = {
      language: 'javascript',
      packageName: 'tree-sitter-javascript',
      version: '0.23.1',
      file: 'js-ts/tree-sitter-javascript.wasm',
      extensions: ['.js'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm'],
    }
    const tree = (await parsers.parserFor(grammar)).parse('function fly() {}')
    const query = await parsers.tagsQueryFor(grammar)

    const captures = query.captures(tree!.rootNode)

    expect(captures).toHaveLength(2)
    expect(captures[0].name).toBe('definition.function')
    expect(captures[1].name).toBe('name')
  })

  it('when asked twice for one tags query, returns the same query', async () => {
    const parsers = new Parsers(mockApplicationData())
    const grammar = {
      language: 'javascript',
      packageName: 'tree-sitter-javascript',
      version: '0.23.1',
      file: 'js-ts/tree-sitter-javascript.wasm',
      extensions: ['.js'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm'],
    }
    const first = await parsers.tagsQueryFor(grammar)

    const second = await parsers.tagsQueryFor(grammar)

    expect(second).toBe(first)
  })

  it('when asked for the typescript tags query, captures interface definitions', async () => {
    const parsers = new Parsers(mockApplicationData())
    const grammar = {
      language: 'typescript',
      packageName: 'tree-sitter-typescript',
      version: '0.23.2',
      file: 'js-ts/tree-sitter-typescript.wasm',
      extensions: ['.ts'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm', 'js-ts/typescript-tags.scm'],
    }
    const tree = (await parsers.parserFor(grammar)).parse('interface Crow {}')
    const query = await parsers.tagsQueryFor(grammar)

    const captures = query.captures(tree!.rootNode)

    expect(captures).toHaveLength(2)
    expect(captures[0].name).toBe('definition.interface')
    expect(captures[1].name).toBe('name')
  })

  it('when asked for tsx, parses tsx without errors', async () => {
    const parsers = new Parsers(mockApplicationData())
    const parser = await parsers.parserFor({
      language: 'tsx',
      packageName: 'tree-sitter-typescript',
      version: '0.23.2',
      file: 'js-ts/tree-sitter-tsx.wasm',
      extensions: ['.tsx'],
      interpreters: [],
      tags: ['js-ts/javascript-tags.scm', 'js-ts/typescript-tags.scm'],
    })

    const tree = parser.parse('const a = <div />')

    expect(tree!.rootNode.hasError).toBe(false)
  })
})
