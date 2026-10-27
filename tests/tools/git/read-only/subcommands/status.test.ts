import { describe, expect, it } from 'bun:test'
import { GitStatusSubcommand } from '../../../../../src/tools/git/read-only/subcommands/status.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitStatusSubcommand', () => {
  it('when given its allowed flags and a pathspec, does not refuse', () => {
    const subcommand = new GitStatusSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: [
          '--porcelain=v2',
          '-s',
          '-b',
          '--untracked-files=all',
          '--',
          'src/a.ts',
        ],
      },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'status',
      '--porcelain=v2',
      '-s',
      '-b',
      '--untracked-files=all',
      '--',
      'src/a.ts',
    ])
  })

  it('when given --ignore-submodules=x, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--ignore-submodules=x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --ignore-submodules=x; allowed flags for status: --porcelain=v2, --untracked-files=all, -b, -s',
    )
  })

  it('when given the --sh abbreviation, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--sh'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --sh; allowed flags for status: --porcelain=v2, --untracked-files=all, -b, -s',
    )
  })

  it('when given --porcelain=v1, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--porcelain=v1'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --porcelain=v1; allowed flags for status: --porcelain=v2, --untracked-files=all, -b, -s',
    )
  })

  it('when given the clustered -sb, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-sb'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -sb; allowed flags for status: --porcelain=v2, --untracked-files=all, -b, -s',
    )
  })

  it('when git status --porcelain=v2 reports a modified file, returns its states', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: '1 .M N... 100644 100644 100644 4e84e5c 4e84e5c notes.txt\n',
      }),
    })
    const subcommand = new GitStatusSubcommand({
      applicationData,
      operationArguments: { args: ['--porcelain=v2'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      changes: [
        { path: 'notes.txt', index: 'unmodified', worktree: 'modified' },
      ],
    })
  })

  it('when git status --porcelain=v2 -s runs, returns its stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: ' M notes.txt\n' }),
    })
    const subcommand = new GitStatusSubcommand({
      applicationData,
      operationArguments: { args: ['--porcelain=v2', '-s'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ stdout: ' M notes.txt\n' })
  })

  it('when git status runs without --porcelain=v2, returns its stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'On branch main\n' }),
    })
    const subcommand = new GitStatusSubcommand({
      applicationData,
      operationArguments: { args: [] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ stdout: 'On branch main\n' })
  })
})
