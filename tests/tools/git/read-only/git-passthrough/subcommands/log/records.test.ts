import { describe, expect, it } from 'bun:test'
import {
  GitLogRecords,
  trimmedLines,
} from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/records.ts'

describe('records', () => {
  describe('trimmedLines', () => {
    it('when lines start and end blank, drops the outer blanks and keeps inner ones', () => {
      const lines = ['', '', 'a', '', 'b', '']

      const trimmed = trimmedLines(lines)

      expect(trimmed).toEqual(['a', '', 'b'])
    })

    it('when every line is blank, returns []', () => {
      const lines = ['', '']

      const trimmed = trimmedLines(lines)

      expect(trimmed).toEqual([])
    })

    it('when there are no lines, returns []', () => {
      const lines: string[] = []

      const trimmed = trimmedLines(lines)

      expect(trimmed).toEqual([])
    })
  })

  describe('GitLogRecords', () => {
    it('when stdout is empty, has no records', () => {
      const records = new GitLogRecords('')

      const result = records.records()

      expect(result).toEqual([])
    })

    it('when no line is a commit header, has no records', () => {
      const records = new GitLogRecords(
        'abc1234\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fShort sha\n',
      )

      const result = records.records()

      expect(result).toEqual([])
    })

    it('when stdout has two headers, splits a record at each with its trimmed body', () => {
      const records = new GitLogRecords(
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nallowed.txt\n\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login\n',
      )

      const result = records.records()

      expect(result).toEqual([
        {
          header:
            '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
          body: ['allowed.txt'],
        },
        {
          header:
            'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login',
          body: [],
        },
      ])
    })

    it('when lines come before the first header, leaves them out', () => {
      const records = new GitLogRecords(
        'warning: something\n7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n',
      )

      const result = records.records()

      expect(result).toEqual([
        {
          header:
            '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
          body: [],
        },
      ])
    })
  })
})
