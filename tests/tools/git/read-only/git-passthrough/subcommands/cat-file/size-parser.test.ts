import { describe, expect, it } from 'bun:test'
import { GitCatFileSizeParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/cat-file/size-parser.ts'

describe('GitCatFileSizeParser', () => {
  it('when options include -s, matches', () => {
    const parser = new GitCatFileSizeParser(['-s', 'HEAD:allowed.txt'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options lack -s, does not match', () => {
    const parser = new GitCatFileSizeParser(['-t', 'HEAD:allowed.txt'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given size output, returns the number', () => {
    const parser = new GitCatFileSizeParser(['-s', 'HEAD:allowed.txt'], '12\n')

    const result = parser.parse()

    expect(result).toEqual({ size: 12 })
  })
})
