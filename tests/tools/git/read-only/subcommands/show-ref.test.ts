import { describe, expect, it } from 'bun:test'
import { GitShowRefSubcommand } from '../../../../../src/tools/git/read-only/subcommands/show-ref.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitShowRefSubcommand', () => {
  it('when git show-ref --heads runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          'ffd175847ab5c34abf8e3a66c4bab26b9ef87939 refs/heads/feature\n7f2203f286226e6c29da25b8edb35b13a7efa7c6 refs/heads/main\n',
      }),
    })
    const subcommand = new GitShowRefSubcommand({
      applicationData,
      operationArguments: { args: ['--heads'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [
        {
          name: 'refs/heads/feature',
          sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
          kind: 'branch',
        },
        {
          name: 'refs/heads/main',
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          kind: 'branch',
        },
      ],
    })
  })

  it('when git show-ref -s runs, returns shas', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\n7f2203f286226e6c29da25b8edb35b13a7efa7c6\n',
      }),
    })
    const subcommand = new GitShowRefSubcommand({
      applicationData,
      operationArguments: { args: ['-s', '--heads'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      shas: [
        'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
      ],
    })
  })

  it('when git show-ref --hash runs, returns shas', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: '7f2203f286226e6c29da25b8edb35b13a7efa7c6\n',
      }),
    })
    const subcommand = new GitShowRefSubcommand({
      applicationData,
      operationArguments: { args: ['--hash', 'refs/heads/main'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      shas: ['7f2203f286226e6c29da25b8edb35b13a7efa7c6'],
    })
  })

  it('when given --heads, --tags and a pattern, does not refuse', () => {
    const subcommand = new GitShowRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['--heads', '--tags', '--', 'refs/heads/main'],
      },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'show-ref',
      '--heads',
      '--tags',
      '--',
      'refs/heads/main',
    ])
    expect(requestedPaths).toEqual(['refs/heads/main'])
  })

  it('when given the output and verification flags, does not refuse', () => {
    const subcommand = new GitShowRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['--verify', '--head', '-d', '-s', '--abbrev', '-q', 'HEAD'],
      },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --exclude-existing, refuses naming the allowed flags', () => {
    const subcommand = new GitShowRefSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--exclude-existing'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --exclude-existing; allowed flags for show-ref: --abbrev, --dereference, --hash, --head, --heads, --quiet, --tags, --verify, -d, -q, -s',
    )
  })
})
