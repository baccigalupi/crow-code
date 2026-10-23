import { describe, expect, it } from 'bun:test'
import { GitTagSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/tag.ts'

describe('GitTagSubcommand', () => {
  it('when given nothing, does not refuse', () => {
    const subcommand = new GitTagSubcommand({ args: [] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['tag'])
  })

  it('when given -l, does not refuse', () => {
    const subcommand = new GitTagSubcommand({ args: ['-l'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --list, does not refuse', () => {
    const subcommand = new GitTagSubcommand({ args: ['--list'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -n, does not refuse', () => {
    const subcommand = new GitTagSubcommand({ args: ['-n'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --points-at and a revision, does not refuse', () => {
    const subcommand = new GitTagSubcommand({ args: ['--points-at', 'HEAD'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given --contains and a revision, does not refuse', () => {
    const subcommand = new GitTagSubcommand({ args: ['--contains', 'HEAD'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when given -d, refuses the flag', () => {
    const subcommand = new GitTagSubcommand({ args: ['-d', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -d; allowed flags for tag: --contains, --list, --points-at, -l, -n',
    )
  })

  it('when given -a, refuses the flag', () => {
    const subcommand = new GitTagSubcommand({ args: ['-a', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -a; allowed flags for tag: --contains, --list, --points-at, -l, -n',
    )
  })

  it('when given -s, refuses the flag', () => {
    const subcommand = new GitTagSubcommand({ args: ['-s', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -s; allowed flags for tag: --contains, --list, --points-at, -l, -n',
    )
  })

  it('when given -f, refuses the flag', () => {
    const subcommand = new GitTagSubcommand({ args: ['-f', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -f; allowed flags for tag: --contains, --list, --points-at, -l, -n',
    )
  })

  it('when given -u, refuses the flag', () => {
    const subcommand = new GitTagSubcommand({ args: ['-u', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -u; allowed flags for tag: --contains, --list, --points-at, -l, -n',
    )
  })

  it('when given -m, refuses the flag', () => {
    const subcommand = new GitTagSubcommand({ args: ['-m', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -m; allowed flags for tag: --contains, --list, --points-at, -l, -n',
    )
  })

  it('when given a bare name, refuses the argument', () => {
    const subcommand = new GitTagSubcommand({ args: ['v1'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: v1')
  })

  it('when given -l and a pattern, refuses the argument', () => {
    const subcommand = new GitTagSubcommand({ args: ['-l', 'v*'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: v*')
  })
})
