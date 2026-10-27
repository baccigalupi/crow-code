import { describe, expect, it } from 'bun:test'
import { GitAllowedFlags } from '../../../../../src/tools/git/read-only/cli-options/allowed-flags.ts'
import { BooleanFlag } from '../../../../../src/tools/git/read-only/cli-options/boolean-flag.ts'
import { ExactFlag } from '../../../../../src/tools/git/read-only/cli-options/exact-flag.ts'
import { NumberFlag } from '../../../../../src/tools/git/read-only/cli-options/number-flag.ts'
import { PathFlag } from '../../../../../src/tools/git/read-only/cli-options/path-flag.ts'
import { TextFlag } from '../../../../../src/tools/git/read-only/cli-options/text-flag.ts'
import { UnknownFlag } from '../../../../../src/tools/git/read-only/cli-options/unknown-flag.ts'

describe('GitAllowedFlags', () => {
  it('when the flag is an allowed boolean, builds a boolean flag', () => {
    const allowed = new GitAllowedFlags({ flags: { '--oneline': 'boolean' } })

    const flag = allowed.flag({
      name: '--oneline',
      typed: '--oneline',
      value: undefined,
    })

    expect(flag).toStrictEqual(
      new BooleanFlag({ typed: '--oneline', value: undefined }),
    )
  })

  it('when the flag matches a boolean registered with its value, builds an exact flag', () => {
    const allowed = new GitAllowedFlags({
      flags: { '--porcelain=v2': 'boolean' },
    })

    const flag = allowed.flag({
      name: '--porcelain',
      typed: '--porcelain=v2',
      value: 'v2',
    })

    expect(flag).toStrictEqual(
      new ExactFlag({ typed: '--porcelain=v2', value: 'v2' }),
    )
  })

  it('when the flag is not allowed, builds an unknown flag', () => {
    const allowed = new GitAllowedFlags({ flags: { '--oneline': 'boolean' } })

    const flag = allowed.flag({
      name: '--graph',
      typed: '--graph',
      value: undefined,
    })

    expect(flag).toStrictEqual(
      new UnknownFlag({ typed: '--graph', value: undefined }),
    )
  })

  it('when the flag is part of a short cluster, builds an unknown flag', () => {
    const allowed = new GitAllowedFlags({
      flags: { '-w': 'boolean', '-p': 'boolean' },
    })

    const flag = allowed.flag({ name: '-w', typed: '-wp', value: undefined })

    expect(flag).toStrictEqual(
      new UnknownFlag({ typed: '-wp', value: undefined }),
    )
  })

  it('when the flag is an allowed text flag, builds a text flag', () => {
    const allowed = new GitAllowedFlags({ flags: { '--author': 'text' } })

    const flag = allowed.flag({
      name: '--author',
      typed: '--author=ada',
      value: 'ada',
    })

    expect(flag).toStrictEqual(
      new TextFlag({ typed: '--author=ada', value: 'ada' }),
    )
  })

  it('when the flag is an allowed number flag, builds a number flag', () => {
    const allowed = new GitAllowedFlags({ flags: { '-n': 'number' } })

    const flag = allowed.flag({ name: '-n', typed: '-nx', value: 'x' })

    expect(flag).toStrictEqual(new NumberFlag({ typed: '-nx', value: 'x' }))
  })

  it('when the flag is an allowed path flag, builds a path flag', () => {
    const allowed = new GitAllowedFlags({ flags: { '-O': 'path' } })

    const flag = allowed.flag({ name: '-O', typed: '-O', value: 'ord' })

    expect(flag).toStrictEqual(new PathFlag({ typed: '-O', value: 'ord' }))
  })
})
