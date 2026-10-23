import { describe, expect, it } from 'bun:test'
import { GitRefusals } from '../../../../../../src/tools/git/read-only/git-passthrough/git-subcommands/git-refusals.ts'

describe('GitRefusals', () => {
  it('when a subcommand is unknown, names it and lists the allowed ones sorted', () => {
    const refusals = new GitRefusals()

    const message = refusals.unknownSubcommand('push', ['log', 'blame'])

    expect(message).toBe(
      'subcommand not allowed: push; allowed subcommands: blame, log',
    )
  })

  it('when no subcommand is given, names it (none)', () => {
    const refusals = new GitRefusals()

    const message = refusals.unknownSubcommand('', ['log'])

    expect(message).toBe(
      'subcommand not allowed: (none); allowed subcommands: log',
    )
  })

  it('when nothing is allowed, says none', () => {
    const refusals = new GitRefusals()

    const message = refusals.unknownSubcommand('log', [])

    expect(message).toBe(
      'subcommand not allowed: log; allowed subcommands: none',
    )
  })

  it('when a form is not allowed, names the attempt and the allowed forms', () => {
    const refusals = new GitRefusals()

    const message = refusals.formNotAllowed('stash pop', 'stash', ['list'])

    expect(message).toBe(
      'subcommand not allowed: stash pop; allowed forms for stash: list',
    )
  })

  it('when flags are not allowed, names each and lists the allowed ones sorted', () => {
    const refusals = new GitRefusals()

    const message = refusals.flagsNotAllowed(['--a', '--b'], 'log', [
      '-n',
      '--oneline',
    ])

    expect(message).toBe(
      'flag not allowed: --a, --b; allowed flags for log: --oneline, -n',
    )
  })

  it('when arguments are not allowed, names each', () => {
    const refusals = new GitRefusals()

    const message = refusals.argumentNotAllowed(['add', 'x'])

    expect(message).toBe('argument not allowed: add, x')
  })

  it('when values are not numbers, names each', () => {
    const refusals = new GitRefusals()

    const message = refusals.valuesNotNumbers(['-n x'])

    expect(message).toBe('flag value not a number: -n x')
  })
})
