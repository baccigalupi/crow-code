import { describe, expect, it } from 'bun:test'
import { GitCountObjectsSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/count-objects.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitCountObjectsSubcommand', () => {
  it('when git count-objects runs, returns typed counts', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '15 objects, 60 kilobytes\n' }),
    })
    const subcommand = new GitCountObjectsSubcommand({
      applicationData,
      operationArguments: { args: [] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      objectCounts: { count: 15, sizeKilobytes: 60 },
    })
  })

  it('when given -v, does not refuse', () => {
    const subcommand = new GitCountObjectsSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-v'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['count-objects', '-v'])
  })

  it('when given -H, refuses naming the allowed flags', () => {
    const subcommand = new GitCountObjectsSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-H'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -H; allowed flags for count-objects: -v',
    )
  })
})
