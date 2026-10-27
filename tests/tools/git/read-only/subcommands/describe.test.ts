import { describe, expect, it } from 'bun:test'
import { GitDescribeSubcommand } from '../../../../../src/tools/git/read-only/subcommands/describe.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitDescribeSubcommand', () => {
  it('when given a commit-ish, does not refuse', () => {
    const subcommand = new GitDescribeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['HEAD'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['describe', 'HEAD'])
    expect(requestedPaths).toEqual(['HEAD'])
  })

  it('when given --dirty, refuses naming that no flags are allowed', () => {
    const subcommand = new GitDescribeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--dirty'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --dirty; allowed flags for describe: none',
    )
  })

  it('when git describe runs, returns a typed name', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '569b637\n' }),
    })
    const subcommand = new GitDescribeSubcommand({
      applicationData,
      operationArguments: { args: ['HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ name: '569b637' })
  })
})
