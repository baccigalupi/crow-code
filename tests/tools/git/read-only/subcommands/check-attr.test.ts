import { describe, expect, it } from 'bun:test'
import { GitCheckAttrSubcommand } from '../../../../../src/tools/git/read-only/subcommands/check-attr.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitCheckAttrSubcommand', () => {
  it('when git check-attr -a runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'allowed.txt: diff: set\nallowed.txt: text: set\n',
      }),
    })
    const subcommand = new GitCheckAttrSubcommand({
      applicationData,
      operationArguments: { args: ['-a', 'allowed.txt'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [
        { path: 'allowed.txt', attribute: 'diff', value: 'set' },
        { path: 'allowed.txt', attribute: 'text', value: 'set' },
      ],
    })
  })

  it('when given -a and a path, does not refuse', () => {
    const subcommand = new GitCheckAttrSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-a', 'a.ts'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['check-attr', '-a', 'a.ts'])
  })

  it('when given --all and a path after --, does not refuse', () => {
    const subcommand = new GitCheckAttrSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--all', '--', 'a.ts'] },
    })

    const refusal = subcommand.refusal()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(requestedPaths).toEqual(['a.ts'])
  })

  it('when given --stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitCheckAttrSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--stdin'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --stdin; allowed flags for check-attr: --all, -a',
    )
  })

  it('when given -z, refuses', () => {
    const subcommand = new GitCheckAttrSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-z', 'a.ts'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -z; allowed flags for check-attr: --all, -a',
    )
  })
})
