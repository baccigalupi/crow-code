import { describe, expect, it } from 'bun:test'
import { GitTagParser } from '../../../../../../src/tools/git/read-only/subcommands/tag/parser.ts'

describe('GitTagParser', () => {
  it('when given tag output, returns names', () => {
    const parser = new GitTagParser('v1.0\n')

    const result = parser.parse()

    expect(result).toEqual({ entries: [{ name: 'v1.0' }] })
  })

  it('when given tag -n output, returns names with messages', () => {
    const parser = new GitTagParser('v1.0            Release one\n')

    const result = parser.parse()

    expect(result).toEqual({
      entries: [{ name: 'v1.0', message: 'Release one' }],
    })
  })
})
