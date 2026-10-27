import { describe, expect, it } from 'bun:test'
import { GitRevListCountParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-list/count-parser.ts'

describe('GitRevListCountParser', () => {
  it('when options include --count, matches', () => {
    const parser = new GitRevListCountParser(['--count', 'HEAD'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options lack --count, does not match', () => {
    const parser = new GitRevListCountParser(['HEAD'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given count output, returns the number', () => {
    const parser = new GitRevListCountParser(['--count', 'HEAD'], '2\n')

    const result = parser.parse()

    expect(result).toEqual({ count: 2 })
  })
})
