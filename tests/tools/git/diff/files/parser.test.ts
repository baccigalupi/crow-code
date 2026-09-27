// Porcelain-specific edge cases:
// 6. quoted paths (spaces/special characters) — parser must unquote
// 7. rename lines with "old -> new" — parser must keep the new path
// 8. untracked directories — git emits the directory path, not files inside

import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  FileDiffParser,
  fileDiffParser,
} from '../../../../../src/tools/git/diff/files/parser.ts'

describe('FileDiffParser', () => {
  it('when text is empty, returns an empty array', () => {
    const parser = new FileDiffParser()

    const result = parser.parse('')

    expect(result).toEqual([])
  })

  it('when text has lines, strips the status prefix and returns paths', () => {
    const parser = new FileDiffParser()

    const result = parser.parse(` M src/a.ts\n?? src/b.ts\n`)

    expect(result).toEqual(['src/a.ts', 'src/b.ts'])
  })

  it('when a line is a rename, keeps the new path', () => {
    const parser = new FileDiffParser()

    const result = parser.parse('R  old/path.ts -> new/path.ts')

    expect(result).toEqual(['new/path.ts'])
  })

  it('when a path is quoted, removes the quotes', () => {
    const parser = new FileDiffParser()

    const result = parser.parse('?? "path/with spaces/file.txt"')

    expect(result).toEqual(['path/with spaces/file.txt'])
  })

  it('when a quoted path contains escaped quotes, unescapes them', () => {
    const parser = new FileDiffParser()

    const result = parser.parse('?? "path/with\\"quotes\\".txt"')

    expect(result).toEqual(['path/with"quotes".txt'])
  })

  it('fileDiffParser returns a parser that can parse text', () => {
    const parser = fileDiffParser()

    const result = parser.parse(' M file.ts')

    expect(result).toEqual(['file.ts'])
  })
})
