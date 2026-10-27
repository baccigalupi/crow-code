import { describe, expect, it } from 'bun:test'
import { GitShowSubcommand } from '../../../../../src/tools/git/read-only/subcommands/show.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitShowSubcommand', () => {
  it('when given a revision, builds git show arguments with it', () => {
    const subcommand = new GitShowSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['abc123'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'show',
      '--no-ext-diff',
      '--no-textconv',
      'abc123',
    ])
  })

  it('when given --stat, --name-only and --format, builds git show arguments with them', () => {
    const subcommand = new GitShowSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['--stat', '--name-only', '--format=%H', 'abc123'],
      },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'show',
      '--no-ext-diff',
      '--no-textconv',
      '--stat',
      '--name-only',
      '--format=%H',
      'abc123',
    ])
  })

  it('when given rev:path, requests the path', () => {
    const subcommand = new GitShowSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['abc123:src/a.ts'] },
    })

    const paths = subcommand.requestedPaths()

    expect(paths).toEqual(['abc123', 'src/a.ts'])
  })

  it('when given --output, refuses naming the allowed flags', () => {
    const subcommand = new GitShowSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--output=f', 'abc123'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f; allowed flags for show: --format, --name-only, --stat',
    )
  })

  it('when git shows a revision, returns typed file diffs', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          'commit 4f5cf85\nAuthor: A <a@b>\nDate:   Fri Oct 23 2026\n\n    Change\n\ndiff --git a/allowed.txt b/allowed.txt\nindex cc1c127..fe4e092 100644\n--- a/allowed.txt\n+++ b/allowed.txt\n@@ -1 +1 @@\n-allowed one\n+allowed two\n',
      }),
    })
    const subcommand = new GitShowSubcommand({
      applicationData,
      operationArguments: { args: ['abc123'] },
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

  it('when git shows rev:path, returns the path and text', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'allowed one\n' }),
    })
    const subcommand = new GitShowSubcommand({
      applicationData,
      operationArguments: { args: ['abc123:allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ path: 'allowed.txt', text: 'allowed one\n' })
  })

  it('when given --stat, returns stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'commit 4f5cf85\n\n allowed.txt | 2 +-\n',
      }),
    })
    const subcommand = new GitShowSubcommand({
      applicationData,
      operationArguments: { args: ['--stat', 'abc123'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      stdout: 'commit 4f5cf85\n\n allowed.txt | 2 +-\n',
    })
  })

  it('when given --name-only, returns stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'commit 4f5cf85\n\nallowed.txt\n' }),
    })
    const subcommand = new GitShowSubcommand({
      applicationData,
      operationArguments: { args: ['--name-only', 'abc123'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ stdout: 'commit 4f5cf85\n\nallowed.txt\n' })
  })
})
