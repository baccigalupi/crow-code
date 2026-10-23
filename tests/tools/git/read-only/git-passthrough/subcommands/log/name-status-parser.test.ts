import { describe, expect, it } from 'bun:test'
import { GitLogNameStatusParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/name-status-parser.ts'

describe('GitLogNameStatusParser', () => {
  it('when options include --name-status, matches', () => {
    const parser = new GitLogNameStatusParser(['--name-status', '-n', '1'])

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --name-status, does not match', () => {
    const parser = new GitLogNameStatusParser(['--name-only'])

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when a commit has status lines, returns each file with its status', () => {
    const parser = new GitLogNameStatusParser(['--name-status'])

    const result = parser.parse(
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nM\tallowed.txt\nA\tnotes.txt\n',
    )

    expect(result.commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        files: [
          { status: 'M', path: 'allowed.txt' },
          { status: 'A', path: 'notes.txt' },
        ],
      },
    ])
  })
})
