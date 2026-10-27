import { describe, expect, it } from 'bun:test'
import { GitCheckIgnoreSubcommand } from '../../../../../src/tools/git/read-only/subcommands/check-ignore.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitCheckIgnoreSubcommand', () => {
  it('when git check-ignore runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'build.log\n' }),
    })
    const subcommand = new GitCheckIgnoreSubcommand({
      applicationData,
      operationArguments: { args: ['build.log'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ entries: [{ path: 'build.log' }] })
  })

  it('when given -v and a path, does not refuse', () => {
    const subcommand = new GitCheckIgnoreSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-v', 'a.log'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['check-ignore', '-v', 'a.log'])
    expect(requestedPaths).toEqual(['a.log'])
  })

  it('when given --stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitCheckIgnoreSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--stdin'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --stdin; allowed flags for check-ignore: -v',
    )
  })
})
