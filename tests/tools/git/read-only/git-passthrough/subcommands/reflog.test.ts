import { describe, expect, it } from 'bun:test'
import { GitReflogSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/reflog.ts'

describe('GitReflogSubcommand', () => {
  it('when given nothing, does not refuse', () => {
    const subcommand = new GitReflogSubcommand({ args: [] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['reflog'])
  })

  it('when given show and a revision, does not refuse and requests the revision', () => {
    const subcommand = new GitReflogSubcommand({ args: ['show', 'HEAD'] })

    const refusal = subcommand.refusal()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(requestedPaths).toEqual(['HEAD'])
  })

  it('when given expire, refuses naming the allowed forms', () => {
    const subcommand = new GitReflogSubcommand({ args: ['expire'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: reflog expire; allowed forms for reflog: (bare), show',
    )
  })

  it('when given delete, refuses naming the allowed forms', () => {
    const subcommand = new GitReflogSubcommand({ args: ['delete'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'subcommand not allowed: reflog delete; allowed forms for reflog: (bare), show',
    )
  })

  it('when show is given --expire, refuses the flag', () => {
    const subcommand = new GitReflogSubcommand({
      args: ['show', '--expire=now'],
    })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --expire=now; allowed flags for reflog: none',
    )
  })
})
