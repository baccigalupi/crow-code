import { describe, expect, it } from 'bun:test'
import { GitCheckIgnoreSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/check-ignore.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

describe('GitCheckIgnoreSubcommand', () => {
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
