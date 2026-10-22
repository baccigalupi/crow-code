import { describe, expect, it } from 'bun:test'
import { GitLogSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log.ts'

describe('GitLogSubcommand', () => {
  it('when given --oneline, -n and a pathspec, builds git log arguments with them', () => {
    const subcommand = new GitLogSubcommand({
      args: ['--oneline', '-n', '5', '--', 'src/a.ts'],
    })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()
    const paths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual([
      'log',
      '--oneline',
      '-n',
      '5',
      '--',
      'src/a.ts',
    ])
    expect(paths).toEqual(['src/a.ts'])
  })

  it('when given the arguments GitLogHistory builds, does not refuse', () => {
    const subcommand = new GitLogSubcommand({
      args: ['--format=%H%x1f%an%x1f%aI%x1f%s', '-n', '20'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --stat, does not refuse', () => {
    const subcommand = new GitLogSubcommand({ args: ['--stat'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --name-only, does not refuse', () => {
    const subcommand = new GitLogSubcommand({ args: ['--name-only'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --name-status, does not refuse', () => {
    const subcommand = new GitLogSubcommand({ args: ['--name-status'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --follow, does not refuse', () => {
    const subcommand = new GitLogSubcommand({ args: ['--follow'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --no-merges, does not refuse', () => {
    const subcommand = new GitLogSubcommand({ args: ['--no-merges'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -p, does not refuse', () => {
    const subcommand = new GitLogSubcommand({ args: ['-p'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --output=f, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({ args: ['--output=f'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given --ext-diff, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({ args: ['--ext-diff'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --ext-diff; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given -C, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({ args: ['-C', '..'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -C; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given -c core.pager=x, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({ args: ['-c', 'core.pager=x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -c; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when given the abbreviated --out=f, refuses naming the allowed flags', () => {
    const subcommand = new GitLogSubcommand({ args: ['--out=f'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --out=f; allowed flags for log: --follow, --format, --name-only, --name-status, --no-merges, --oneline, --stat, -n, -p',
    )
  })

  it('when -n has a non-numeric value, refuses', () => {
    const subcommand = new GitLogSubcommand({ args: ['-n', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('flag value not a number: -n x')
  })
})
