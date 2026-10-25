import { describe, expect, it } from 'bun:test'
import { GitNameRevSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/name-rev.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitNameRevSubcommand', () => {
  it('when given --name-only, --tags and a revision, does not refuse', () => {
    const subcommand = new GitNameRevSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--name-only', '--tags', 'HEAD'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['name-rev', '--name-only', '--tags', 'HEAD'])
    expect(requestedPaths).toEqual(['HEAD'])
  })

  it('when given --annotate-stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitNameRevSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--annotate-stdin'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --annotate-stdin; allowed flags for name-rev: --name-only, --tags',
    )
  })

  it('when git name-rev runs, returns a typed name', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'main\n' }),
    })
    const subcommand = new GitNameRevSubcommand({
      applicationData,
      operationArguments: { args: ['--name-only', 'HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ name: 'main' })
  })
})
