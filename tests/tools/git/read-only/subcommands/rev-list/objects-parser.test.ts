import { describe, expect, it } from 'bun:test'
import { GitRevListObjectsParser } from '../../../../../../src/tools/git/read-only/subcommands/rev-list/objects-parser.ts'

describe('GitRevListObjectsParser', () => {
  it('when options include --objects, matches', () => {
    const parser = new GitRevListObjectsParser(['--objects', 'HEAD'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options lack --objects, does not match', () => {
    const parser = new GitRevListObjectsParser(['HEAD'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given objects output, returns objects with paths when present', () => {
    const parser = new GitRevListObjectsParser(
      ['--objects', 'HEAD'],
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\n6ba0150304dd0c0995c00f2cf66d717dad8ef16c \nfe4e0926999e7629315c1e020561a5025c67b41b allowed.txt\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      objects: [
        { sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6' },
        { sha: '6ba0150304dd0c0995c00f2cf66d717dad8ef16c' },
        {
          sha: 'fe4e0926999e7629315c1e020561a5025c67b41b',
          path: 'allowed.txt',
        },
      ],
    })
  })
})
