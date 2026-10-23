import { describe, expect, it } from 'bun:test'
import { GitStashSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/stash.ts'

describe('GitStashSubcommand', () => {
  it('when given list, does not refuse', () => {
    const subcommand = new GitStashSubcommand({ args: ['list'] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['stash', 'list'])
  })

  it('when given pop, refuses naming the allowed forms', () => {
    const subcommand = new GitStashSubcommand({ args: ['pop'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash pop; allowed forms for stash: list',
    )
  })

  it('when given nothing, refuses naming the allowed forms', () => {
    const subcommand = new GitStashSubcommand({ args: [] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash; allowed forms for stash: list',
    )
  })

  it('when given push, refuses naming the allowed forms', () => {
    const subcommand = new GitStashSubcommand({ args: ['push'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash push; allowed forms for stash: list',
    )
  })

  it('when list is given an argument, refuses the argument', () => {
    const subcommand = new GitStashSubcommand({ args: ['list', 'foo'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('argument not allowed: foo')
  })
})
