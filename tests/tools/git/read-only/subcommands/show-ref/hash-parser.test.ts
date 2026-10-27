import { describe, expect, it } from 'bun:test'
import { GitShowRefHashParser } from '../../../../../../src/tools/git/read-only/subcommands/show-ref/hash-parser.ts'

describe('GitShowRefHashParser', () => {
  it('when options include -s, matches', () => {
    const parser = new GitShowRefHashParser(['--heads', '-s'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options include --hash, matches', () => {
    const parser = new GitShowRefHashParser(['--hash'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options include neither -s nor --hash, does not match', () => {
    const parser = new GitShowRefHashParser(['--heads'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given hash output, returns shas', () => {
    const parser = new GitShowRefHashParser(
      ['-s'],
      'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\n7f2203f286226e6c29da25b8edb35b13a7efa7c6\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      shas: [
        'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
      ],
    })
  })
})
