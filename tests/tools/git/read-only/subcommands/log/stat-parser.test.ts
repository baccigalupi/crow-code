import { describe, expect, it } from 'bun:test'
import { GitLogStatParser } from '../../../../../../src/tools/git/read-only/subcommands/log/stat-parser.ts'

describe('GitLogStatParser', () => {
  it('when options include --stat, matches', () => {
    const parser = new GitLogStatParser(['--stat'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --stat, does not match', () => {
    const parser = new GitLogStatParser(['-p'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when a commit has stat lines, returns its stat', () => {
    const parser = new GitLogStatParser(
      ['--stat'],
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
    )

    const result = parser.parse()

    expect(result.commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        stat: {
          summary: { changed: 1, insertions: 1, deletions: 1 },
          paths: [{ path: 'allowed.txt', changes: '2 +-' }],
        },
      },
    ])
  })
})
