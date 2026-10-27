import { describe, expect, it } from 'bun:test'
import { GitCatFileTypeParser } from '../../../../../../src/tools/git/read-only/subcommands/cat-file/type-parser.ts'

describe('GitCatFileTypeParser', () => {
  it('when options include -t, matches', () => {
    const parser = new GitCatFileTypeParser(['-t', 'HEAD:allowed.txt'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options lack -t, does not match', () => {
    const parser = new GitCatFileTypeParser(['-s', 'HEAD:allowed.txt'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given type output, returns the kind', () => {
    const parser = new GitCatFileTypeParser(
      ['-t', 'HEAD:allowed.txt'],
      'blob\n',
    )

    const result = parser.parse()

    expect(result).toEqual({ kind: 'blob' })
  })
})
