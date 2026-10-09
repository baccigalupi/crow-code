import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { BlameParser } from '../../../../src/tools/git/blame/parser.ts'

describe('BlameParser', () => {
  it('when text is empty, returns an empty array', () => {
    const parser = new BlameParser('')

    const result = parser.parse()

    expect(result).toEqual([])
  })

  it('when text has one entry, returns the parsed line', () => {
    const parser = new BlameParser(
      [
        'abc123abc123abc123abc123abc123abc123abcd 1 1 1',
        'author Ada',
        'author-mail <a@b.c>',
        'author-time 1700000000',
        'author-tz +0000',
        'committer Ada',
        'committer-mail <a@b.c>',
        'committer-time 1700000000',
        'committer-tz +0000',
        'summary Add login',
        'filename src/a.ts',
        '\tconst a = 1',
        '',
      ].join('\n'),
    )

    const result = parser.parse()

    expect(result).toEqual([
      {
        line: 1,
        sha: 'abc123abc123abc123abc123abc123abc123abcd',
        author: 'Ada',
        date: '2023-11-14T22:13:20.000Z',
        summary: 'Add login',
        content: 'const a = 1',
      },
    ])
  })

  it('when a header starts with ^, strips the boundary marker from the sha', () => {
    const parser = new BlameParser(
      [
        '^def456def456def456def456def456def456def4 2 2 1',
        'author Grace',
        'author-time 1700000060',
        'summary Fix tests',
        'filename src/a.ts',
        '\tconst b = 2',
        '',
      ].join('\n'),
    )

    const result = parser.parse()

    expect(result).toEqual([
      {
        line: 2,
        sha: 'def456def456def456def456def456def456def4',
        author: 'Grace',
        date: '2023-11-14T22:14:20.000Z',
        summary: 'Fix tests',
        content: 'const b = 2',
      },
    ])
  })

  it('when text has several entries, returns one result per entry', () => {
    const parser = new BlameParser(
      [
        'abc123abc123abc123abc123abc123abc123abcd 1 1 1',
        'author Ada',
        'author-time 1700000000',
        'summary Add login',
        'filename src/a.ts',
        '\tconst a = 1',
        'def456def456def456def456def456def456def4 2 2 1',
        'author Grace',
        'author-time 1700000060',
        'summary Fix tests',
        'filename src/a.ts',
        '\tconst b = 2',
        '',
      ].join('\n'),
    )

    const result = parser.parse()

    expect(result).toEqual([
      {
        line: 1,
        sha: 'abc123abc123abc123abc123abc123abc123abcd',
        author: 'Ada',
        date: '2023-11-14T22:13:20.000Z',
        summary: 'Add login',
        content: 'const a = 1',
      },
      {
        line: 2,
        sha: 'def456def456def456def456def456def456def4',
        author: 'Grace',
        date: '2023-11-14T22:14:20.000Z',
        summary: 'Fix tests',
        content: 'const b = 2',
      },
    ])
  })
})
