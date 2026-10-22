import { describe, expect, it } from 'bun:test'
import { GitSubcommands } from '../../../../../src/tools/git/read-only/git-passthrough/git-subcommands.ts'
import { GitLogSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/subcommands/log.ts'

describe('GitSubcommands#classFor', () => {
  it('returns the log subcommand class for log', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('log')

    expect(Subcommand).toBe(GitLogSubcommand)
  })

  it('returns a class refusing push and listing the allowed subcommands', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('push')

    expect(new Subcommand({ args: [] }).refusal()).toBe(
      'subcommand not allowed: push; allowed subcommands: blame, diff, log, show',
    )
  })

  it('returns a refusing class for inherited object keys', () => {
    const subcommands = new GitSubcommands()

    const Subcommand = subcommands.classFor('constructor')

    expect(new Subcommand({ args: [] }).refusal()).toBe(
      'subcommand not allowed: constructor; allowed subcommands: blame, diff, log, show',
    )
  })
})
