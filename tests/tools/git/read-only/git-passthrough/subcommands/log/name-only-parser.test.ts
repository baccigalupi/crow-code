import { describe, expect, it } from 'bun:test'
import { GitLogNameOnlyParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/name-only-parser.ts'

describe('GitLogNameOnlyParser', () => {
  it('when options include --name-only, matches', () => {
    const parser = new GitLogNameOnlyParser(['--name-only', '--stat'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --name-only, does not match', () => {
    const parser = new GitLogNameOnlyParser(['--stat'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when a commit has path lines, returns each as a file', () => {
    const parser = new GitLogNameOnlyParser(
      ['--name-only'],
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nallowed.txt\nnotes.txt\n',
    )

    const result = parser.parse()

    expect(result.commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        files: [{ path: 'allowed.txt' }, { path: 'notes.txt' }],
      },
    ])
  })
})
