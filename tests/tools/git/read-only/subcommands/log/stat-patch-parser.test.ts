import { describe, expect, it } from 'bun:test'
import { GitLogStatPatchParser } from '../../../../../../src/tools/git/read-only/subcommands/log/stat-patch-parser.ts'

describe('GitLogStatPatchParser', () => {
  describe('isMatch', () => {
    it('when options include --stat and -p, matches', () => {
      const parser = new GitLogStatPatchParser(['-p', '--stat'], '')

      const match = parser.isMatch()

      expect(match).toBe(true)
    })

    it('when options include only --stat, does not match', () => {
      const parser = new GitLogStatPatchParser(['--stat'], '')

      const match = parser.isMatch()

      expect(match).toBe(false)
    })

    it('when options include only -p, does not match', () => {
      const parser = new GitLogStatPatchParser(['-p'], '')

      const match = parser.isMatch()

      expect(match).toBe(false)
    })
  })

  describe('parse', () => {
    it('when the stat follows a --- line, splits the stat from the patch', () => {
      const parser = new GitLogStatPatchParser(
        ['--stat', '-p'],
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n---\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n\ndiff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n',
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
          patch: 'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@',
        },
      ])
    })

    it('when there is no --- line, still splits the stat from the patch', () => {
      const parser = new GitLogStatPatchParser(
        ['--stat', '-p'],
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n\ndiff --git a/allowed.txt b/allowed.txt\n',
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
          patch: 'diff --git a/allowed.txt b/allowed.txt',
        },
      ])
    })

    it('when there is no patch after the stat, the patch is empty', () => {
      const parser = new GitLogStatPatchParser(
        ['--stat', '-p'],
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n---\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
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
          patch: '',
        },
      ])
    })
  })
})
