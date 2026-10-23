import { describe, expect, it } from 'bun:test'
import { GitLsFilesSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-files.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

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
})
