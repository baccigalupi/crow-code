import { describe, expect, it } from 'bun:test'
import { GitLogPatchParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/patch-parser.ts'

describe('GitLogPatchParser', () => {
  it('when options include -p, matches', () => {
    const parser = new GitLogPatchParser(['-p'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include -p, does not match', () => {
    const parser = new GitLogPatchParser(['--oneline'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when a commit has patch lines, joins them into its patch', () => {
    const parser = new GitLogPatchParser(
      ['-p'],
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\ndiff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n',
    )

    const result = parser.parse()

    expect(result.commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        patch: 'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@',
      },
    ])
  })
})
