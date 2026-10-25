import { describe, expect, it } from 'bun:test'
import { GitRevParseSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-parse.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitRevParseSubcommand', () => {
  it('when given --verify, --short and a revision, does not refuse', () => {
    const subcommand = new GitRevParseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--verify', '--short', 'HEAD'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['rev-parse', '--verify', '--short', 'HEAD'])
    expect(requestedPaths).toEqual(['HEAD'])
  })

  it('when given --abbrev-ref, does not refuse', () => {
    const subcommand = new GitRevParseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--abbrev-ref', 'HEAD'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --show-toplevel and --is-inside-work-tree, does not refuse', () => {
    const subcommand = new GitRevParseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['--show-toplevel', '--is-inside-work-tree'],
      },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --git-dir, refuses naming the allowed flags', () => {
    const subcommand = new GitRevParseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--git-dir'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --git-dir; allowed flags for rev-parse: --abbrev-ref, --is-inside-work-tree, --short, --show-toplevel, --verify',
    )
  })

  it('when given --git-path, refuses naming the allowed flags', () => {
    const subcommand = new GitRevParseSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--git-path', 'hooks'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --git-path; allowed flags for rev-parse: --abbrev-ref, --is-inside-work-tree, --short, --show-toplevel, --verify',
    )
  })

  it('when git rev-parse runs, returns typed values', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'true\nmain\n' }),
    })
    const subcommand = new GitRevParseSubcommand({
      applicationData,
      operationArguments: {
        args: ['--is-inside-work-tree', '--abbrev-ref', 'HEAD'],
      },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ values: ['true', 'main'] })
  })
})
