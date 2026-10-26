import { describe, expect, it, mock } from 'bun:test'
import { GitGrepSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/grep.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

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

  it('when git grep runs, returns typed matches', async () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData({
        command: mockCommand({ stdout: 'allowed.txt:1:allowed two\n' }),
      }),
      operationArguments: { args: ['-n', '-e', 'allowed'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      matches: [{ path: 'allowed.txt', line: 1, text: 'allowed two' }],
    })
  })

  it('when git grep -c runs, returns typed counts', async () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData({
        command: mockCommand({ stdout: 'allowed.txt:1\n' }),
      }),
      operationArguments: { args: ['-c', '-e', 'allowed'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ counts: [{ path: 'allowed.txt', count: 1 }] })
  })

  it('when git grep -l runs, returns raw stdout', async () => {
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData({
        command: mockCommand({ stdout: 'allowed.txt\n' }),
      }),
      operationArguments: { args: ['-l', '-e', 'allowed'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ stdout: 'allowed.txt\n' })
  })

  it('when a path is outside permissions, refuses without running git', async () => {
    const commandSpy = mock()
    const subcommand = new GitGrepSubcommand({
      applicationData: mockApplicationData({
        command: mockCommand({ commandSpy }),
      }),
      operationArguments: { args: ['-e', 'a', '--', '../x'] },
    })

    await subcommand.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(subcommand.success()).toBe(false)
    expect(subcommand.reason).toBe('path not allowed: ../x')
  })
})
