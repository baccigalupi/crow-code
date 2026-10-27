import { describe, expect, it } from 'bun:test'
import { GitLsTreeNameOnlyParser } from '../../../../../../src/tools/git/read-only/subcommands/ls-tree/name-only-parser.ts'

describe('GitLsTreeNameOnlyParser', () => {
  it('when options include --name-only, matches', () => {
    const parser = new GitLsTreeNameOnlyParser(['-r', '--name-only'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --name-only, does not match', () => {
    const parser = new GitLsTreeNameOnlyParser(['-r'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when --name-only, returns path entries', () => {
    const parser = new GitLsTreeNameOnlyParser(
      ['--name-only'],
      'package.json\nsrc\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [{ path: 'package.json' }, { path: 'src' }],
    })
  })
})
