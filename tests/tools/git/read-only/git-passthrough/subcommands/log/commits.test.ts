import { describe, expect, it } from 'bun:test'
import { GitLogCommits } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/commits.ts'

describe('GitLogCommits', () => {
  it('when the shape is none, returns each header as a commit', () => {
    const logCommits = new GitLogCommits({
      stdout:
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login\n',
      shape: 'none',
    })

    const commits = logCommits.commits()

    expect(commits).toEqual([
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

  it('when the stdout is empty, returns []', () => {
    const logCommits = new GitLogCommits({ stdout: '', shape: 'none' })

    const commits = logCommits.commits()

    expect(commits).toEqual([])
  })

  it('when the shape is name-only, attaches each body line as a file path', () => {
    const logCommits = new GitLogCommits({
      stdout:
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nallowed.txt\nnotes.txt\n',
      shape: 'name-only',
    })

    const commits = logCommits.commits()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        files: [{ path: 'allowed.txt' }, { path: 'notes.txt' }],
      },
    ])
  })

  it('when the shape is name-status, attaches each file with its status', () => {
    const logCommits = new GitLogCommits({
      stdout:
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nM\tallowed.txt\nA\tnotes.txt\n',
      shape: 'name-status',
    })

    const commits = logCommits.commits()

    expect(commits).toEqual([
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

  it('when the shape is stat, attaches the stat', () => {
    const logCommits = new GitLogCommits({
      stdout:
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
      shape: 'stat',
    })

    const commits = logCommits.commits()

    expect(commits).toEqual([
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

  it('when the shape is patch, attaches the body as the patch', () => {
    const logCommits = new GitLogCommits({
      stdout:
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\ndiff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\n',
      shape: 'patch',
    })

    const commits = logCommits.commits()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        patch:
          'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
      },
    ])
  })

  describe('when the shape is stat-patch', () => {
    it('when the stat follows a --- line, splits the stat from the patch', () => {
      const logCommits = new GitLogCommits({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n---\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n\ndiff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\n',
        shape: 'stat-patch',
      })

      const commits = logCommits.commits()

      expect(commits).toEqual([
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          stat: {
            summary: { changed: 1, insertions: 1, deletions: 1 },
            paths: [{ path: 'allowed.txt', changes: '2 +-' }],
          },
          patch:
            'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
        },
      ])
    })

    it('when there is no --- line, still splits the stat from the patch', () => {
      const logCommits = new GitLogCommits({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n\ndiff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\n',
        shape: 'stat-patch',
      })

      const commits = logCommits.commits()

      expect(commits).toEqual([
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          stat: {
            summary: { changed: 1, insertions: 1, deletions: 1 },
            paths: [{ path: 'allowed.txt', changes: '2 +-' }],
          },
          patch:
            'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
        },
      ])
    })

    it('when there is no patch after the stat, the patch is empty', () => {
      const logCommits = new GitLogCommits({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n---\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
        shape: 'stat-patch',
      })

      const commits = logCommits.commits()

      expect(commits).toEqual([
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
