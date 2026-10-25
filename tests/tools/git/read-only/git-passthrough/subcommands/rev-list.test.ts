import { describe, expect, it } from 'bun:test'
import { GitRevListSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-list.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitRevListSubcommand', () => {
  it('when given --count and a revision, does not refuse', () => {
    const subcommand = new GitRevListSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--count', 'HEAD'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['rev-list', '--count', 'HEAD'])
    expect(requestedPaths).toEqual(['HEAD'])
  })

  it('when given --objects and --all, does not refuse', () => {
    const subcommand = new GitRevListSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--objects', '--all'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitRevListSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--stdin'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --stdin; allowed flags for rev-list: --all, --count, --objects',
    )
  })

  it('when git rev-list --all runs, returns typed shas', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '7f2203f286226e6c29da25b8edb35b13a7efa7c6\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\n',
      }),
    })
    const subcommand = new GitRevListSubcommand({
      applicationData,
      operationArguments: { args: ['--all'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      shas: [
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
      ],
    })
  })

  it('when git rev-list --count runs, returns typed count', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '8\n' }),
    })
    const subcommand = new GitRevListSubcommand({
      applicationData,
      operationArguments: { args: ['--count', '--objects', 'HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ count: 8 })
  })

  it('when git rev-list --objects runs, returns typed objects', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'fe4e0926999e7629315c1e020561a5025c67b41b allowed.txt\n',
      }),
    })
    const subcommand = new GitRevListSubcommand({
      applicationData,
      operationArguments: { args: ['--objects', 'HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      objects: [
        {
          sha: 'fe4e0926999e7629315c1e020561a5025c67b41b',
          path: 'allowed.txt',
        },
      ],
    })
  })
})
