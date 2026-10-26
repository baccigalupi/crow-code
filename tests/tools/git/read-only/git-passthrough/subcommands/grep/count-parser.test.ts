import { describe, expect, it } from 'bun:test'
import { GitGrepCountParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/grep/count-parser.ts'

describe('GitGrepCountParser', () => {
  it('when options include -c, matches', () => {
    const parser = new GitGrepCountParser(['-c', '-e', 'a'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options lack -c, does not match', () => {
    const parser = new GitGrepCountParser(['-e', 'a'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given count output, returns path and count', () => {
    const parser = new GitGrepCountParser(
      ['-c', '-e', 'a'],
      'allowed.txt:1\nstaged.txt:1\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      counts: [
        { path: 'allowed.txt', count: 1 },
        { path: 'staged.txt', count: 1 },
      ],
    })
  })

  it('when output has a revision prefix, returns the revision apart from the path', () => {
    const parser = new GitGrepCountParser(
      ['-c', '-e', 'a', 'HEAD'],
      'HEAD:allowed.txt:1\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      counts: [{ revision: 'HEAD', path: 'allowed.txt', count: 1 }],
    })
  })
})
