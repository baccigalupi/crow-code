import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  FileDiffParser,
  fileDiffParser,
} from '../../../../../src/tools/git/diff/files/parser.ts'

describe('FileDiffParser', () => {
  it('when text is empty, returns an empty array', () => {
    const parser = new FileDiffParser('')

    const result = parser.parse()

    expect(result).toEqual([])
  })

  it('when text has lines, strips the status prefix and returns paths', () => {
    const parser = new FileDiffParser(` M src/a.ts\n?? src/b.ts\n`)

    const result = parser.parse()

    expect(result).toEqual(['src/a.ts', 'src/b.ts'])
  })

  it('when a filter is provided, returns only paths in the filter', () => {
    const parser = new FileDiffParser(
      ` M src/a.ts\n?? src/b.ts\n M src/c.ts`,
      ['src/a.ts', 'src/c.ts'],
    )

    const result = parser.parse()

    expect(result).toEqual(['src/a.ts', 'src/c.ts'])
  })

  it('when a filter is provided and no paths match, returns an empty array', () => {
    const parser = new FileDiffParser(
      ` M src/a.ts\n?? src/b.ts`,
      ['src/d.ts'],
    )

    const result = parser.parse()

    expect(result).toEqual([])
  })

  it('when filter contains a file inside a new directory, returns the file path', () => {
    const parser = new FileDiffParser('?? newdir/file.ts', ['newdir/file.ts'])

    const result = parser.parse()

    expect(result).toEqual(['newdir/file.ts'])
  })

  it('when a line is a rename, keeps the new path', () => {
    const parser = new FileDiffParser('R  old/path.ts -> new/path.ts')

    const result = parser.parse()

    expect(result).toEqual(['new/path.ts'])
  })

  it('when a rename has quoted paths, keeps the new path unquoted', () => {
    const parser = new FileDiffParser('R  "old name.txt" -> "new name.txt"')

    const result = parser.parse()

    expect(result).toEqual(['new name.txt'])
  })

  it('when a path is quoted, removes the quotes', () => {
    const parser = new FileDiffParser('?? "path/with spaces/file.txt"')

    const result = parser.parse()

    expect(result).toEqual(['path/with spaces/file.txt'])
  })

  it('when a quoted path contains escaped quotes, unescapes them', () => {
    const parser = new FileDiffParser('?? "path/with\\"quotes\\".txt"')

    const result = parser.parse()

    expect(result).toEqual(['path/with"quotes".txt'])
  })

  it('when a line contains only whitespace, it is ignored', () => {
    const parser = new FileDiffParser('\t   \n M file.ts\n')

    const result = parser.parse()

    expect(result).toEqual(['file.ts'])
  })

  it('fileDiffParser returns a parser that can parse text', () => {
    const parser = fileDiffParser(' M file.ts')

    const result = parser.parse()

    expect(result).toEqual(['file.ts'])
  })
})
