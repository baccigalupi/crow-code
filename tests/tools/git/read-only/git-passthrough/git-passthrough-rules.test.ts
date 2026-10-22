import { describe, expect, it } from 'bun:test'
import { GitReadOnlyRules } from '../../../../../src/tools/git/read-only/git-passthrough/git-passthrough-rules.ts'

describe('GitReadOnlyRules', () => {
  it('when nothing is enabled, refuses the subcommand and says none are allowed', () => {
    const rules = new GitReadOnlyRules({ enabled: {}, args: ['log'] })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: log; allowed subcommands: none',
    )
  })

  it('when the subcommand is not enabled, names it and lists the enabled ones sorted', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: {} }, blame: { flags: {} } },
      args: ['stash'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash; allowed subcommands: blame, log',
    )
  })

  it('when no arguments are given, refuses with (none)', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: {} } },
      args: [],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: (none); allowed subcommands: log',
    )
  })

  it('when the subcommand is an object prototype key, refuses it', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: {} } },
      args: ['constructor'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: constructor; allowed subcommands: log',
    )
  })

  it('when the first argument is a global option, refuses it as the subcommand', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: {} } },
      args: ['-C', '/tmp', 'log'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe('subcommand not allowed: -C; allowed subcommands: log')
  })

  it('when the subcommand and flags are enabled, does not refuse', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: { '--oneline': 'switch' } } },
      args: ['log', '--oneline'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe('')
  })

  it('when a flag is not enabled, names it and lists the allowed flags sorted', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: { '-n': 'number', '--oneline': 'switch' } } },
      args: ['log', '--graph'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for log: --oneline, -n',
    )
  })

  it('when a subcommand allows no flags, says none are allowed', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: {} } },
      args: ['log', '--graph'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for log: none',
    )
  })

  it('when several flags are refused, names every one', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: { '--oneline': 'switch' } } },
      args: ['log', '--output=f', '--exec=x'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f, --exec=x; allowed flags for log: --oneline',
    )
  })

  it('when a number flag has a non-numeric value, says the value is not a number', () => {
    const rules = new GitReadOnlyRules({
      enabled: { log: { flags: { '-n': 'number' } } },
      args: ['log', '-n', 'x'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe('flag value not a number: -n x')
  })

  it('when a form-gated subcommand is given an allowed form, does not refuse', () => {
    const rules = new GitReadOnlyRules({
      enabled: { stash: { forms: ['list'], flags: {} } },
      args: ['stash', 'list'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe('')
  })

  it('when a form-gated subcommand is given another form, names the allowed forms', () => {
    const rules = new GitReadOnlyRules({
      enabled: { stash: { forms: ['list'], flags: {} } },
      args: ['stash', 'pop'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash pop; allowed forms for stash: list',
    )
  })

  it('when a form-gated subcommand is given no form, names the allowed forms', () => {
    const rules = new GitReadOnlyRules({
      enabled: { stash: { forms: ['list'], flags: {} } },
      args: ['stash'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash; allowed forms for stash: list',
    )
  })

  it('when a form-gated subcommand has no allowed forms, says none are allowed', () => {
    const rules = new GitReadOnlyRules({
      enabled: { stash: { forms: [], flags: {} } },
      args: ['stash', 'list'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash list; allowed forms for stash: none',
    )
  })

  it('when a form-gated subcommand is given a refused flag after the form, refuses the flag', () => {
    const rules = new GitReadOnlyRules({
      enabled: { stash: { forms: ['list'], flags: {} } },
      args: ['stash', 'list', '--graph'],
    })

    const refusal = rules.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for stash: none',
    )
  })
})
