import { describe, expect, it } from 'bun:test'
import { Grammars } from '../../../../src/tools/research/language-parsers/grammars.ts'

describe('Grammars', () => {
  it('when the path extension matches a grammar, returns that grammar', () => {
    const grammars = new Grammars([
      {
        language: 'python',
        packageName: 'tree-sitter-python',
        file: 'tree-sitter-python.wasm',
        extensions: ['.py', '.pyi'],
        interpreters: ['python3'],
      },
    ])

    const grammar = grammars.grammarFor('src/a.pyi', '')

    expect(grammar).toEqual({
      language: 'python',
      packageName: 'tree-sitter-python',
      file: 'tree-sitter-python.wasm',
      extensions: ['.py', '.pyi'],
      interpreters: ['python3'],
    })
  })

  it('when the path extension matches no grammar, returns nothing', () => {
    const grammars = new Grammars([
      {
        language: 'python',
        packageName: 'tree-sitter-python',
        file: 'tree-sitter-python.wasm',
        extensions: ['.py'],
        interpreters: ['python3'],
      },
    ])

    const grammar = grammars.grammarFor('README.md', '# hi')

    expect(grammar).toBeUndefined()
  })

  describe('when the file has no extension', () => {
    it('when the shebang runs an interpreter through env, matches that interpreter', () => {
      const grammars = new Grammars([
        {
          language: 'python',
          packageName: 'tree-sitter-python',
          file: 'tree-sitter-python.wasm',
          extensions: ['.py'],
          interpreters: ['python3'],
        },
      ])

      const grammar = grammars.grammarFor(
        'bin/tool',
        '#!/usr/bin/env python3\n',
      )

      expect(grammar!.language).toBe('python')
    })

    it('when the shebang names an interpreter path, matches its last segment', () => {
      const grammars = new Grammars([
        {
          language: 'python',
          packageName: 'tree-sitter-python',
          file: 'tree-sitter-python.wasm',
          extensions: ['.py'],
          interpreters: ['python3'],
        },
      ])

      const grammar = grammars.grammarFor('bin/run', '#!/usr/bin/python3 -u\n')

      expect(grammar!.language).toBe('python')
    })

    it('when the shebang interpreter matches no grammar, returns nothing', () => {
      const grammars = new Grammars([
        {
          language: 'python',
          packageName: 'tree-sitter-python',
          file: 'tree-sitter-python.wasm',
          extensions: ['.py'],
          interpreters: ['python3'],
        },
      ])

      const grammar = grammars.grammarFor('bin/run', '#!/bin/sh\n')

      expect(grammar).toBeUndefined()
    })

    it('when there is no shebang, returns nothing', () => {
      const grammars = new Grammars([
        {
          language: 'python',
          packageName: 'tree-sitter-python',
          file: 'tree-sitter-python.wasm',
          extensions: ['.py'],
          interpreters: ['python3'],
        },
      ])

      const grammar = grammars.grammarFor('Makefile', 'all:\n')

      expect(grammar).toBeUndefined()
    })
  })
})
