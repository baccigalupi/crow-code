import { describe, expect, it } from 'bun:test'
import { gitOptionFlags } from '../../../../../../src/tools/git/read-only/git-passthrough/cli-options/option-flags.ts'

describe('gitOptionFlags', () => {
  it('when args include --, returns the args before it', () => {
    const args = ['-s', '--', '-m']

    const flags = gitOptionFlags(args)

    expect(flags).toEqual(['-s'])
  })

  it('when args have no --, returns all args', () => {
    const args = ['-s', 'HEAD']

    const flags = gitOptionFlags(args)

    expect(flags).toEqual(['-s', 'HEAD'])
  })
})
