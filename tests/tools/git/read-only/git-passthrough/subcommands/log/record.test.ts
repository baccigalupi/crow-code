import { describe, expect, it } from 'bun:test'
import {
  GitLogRecord,
  trimmedLines,
} from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/record.ts'

describe('record', () => {
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

  describe('GitLogRecord', () => {
    it('when the header has the four fields, reads them as the entry', () => {
      const record = new GitLogRecord([
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
      ])

      const entry = record.entry()

      expect(entry).toEqual({
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
      })
    })

    it('when the body has blank lines around it, returns the trimmed body', () => {
      const record = new GitLogRecord([
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
        '',
        'allowed.txt',
        '',
      ])

      const body = record.body()

      expect(body).toEqual(['allowed.txt'])
    })

    it('when there are no lines, has an empty body', () => {
      const record = new GitLogRecord([])

      const body = record.body()

      expect(body).toEqual([])
    })
  })
})
