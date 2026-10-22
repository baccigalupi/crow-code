import { describe, expect, it } from 'bun:test'
import { GitSubcommand } from '../../../../../src/tools/git/read-only/git-passthrough/git-subcommand.ts'

describe('GitSubcommand', () => {
  it('when args have revisions and a pathspec, requestedPaths lists them without flags', () => {
    class Log extends GitSubcommand {
      readonly name = 'log'
      readonly flags = { '--oneline': 'switch' } as const
    }
    const subcommand = new Log({
      args: ['--oneline', 'HEAD', '--', 'src/a.ts'],
    })

    const paths = subcommand.requestedPaths()

    expect(paths).toEqual(['HEAD', 'src/a.ts'])
  })

  it('when a flag is not enabled, names it and lists the allowed flags sorted', () => {
    class Log extends GitSubcommand {
      readonly name = 'log'
      readonly flags = { '-n': 'number', '--oneline': 'switch' } as const
    }
    const subcommand = new Log({ args: ['--graph'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for log: --oneline, -n',
    )
  })

  it('when the subcommand allows no flags, says none are allowed', () => {
    class Log extends GitSubcommand {
      readonly name = 'log'
      readonly flags = {}
    }
    const subcommand = new Log({ args: ['--graph'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for log: none',
    )
  })

  it('when several flags are refused, names every one', () => {
    class Log extends GitSubcommand {
      readonly name = 'log'
      readonly flags = { '--oneline': 'switch' } as const
    }
    const subcommand = new Log({ args: ['--output=f', '--exec=x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --output=f, --exec=x; allowed flags for log: --oneline',
    )
  })

  it('when a number flag has a non-numeric value, says the value is not a number', () => {
    class Log extends GitSubcommand {
      readonly name = 'log'
      readonly flags = { '-n': 'number' } as const
    }
    const subcommand = new Log({ args: ['-n', 'x'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('flag value not a number: -n x')
  })

  it('when it has fixed flags, puts them right after the name', () => {
    class Log extends GitSubcommand {
      readonly name = 'log'
      override readonly fixedFlags = ['--no-ext-diff']
      readonly flags = {}
    }
    const subcommand = new Log({ args: ['HEAD'] })

    const gitArguments = subcommand.gitArguments()

    expect(gitArguments).toEqual(['log', '--no-ext-diff', 'HEAD'])
  })

  it('when a form-gated subcommand is given an allowed form, does not refuse', () => {
    class Stash extends GitSubcommand {
      readonly name = 'stash'
      override readonly forms = ['list']
      readonly flags = {}
    }
    const subcommand = new Stash({ args: ['list'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe('')
  })

  it('when a form-gated subcommand is given another form, names the allowed forms', () => {
    class Stash extends GitSubcommand {
      readonly name = 'stash'
      override readonly forms = ['list']
      readonly flags = {}
    }
    const subcommand = new Stash({ args: ['pop'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash pop; allowed forms for stash: list',
    )
  })

  it('when a form-gated subcommand is given no form, names the allowed forms', () => {
    class Stash extends GitSubcommand {
      readonly name = 'stash'
      override readonly forms = ['list']
      readonly flags = {}
    }
    const subcommand = new Stash({ args: [] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash; allowed forms for stash: list',
    )
  })

  it('when a form-gated subcommand has no allowed forms, says none are allowed', () => {
    class Stash extends GitSubcommand {
      readonly name = 'stash'
      override readonly forms: string[] = []
      readonly flags = {}
    }
    const subcommand = new Stash({ args: ['list'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: stash list; allowed forms for stash: none',
    )
  })

  it('when a form-gated subcommand is given a refused flag after the form, refuses the flag', () => {
    class Stash extends GitSubcommand {
      readonly name = 'stash'
      override readonly forms = ['list']
      readonly flags = {}
    }
    const subcommand = new Stash({ args: ['list', '--graph'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --graph; allowed flags for stash: none',
    )
  })

  it('when a form-gated subcommand has a revision after the form, requestedPaths skips the form', () => {
    class Stash extends GitSubcommand {
      readonly name = 'stash'
      override readonly forms = ['list']
      readonly flags = {}
    }
    const subcommand = new Stash({ args: ['list', 'stash@{1}'] })

    const paths = subcommand.requestedPaths()

    expect(paths).toEqual(['stash@{1}'])
  })
})
