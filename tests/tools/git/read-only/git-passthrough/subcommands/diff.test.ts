import { describe, expect, it } from 'bun:test'
import { GitDiffSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/diff.ts'

describe('GitDiffSubcommand', () => {
  it('when given a range and a pathspec, puts no-ext-diff and no-textconv right after the subcommand', () => {
    const subcommand = new GitDiffSubcommand({
      args: ['a..b', '--', 'src/a.ts'],
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'diff',
      '--no-ext-diff',
      '--no-textconv',
      'a..b',
      '--',
      'src/a.ts',
    ])
  })

  it('when given its allowed flags, does not refuse', () => {
    const subcommand = new GitDiffSubcommand({
      args: ['--cached', '--stat', '--name-only', '--name-status', '-U3'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --no-index, refuses naming the allowed flags', () => {
    const subcommand = new GitDiffSubcommand({
      args: ['--no-index', '/etc/passwd', '/etc/hosts'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --no-index; allowed flags for diff: --cached, --name-only, --name-status, --stat, -U',
    )
  })

  it('when given --output, refuses naming the allowed flags', () => {
    const subcommand = new GitDiffSubcommand({ args: ['--output=f'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f; allowed flags for diff: --cached, --name-only, --name-status, --stat, -U',
    )
  })

  it('when given --ext-diff, refuses naming the allowed flags', () => {
    const subcommand = new GitDiffSubcommand({ args: ['--ext-diff'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --ext-diff; allowed flags for diff: --cached, --name-only, --name-status, --stat, -U',
    )
  })
})
