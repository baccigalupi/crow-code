import { describe, expect, it } from 'bun:test'
import { GitLogRecords } from '../../../../../../src/tools/git/read-only/subcommands/log/records.ts'

describe('GitLogRecords', () => {
  it('when output is empty, has no records', () => {
    const records = new GitLogRecords('')

    const result = records.records()

    expect(result).toHaveLength(0)
  })

  it('when no line is a commit header, has no records', () => {
    const records = new GitLogRecords(
      'abc1234\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fShort sha\n',
    )

    const result = records.records()

    expect(result).toHaveLength(0)
  })

  it('when output has two headers, splits a record at each', () => {
    const records = new GitLogRecords(
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nallowed.txt\n\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login\n',
    )

    const result = records.records()

    expect(result).toMatchObject([
      {
        header:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
        lines: ['', 'allowed.txt', ''],
      },
      {
        header:
          'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login',
        lines: [''],
      },
    ])
  })

  it('when lines come before the first header, leaves them out', () => {
    const records = new GitLogRecords(
      'warning: something\n7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n',
    )

    const result = records.records()

    expect(result).toMatchObject([
      {
        header:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
        lines: [''],
      },
    ])
  })
})
