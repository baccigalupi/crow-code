import { describe, expect, it } from 'bun:test'
import { GitGrepMatchParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/grep/match-parser.ts'

describe('GitGrepMatchParser', () => {
  it('when options lack -c and -l, matches', () => {
    const parser = new GitGrepMatchParser(['-n', '-e', 'a'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options include -c, does not match', () => {
    const parser = new GitGrepMatchParser(['-c', '-e', 'a'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when options include -l, does not match', () => {
    const parser = new GitGrepMatchParser(['-l', '-e', 'a'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given -n output, returns path, line and text', () => {
    const parser = new GitGrepMatchParser(
      ['-n', '-e', 'a'],
      'allowed.txt:1:allowed two\nstaged.txt:1:staged one\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      matches: [
        { path: 'allowed.txt', line: 1, text: 'allowed two' },
        { path: 'staged.txt', line: 1, text: 'staged one' },
      ],
    })
  })

  it('when matched text contains a colon, keeps it in text', () => {
    const parser = new GitGrepMatchParser(
      ['-n', '-e', 'a'],
      'allowed.txt:1:a: b\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      matches: [{ path: 'allowed.txt', line: 1, text: 'a: b' }],
    })
  })

  it('when given output without -n, returns path and text', () => {
    const parser = new GitGrepMatchParser(
      ['-e', 'a'],
      'allowed.txt:allowed two\nstaged.txt:staged one\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      matches: [
        { path: 'allowed.txt', text: 'allowed two' },
        { path: 'staged.txt', text: 'staged one' },
      ],
    })
  })

  it('when output has a revision prefix, returns the revision apart from the path', () => {
    const parser = new GitGrepMatchParser(
      ['-n', '-e', 'allowed', 'HEAD'],
      'HEAD:allowed.txt:1:allowed two\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      matches: [
        { revision: 'HEAD', path: 'allowed.txt', line: 1, text: 'allowed two' },
      ],
    })
  })
})
