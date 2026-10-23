import { describe, expect, it } from 'bun:test'
import { GitStatusSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/status.ts'

describe('GitStatusSubcommand', () => {
  it('when given its allowed flags and a pathspec, does not refuse', () => {
    const subcommand = new GitStatusSubcommand({
      args: ['--porcelain=v2', '-s', '-b', '--', 'src/a.ts'],
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'status',
      '--porcelain=v2',
      '-s',
      '-b',
      '--',
      'src/a.ts',
    ])
  })

  it('when given --ignore-submodules=x, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({
      args: ['--ignore-submodules=x'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --ignore-submodules=x; allowed flags for status: --porcelain=v2, -b, -s',
    )
  })

  it('when given the --sh abbreviation, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({ args: ['--sh'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --sh; allowed flags for status: --porcelain=v2, -b, -s',
    )
  })

  it('when given --porcelain=v1, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({ args: ['--porcelain=v1'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --porcelain=v1; allowed flags for status: --porcelain=v2, -b, -s',
    )
  })

  it('when given the clustered -sb, refuses naming the allowed flags', () => {
    const subcommand = new GitStatusSubcommand({ args: ['-sb'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -sb; allowed flags for status: --porcelain=v2, -b, -s',
    )
  })
})
