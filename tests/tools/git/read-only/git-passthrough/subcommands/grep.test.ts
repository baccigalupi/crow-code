import { describe, expect, it } from 'bun:test'
import { GitGrepSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/grep.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

describe('GitGrepSubcommand', () => {
  it('when given allowed flags, a pattern, a revision and a path, does not refuse', () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-n', '-i', '-efoo', 'HEAD', '--', 'src'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'grep',
      '-n',
      '-i',
      '-efoo',
      'HEAD',
      '--',
      'src',
    ])
    expect(requestedPaths).toEqual(['HEAD', 'src'])
  })

  it('when given -O, refuses naming the allowed flags', () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-O'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -O; allowed flags for grep: -E, -F, -c, -e, -i, -l, -n, -w',
    )
  })

  it('when given --open-files-in-pager, refuses naming the allowed flags', () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--open-files-in-pager'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --open-files-in-pager; allowed flags for grep: -E, -F, -c, -e, -i, -l, -n, -w',
    )
  })

  it('when given --no-index, refuses naming the allowed flags', () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--no-index'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --no-index; allowed flags for grep: -E, -F, -c, -e, -i, -l, -n, -w',
    )
  })

  it('when given -f, refuses naming the allowed flags', () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-f'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -f; allowed flags for grep: -E, -F, -c, -e, -i, -l, -n, -w',
    )
  })
})
