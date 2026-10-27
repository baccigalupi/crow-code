import { describe, expect, it } from 'bun:test'
import { GitForEachRefSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/for-each-ref.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../../support/mock-command.ts'

describe('GitForEachRefSubcommand', () => {
  it('when git for-each-ref runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '0fbf7f4404cfacce4dac0cc459c533c4475f1510 tag\trefs/tags/v1.0\n',
      }),
    })
    const subcommand = new GitForEachRefSubcommand({
      applicationData,
      operationArguments: { args: [] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [
        {
          name: 'refs/tags/v1.0',
          sha: '0fbf7f4404cfacce4dac0cc459c533c4475f1510',
          kind: 'tag',
          objectType: 'tag',
        },
      ],
    })
  })

  it('when git for-each-ref --format runs, returns stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'refs/heads/main\n' }),
    })
    const subcommand = new GitForEachRefSubcommand({
      applicationData,
      operationArguments: { args: ['--format=%(refname)'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ stdout: 'refs/heads/main\n' })
  })

  it('when git for-each-ref --shell runs, returns stdout', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          "'0fbf7f4404cfacce4dac0cc459c533c4475f1510' 'tag'\t'refs/tags/v1.0'\n",
      }),
    })
    const subcommand = new GitForEachRefSubcommand({
      applicationData,
      operationArguments: { args: ['--shell'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      stdout:
        "'0fbf7f4404cfacce4dac0cc459c533c4475f1510' 'tag'\t'refs/tags/v1.0'\n",
    })
  })

  it('when given --format, --sort, --count and a pattern, does not refuse', () => {
    const subcommand = new GitForEachRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: [
          '--format=%(refname)',
          '--sort=-committerdate',
          '--count',
          '5',
          'refs/heads',
        ],
      },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'for-each-ref',
      '--format=%(refname)',
      '--sort=-committerdate',
      '--count',
      '5',
      'refs/heads',
    ])
  })

  it('when given --contains and --merged, does not refuse', () => {
    const subcommand = new GitForEachRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--contains', 'HEAD', '--merged', 'main'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when --count is not a number, refuses naming the value', () => {
    const subcommand = new GitForEachRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--count', 'x'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('flag value not a number: --count x')
  })

  it('when given --color, refuses naming the allowed flags', () => {
    const subcommand = new GitForEachRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--color=always'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --color=always; allowed flags for for-each-ref: --contains, --count, --format, --ignore-case, --merged, --no-contains, --no-merged, --perl, --points-at, --python, --shell, --sort, --tcl, -p, -s',
    )
  })
})
