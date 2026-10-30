import { describe, expect, it } from 'bun:test'
import { Parsers } from '../../../../../src/tools/research/language-parsers/parsers.ts'
import { PythonLanguageParser } from '../../../../../src/tools/research/language-parsers/python/language-parser.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('PythonLanguageParser', () => {
  it('when asked for grammars, returns python with the package and version its wasm came from', () => {
    const languageParser = new PythonLanguageParser()

    const grammars = languageParser.grammars()

    expect(grammars).toHaveLength(1)
    expect(grammars[0].language).toBe('python')
    expect(grammars[0].packageName).toBe('tree-sitter-python')
    expect(grammars[0].version).toBe('0.25.0')
    expect(grammars[0].file).toBe('python/tree-sitter-python.wasm')
  })

  it('when the language is one of its grammars, handles it', () => {
    const languageParser = new PythonLanguageParser()

    const handles = languageParser.handles('python')

    expect(handles).toBe(true)
  })

  it('when the language is not one of its grammars, does not handle it', () => {
    const languageParser = new PythonLanguageParser()

    const handles = languageParser.handles('typescript')

    expect(handles).toBe(false)
  })

  it('when the body starts with a string, returns it as the doc comment', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('def fly():\n    """Flies."""\n    pass\n')
    const languageParser = new PythonLanguageParser()

    const docComment = languageParser.docComment(tree!.rootNode.firstChild!)

    expect(docComment).toBe('"""Flies."""')
  })

  it('when the body starts with another statement, returns the comment above', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('# Flies.\ndef fly():\n    go()\n')
    const languageParser = new PythonLanguageParser()

    const docComment = languageParser.docComment(
      tree!.rootNode.namedChildren[1]!,
    )

    expect(docComment).toBe('# Flies.')
  })

  it('when the definition has no body, returns the comment above', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('# Count.\nX = 1\n')
    const languageParser = new PythonLanguageParser()

    const docComment = languageParser.docComment(
      tree!.rootNode.namedChildren[1]!.firstChild!,
    )

    expect(docComment).toBe('# Count.')
  })

  it('when the body starts with a non-expression statement, returns the comment above', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('# Flies.\ndef fly():\n    return 1\n')
    const languageParser = new PythonLanguageParser()

    const docComment = languageParser.docComment(
      tree!.rootNode.namedChildren[1]!,
    )

    expect(docComment).toBe('# Flies.')
  })

  it('when the definition has a body, signs it with the text before the body', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('def fly(height: int):\n    pass\n')
    const languageParser = new PythonLanguageParser()

    const signature = languageParser.signature(tree!.rootNode.firstChild!)

    expect(signature).toBe('def fly(height: int):\n    ')
  })

  it('when the definition has no body, signs it with its first line', async () => {
    const parser = await new Parsers(mockApplicationData()).parserFor({
      language: 'python',
      packageName: 'tree-sitter-python',
      version: '0.25.0',
      file: 'python/tree-sitter-python.wasm',
      extensions: ['.py'],
      interpreters: [],
      tags: [],
    })
    const tree = parser.parse('X = 1\n')
    const languageParser = new PythonLanguageParser()

    const signature = languageParser.signature(
      tree!.rootNode.firstChild!.firstChild!,
    )

    expect(signature).toBe('X = 1')
  })
})
