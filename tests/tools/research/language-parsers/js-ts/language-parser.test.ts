import { describe, expect, it } from 'bun:test'
import { JsTsLanguageParser } from '../../../../../src/tools/research/language-parsers/js-ts/language-parser.ts'
import { Parsers } from '../../../../../src/tools/research/language-parsers/parsers.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('JsTsLanguageParser', () => {
  it('when asked for grammars, returns typescript, tsx and javascript', () => {
    const languageParser = new JsTsLanguageParser()

    const grammars = languageParser.grammars()

    expect(grammars).toHaveLength(3)
    expect(grammars[0].language).toBe('typescript')
    expect(grammars[1].language).toBe('tsx')
    expect(grammars[2].language).toBe('javascript')
  })

  it('when asked for grammars, names the package and version each wasm came from', () => {
    const languageParser = new JsTsLanguageParser()

    const grammars = languageParser.grammars()

    expect(grammars[0].packageName).toBe('tree-sitter-typescript')
    expect(grammars[0].version).toBe('0.23.2')
    expect(grammars[1].packageName).toBe('tree-sitter-typescript')
    expect(grammars[1].version).toBe('0.23.2')
    expect(grammars[2].packageName).toBe('tree-sitter-javascript')
    expect(grammars[2].version).toBe('0.23.1')
  })

  it('when the language is one of its grammars, handles it', () => {
    const languageParser = new JsTsLanguageParser()

    const handles = languageParser.handles('tsx')

    expect(handles).toBe(true)
  })

  it('when the language is not one of its grammars, does not handle it', () => {
    const languageParser = new JsTsLanguageParser()

    const handles = languageParser.handles('python')

    expect(handles).toBe(false)
  })

  it('when a comment sits above the definition, returns it as the doc comment', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'typescript',
      packageName: 'tree-sitter-typescript',
      version: '0.23.2',
      file: 'js-ts/tree-sitter-typescript.wasm',
      extensions: ['.ts'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('/** Flies. */\nfunction fly() {}\n')
    const languageParser = new JsTsLanguageParser()

    const docComment = languageParser.docComment(
      tree!.rootNode.namedChildren[1]!,
    )

    expect(docComment).toBe('/** Flies. */')
  })

  describe('signature', () => {
    it('when the definition has a body, signs it with the text before the body', async () => {
      const parser = await new Parsers(mockApplicationData()).parserFor({
        language: 'typescript',
        packageName: 'tree-sitter-typescript',
        version: '0.23.2',
        file: 'js-ts/tree-sitter-typescript.wasm',
        extensions: ['.ts'],
        interpreters: [],
        tags: [],
      })
      const tree = parser.parse('function fly(height: number): void {\n}\n')
      const languageParser = new JsTsLanguageParser()

      const signature = languageParser.signature(tree!.rootNode.firstChild!)

      expect(signature).toBe('function fly(height: number): void ')
    })

    it('when the definition holds an arrow function, signs it without the arrow body', async () => {
      const parser = await new Parsers(mockApplicationData()).parserFor({
        language: 'typescript',
        packageName: 'tree-sitter-typescript',
        version: '0.23.2',
        file: 'js-ts/tree-sitter-typescript.wasm',
        extensions: ['.ts'],
        interpreters: [],
        tags: [],
      })
      const tree = parser.parse('const fly = (height: number) => {\n}\n')
      const languageParser = new JsTsLanguageParser()

      const signature = languageParser.signature(
        tree!.rootNode.firstChild!.firstNamedChild!,
      )

      expect(signature).toBe('fly = (height: number) => ')
    })

    it('when the definition has no body, signs it with its first line', async () => {
      const parser = await new Parsers(mockApplicationData()).parserFor({
        language: 'typescript',
        packageName: 'tree-sitter-typescript',
        version: '0.23.2',
        file: 'js-ts/tree-sitter-typescript.wasm',
        extensions: ['.ts'],
        interpreters: [],
        tags: [],
      })
      const tree = parser.parse('function fly(\n  height: number,\n): void\n')
      const languageParser = new JsTsLanguageParser()

      const signature = languageParser.signature(tree!.rootNode.firstChild!)

      expect(signature).toBe('function fly(')
    })
  })
})
