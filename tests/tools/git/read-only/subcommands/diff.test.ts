import { describe, expect, it } from 'bun:test'
import { GitDiffSubcommand } from '../../../../../src/tools/git/read-only/subcommands/diff.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitDiffSubcommand', () => {
  it('when given a range and a pathspec, puts no-ext-diff and no-textconv right after the subcommand', () => {
    const subcommand = new GitDiffSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['a..b', '--', 'src/a.ts'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'diff',
      '--no-ext-diff',
      '--no-textconv',
      'a..b',
      '--',
      'src/a.ts',
    ])
  })

  it('when given its allowed flags, does not refuse', () => {
    const subcommand = new GitDiffSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['--cached', '--stat', '--name-only', '--name-status', '-U3'],
      },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --no-index, refuses naming the allowed flags', () => {
    const subcommand = new GitDiffSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--no-index', '/etc/passwd', '/etc/hosts'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --no-index; allowed flags for diff: --cached, --name-only, --name-status, --stat, -U',
    )
  })

  it('when given --output, refuses naming the allowed flags', () => {
    const subcommand = new GitDiffSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--output=f'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f; allowed flags for diff: --cached, --name-only, --name-status, --stat, -U',
    )
  })

  it('when git diffs the working tree, returns typed file diffs', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          'diff --git a/allowed.txt b/allowed.txt\nindex cc1c127..fe4e092 100644\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two\n',
      }),
    })
    const subcommand = new GitDiffSubcommand({
      applicationData,
      operationArguments: { args: [] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      diffs: [
        {
          path: 'allowed.txt',
          kind: 'modified',
          hunks: [
            {
              oldStart: 1,
              oldCount: 1,
              newStart: 1,
              newCount: 1,
              lines: ['-allowed one', '+allowed two'],
            },
          ],
        },
      ],
    })
  })

  it('when git diffs the index, returns typed file diffs', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          'diff --git a/notes.txt b/notes.txt\nnew file mode 100644\nindex 0000000..e1d7e4b\n--- /dev/null\n+++ b/notes.txt\n@@ -0,0 +1 @@\n+notes\n',
      }),
    })
    const subcommand = new GitDiffSubcommand({
      applicationData,
      operationArguments: { args: ['--cached'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      diffs: [
        {
          path: 'notes.txt',
          kind: 'added',
          hunks: [
            {
              oldStart: 0,
              oldCount: 0,
              newStart: 1,
              newCount: 1,
              lines: ['+notes'],
            },
          ],
        },
      ],
    })
  })

  it('when git diffs a revision range for a path, returns typed file diffs', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          'diff --git a/allowed.txt b/allowed.txt\nindex 5a8f3c1..cc1c127 100644\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1,2 +1 @@\n-allowed zero\n allowed one\n',
      }),
    })
    const subcommand = new GitDiffSubcommand({
      applicationData,
      operationArguments: { args: ['a..b', '--', 'allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      diffs: [
        {
          path: 'allowed.txt',
          kind: 'modified',
          hunks: [
            {
              oldStart: 1,
              oldCount: 2,
              newStart: 1,
              newCount: 1,
              lines: ['-allowed zero', ' allowed one'],
            },
          ],
        },
      ],
    })
  })

  it('when given --stat, returns the stat', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          ' allowed.txt | 2 +-\n 1 file changed, 1 insertion(+), 1 deletion(-)\n',
      }),
    })
    const subcommand = new GitDiffSubcommand({
      applicationData,
      operationArguments: { args: ['--stat'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      stat: {
        summary: { changed: 1, insertions: 1, deletions: 1 },
        paths: [{ path: 'allowed.txt', changes: '2 +-' }],
      },
    })
  })

  it('when given --name-only before a pathspec, returns the files', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'allowed.txt\n' }),
    })
    const subcommand = new GitDiffSubcommand({
      applicationData,
      operationArguments: { args: ['--name-only', '--', 'allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ files: [{ path: 'allowed.txt' }] })
  })

  it('when given --name-status, returns the files with status', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'M\tallowed.txt\n' }),
    })
    const subcommand = new GitDiffSubcommand({
      applicationData,
      operationArguments: { args: ['--name-status'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ files: [{ status: 'M', path: 'allowed.txt' }] })
  })

  it('when given --ext-diff, refuses naming the allowed flags', () => {
    const subcommand = new GitDiffSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--ext-diff'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --ext-diff; allowed flags for diff: --cached, --name-only, --name-status, --stat, -U',
    )
  })
})
