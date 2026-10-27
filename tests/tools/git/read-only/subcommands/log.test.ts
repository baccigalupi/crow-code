import { describe, expect, it } from 'bun:test'
import { GitLogSubcommand } from '../../../../../src/tools/git/read-only/subcommands/log.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitLogSubcommand', () => {
  it('when given --oneline, -n and a pathspec, builds git log arguments with them', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--oneline', '-n', '5', '--', 'src/a.ts'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const paths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'log',
      '--oneline',
      '-n',
      '5',
      '--format=%H%x1f%an%x1f%aI%x1f%s',
      '--',
      'src/a.ts',
    ])
    expect(paths).toEqual(['src/a.ts'])
  })

  it('when given a user --format, puts the fixed format after it', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--format=%h'] },
    })

    const gitArguments = subcommand.gitArguments()

    expect(gitArguments).toEqual([
      'log',
      '--format=%h',
      '--format=%H%x1f%an%x1f%aI%x1f%s',
    ])
  })

  it('when given a revision and no pathspec, appends the fixed format', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['HEAD~3'] },
    })

    const gitArguments = subcommand.gitArguments()

    expect(gitArguments).toEqual([
      'log',
      'HEAD~3',
      '--format=%H%x1f%an%x1f%aI%x1f%s',
    ])
  })

  it('when stdout has commit headers, types them as commits', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\x1fGrace\x1f2026-10-01T10:00:00+00:00\x1fAdd login\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: [] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
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
      ],
    })
  })

  it('when git fails, has no commits', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: 'fatal: bad revision',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: [] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ commits: [] })
  })

  it('when given --name-only, attaches file paths', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nallowed.txt\nnotes.txt\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--name-only'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          files: [{ path: 'allowed.txt' }, { path: 'notes.txt' }],
        },
      ],
    })
  })

  it('when given --name-status, attaches file paths with status', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nM\tallowed.txt\nA\tnotes.txt\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--name-status'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
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
      ],
    })
  })

  it('when given --stat, attaches the stat paths and summary', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--stat'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
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
      ],
    })
  })

  it('when given -p, attaches the patch', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\ndiff --git a/allowed.txt b/allowed.txt\nindex cc1c127..fe4e092 100644\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['-p'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          patch:
            'diff --git a/allowed.txt b/allowed.txt\nindex cc1c127..fe4e092 100644\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two',
        },
      ],
    })
  })

  it('when given --stat and -p, attaches both', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n---\n allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n\ndiff --git a/allowed.txt b/allowed.txt\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--stat', '-p'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
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
            'diff --git a/allowed.txt b/allowed.txt\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two',
        },
      ],
    })
  })

  it('when given --name-status with --stat and -p, attaches only files', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nM\tallowed.txt\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--name-status', '--stat', '-p'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          files: [{ status: 'M', path: 'allowed.txt' }],
        },
      ],
    })
  })

  it('when given --name-only with --stat, attaches only files', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n\nallowed.txt\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--name-only', '--stat'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          files: [{ path: 'allowed.txt' }],
        },
      ],
    })
  })

  it('when a flag appears after the double dash, it does not pick a shape', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\x1fAda\x1f2026-10-02T11:00:00+00:00\x1fFix tests\n',
      }),
    })
    const subcommand = new GitLogSubcommand({
      applicationData,
      operationArguments: { args: ['--', '--stat'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
        },
      ],
    })
  })

  it('when given the arguments GitLogHistory builds, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['--format=%H%x1f%an%x1f%aI%x1f%s', '-n', '20'],
      },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --stat, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--stat'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --name-only, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--name-only'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --name-status, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--name-status'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --follow, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--follow'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --no-merges, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--no-merges'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -p, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-p'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --output=f, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--output=f'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given --ext-diff, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--ext-diff'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --ext-diff; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given -C, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-C', '..'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -C; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given -c core.pager=x, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-c', 'core.pager=x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -c; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given the abbreviated --out=f, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--out=f'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --out=f; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when -n has a non-numeric value, refuses', () => {
    const subcommand = new GitLogSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-n', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('flag value not a number: -n x')
  })
})
