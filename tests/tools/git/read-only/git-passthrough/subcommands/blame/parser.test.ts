import { describe, expect, it } from 'bun:test'
import { GitBlameParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/blame/parser.ts'

describe('GitBlameParser', () => {
  it('when given one line-porcelain record, returns a typed line', () => {
    const output = [
      'ffd175847ab5c34abf8e3a66c4bab26b9ef87939 1 1 1',
      'author Fixture Author',
      'author-mail <fixture@example.com>',
      'author-time 1767225600',
      'author-tz +0000',
      'committer Fixture Author',
      'summary first',
      'boundary',
      'filename allowed.txt',
      '\tallowed one',
      '',
    ].join('\n')

    const result = new GitBlameParser(output).parse()

    expect(result).toEqual({
      lines: [
        {
          line: 1,
          sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
          author: 'Fixture Author',
          date: '2026-01-01T00:00:00.000Z',
          summary: 'first',
          content: 'allowed one',
        },
      ],
    })
  })

  it('when given several records, strips a leading ^ and keeps spaces and empty content', () => {
    const output = [
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6 1 1 1',
      'author Ada Lovelace',
      'author-time 1767312000',
      'summary Add login page',
      'filename a.ts',
      '\tconst a = 1',
      '^ffd175847ab5c34abf8e3a66c4bab26b9ef87939 2 2 1',
      'author Fixture Author',
      'author-time 1767225600',
      'summary first',
      'filename a.ts',
      '\t',
      '',
    ].join('\n')

    const result = new GitBlameParser(output).parse()

    expect(result).toEqual({
      lines: [
        {
          line: 1,
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada Lovelace',
          date: '2026-01-02T00:00:00.000Z',
          summary: 'Add login page',
          content: 'const a = 1',
        },
        {
          line: 2,
          sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
          author: 'Fixture Author',
          date: '2026-01-01T00:00:00.000Z',
          summary: 'first',
          content: '',
        },
      ],
    })
  })

  it('when given empty output, returns no lines', () => {
    const output = ''

    const result = new GitBlameParser(output).parse()

    expect(result).toEqual({ lines: [] })
  })
})
