import { describe, expect, it } from 'bun:test'
import { GitLsFilesSubcommand } from '../../../../../src/tools/git/read-only/subcommands/ls-files.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('GitLsFilesSubcommand', () => {
  it('when given its allowed flags and a pathspec, does not refuse', () => {
    const subcommand = new GitLsFilesSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: [
          '-s',
          '-m',
          '-o',
          '--others',
          '--exclude-standard',
          '-z',
          '--',
          'src/a.ts',
        ],
      },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'ls-files',
      '-s',
      '-m',
      '-o',
      '--others',
      '--exclude-standard',
      '-z',
      '--',
      'src/a.ts',
    ])
  })

  it('when given --with-tree, refuses naming the allowed flags', () => {
    const subcommand = new GitLsFilesSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--with-tree=HEAD'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --with-tree=HEAD; allowed flags for ls-files: --exclude-standard, --others, -m, -o, -s, -z',
    )
  })

  it('when given --exclude-from, refuses naming the allowed flags', () => {
    const subcommand = new GitLsFilesSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--exclude-from=f'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --exclude-from=f; allowed flags for ls-files: --exclude-standard, --others, -m, -o, -s, -z',
    )
  })

  it('when git ls-files -s runs, returns typed entries', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout:
          '100644 fe4e0926999e7629315c1e020561a5025c67b41b 0\tallowed.txt\n',
      }),
    })
    const subcommand = new GitLsFilesSubcommand({
      applicationData,
      operationArguments: { args: ['-s'] },
    })

    await subcommand.run()
    const result = subcommand.result()

    expect(result).toEqual({
      entries: [
        {
          path: 'allowed.txt',
          mode: '100644',
          sha: 'fe4e0926999e7629315c1e020561a5025c67b41b',
          stage: 0,
        },
      ],
    })
  })
})
