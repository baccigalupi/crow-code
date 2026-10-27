import { describe, expect, it } from 'bun:test'
import { GitLogPlainParser } from '../../../../../../src/tools/git/read-only/subcommands/log/plain-parser.ts'

describe('GitLogPlainParser', () => {
  it('when output has headers, returns each as a commit', () => {
    const parser = new GitLogPlainParser(
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login\n',
    )

    const result = parser.parse()

    expect(result.commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
      },
      {
        sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
        author: 'Grace',
        date: '2026-10-01T10:00:00+00:00',
        subject: 'Add login',
      },
    ])
  })

  it('when output is empty, returns []', () => {
    const parser = new GitLogPlainParser('')

    const result = parser.parse()

    expect(result.commits).toEqual([])
  })
})
