import { describe, expect, it } from 'bun:test'
import { GitBlameSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/blame.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

describe('GitBlameSubcommand', () => {
  it('when given --porcelain and a file, builds git blame arguments with them', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--porcelain', '--', 'src/a.ts'] },
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['blame', '--porcelain', '--', 'src/a.ts'])
  })

  it('when given -L, -w and a revision, does not refuse', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: {
        args: ['-L', '1,5', '-w', 'abc123', '--', 'src/a.ts'],
      },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --contents, requests its path along with the file', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['--contents=notes.txt', '--', 'src/a.ts'] },
    })

    const paths = subcommand.requestedPaths()

    expect(paths).toEqual(['notes.txt', 'src/a.ts'])
  })

  it('when given -C, refuses naming the allowed flags', () => {
    const subcommand = new GitBlameSubcommand({
      applicationData: mockApplicationData(),
      operationArguments: { args: ['-C', '../x', '--', 'src/a.ts'] },
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -C; allowed flags for blame: --contents, --porcelain, -L, -w',
    )
  })
})
