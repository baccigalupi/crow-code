import { describe, expect, it } from 'bun:test'
import { GitDiffStatParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/diff/stat-parser.ts'

describe('GitDiffStatParser', () => {
  it('when options include --stat, matches', () => {
    const parser = new GitDiffStatParser(['--cached', '--stat'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --stat, does not match', () => {
    const parser = new GitDiffStatParser(['--cached'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when --stat, returns the summary and paths', () => {
    const parser = new GitDiffStatParser(
      ['--stat'],
      ' allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      stat: {
        summary: { changed: 1, insertions: 1, deletions: 1 },
        paths: [{ path: 'allowed.txt', changes: '2 +-' }],
      },
    })
  })
})
