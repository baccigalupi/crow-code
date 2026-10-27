import { describe, expect, it } from 'bun:test'
import { GitLsTreeSubcommand } from '../../../../../src/tools/git/read-only/subcommands/ls-tree.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitLsTreeSubcommand', () => {
  it('when given its allowed flags, a tree and a pathspec, does not refuse', () => {
    const subcommand = new GitLsTreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-r', '--name-only', 'HEAD', '--', 'src'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'ls-tree',
      '-r',
      '--name-only',
      'HEAD',
      '--',
      'src',
    ])
    expect(requestedPaths).toEqual(['HEAD', 'src'])
  })

  it('when given --full-tree, refuses naming the allowed flags', () => {
    const subcommand = new GitLsTreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--full-tree'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --full-tree; allowed flags for ls-tree: --name-only, -r',
    )
  })

  it('when given -z, refuses naming the allowed flags', () => {
    const subcommand = new GitLsTreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-z'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -z; allowed flags for ls-tree: --name-only, -r',
    )
  })

  it('when given --abbrev, refuses naming the allowed flags', () => {
    const subcommand = new GitLsTreeSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--abbrev'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --abbrev; allowed flags for ls-tree: --name-only, -r',
    )
  })

  it('when git ls-tree runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '100644 blob fe4e0926999e7629315c1e020561a5025c67b41b\tallowed.txt\n',
      }),
    })
    const subcommand = new GitLsTreeSubcommand({
      applicationData,
      operationArguments: { args: ['HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [
        {
          path: 'allowed.txt',
          mode: '100644',
          kind: 'blob',
          sha: 'fe4e0926999e7629315c1e020561a5025c67b41b',
        },
      ],
    })
  })

  it('when git ls-tree --name-only runs, returns path entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'allowed.txt\n' }),
    })
    const subcommand = new GitLsTreeSubcommand({
      applicationData,
      operationArguments: { args: ['--name-only', 'HEAD'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({ entries: [{ path: 'allowed.txt' }] })
  })
})
