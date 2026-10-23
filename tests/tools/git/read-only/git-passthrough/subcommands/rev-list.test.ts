import { describe, expect, it } from 'bun:test'
import { GitRevListSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-list.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

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
})
