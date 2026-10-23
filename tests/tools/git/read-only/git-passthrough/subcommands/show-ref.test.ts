import { describe, expect, it } from 'bun:test'
import { GitShowRefSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/show-ref.ts'
import { mockApplicationData } from '../../../../../support/mock-application-data.ts'

describe('GitShowRefSubcommand', () => {
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
