import { describe, expect, it } from 'bun:test'
import { GitCheckAttrSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/check-attr.ts'

describe('GitCheckAttrSubcommand', () => {
  it('when given -a and a path, does not refuse', () => {
    const subcommand = new GitCheckAttrSubcommand({ args: ['-a', 'a.ts'] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['check-attr', '-a', 'a.ts'])
  })

  it('when given --all and a path after --, does not refuse', () => {
    const subcommand = new GitCheckAttrSubcommand({
      args: ['--all', '--', 'a.ts'],
    })

    const refusal = subcommand.refusal()
    const requestedPaths = subcommand.requestedPaths()

    expect(refusal).toBe('')
    expect(requestedPaths).toEqual(['a.ts'])
  })

  it('when given --stdin, refuses naming the allowed flags', () => {
    const subcommand = new GitCheckAttrSubcommand({ args: ['--stdin'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: --stdin; allowed flags for check-attr: --all, -a',
    )
  })

  it('when given -z, refuses', () => {
    const subcommand = new GitCheckAttrSubcommand({ args: ['-z', 'a.ts'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -z; allowed flags for check-attr: --all, -a',
    )
  })
})
