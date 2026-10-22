import { describe, expect, it } from 'bun:test'
import { GitShowSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/show.ts'

describe('GitShowSubcommand', () => {
  it('when given a revision, builds git show arguments with it', () => {
    const subcommand = new GitShowSubcommand({ args: ['abc123'] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['show', 'abc123'])
  })

  it('when given --stat, --name-only and --format, builds git show arguments with them', () => {
    const subcommand = new GitShowSubcommand({
      args: ['--stat', '--name-only', '--format=%H', 'abc123'],
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'show',
      '--stat',
      '--name-only',
      '--format=%H',
      'abc123',
    ])
  })

  it('when given rev:path, requests the path', () => {
    const subcommand = new GitShowSubcommand({ args: ['abc123:src/a.ts'] })

    const paths = subcommand.requestedPaths()

    expect(paths).toEqual(['abc123', 'src/a.ts'])
  })

  it('when given --output, refuses naming the allowed flags', () => {
    const subcommand = new GitShowSubcommand({
      args: ['--output=f', 'abc123'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f; allowed flags for show: --format, --name-only, --stat',
    )
  })
})
