import { describe, expect, it } from 'bun:test'
import { GitCountObjectsSubcommand } from '../../../../../../src/tools/git/read-only/git-passthrough/subcommands/count-objects.ts'

describe('GitCountObjectsSubcommand', () => {
  it('when given -v, does not refuse', () => {
    const subcommand = new GitCountObjectsSubcommand({ args: ['-v'] })

    const refusal = subcommand.refusal()
    const gitArguments = subcommand.gitArguments()

    expect(refusal).toBe('')
    expect(gitArguments).toEqual(['count-objects', '-v'])
  })

  it('when given -H, refuses naming the allowed flags', () => {
    const subcommand = new GitCountObjectsSubcommand({ args: ['-H'] })

    const refusal = subcommand.refusal()

    expect(refusal).toBe(
      'flag not allowed: -H; allowed flags for count-objects: -v',
    )
  })
})
