import { describe, expect, it } from 'bun:test'
import { GitCatFilePrintParser } from '../../../../../../src/tools/git/read-only/subcommands/cat-file/print-parser.ts'

describe('GitCatFilePrintParser', () => {
  it('when options include -p, matches', () => {
    const parser = new GitCatFilePrintParser(['-p', 'HEAD:allowed.txt'], '')

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options lack -p, does not match', () => {
    const parser = new GitCatFilePrintParser(['-t', 'HEAD:allowed.txt'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when given print output, returns the text unchanged', () => {
    const parser = new GitCatFilePrintParser(
      ['-p', 'HEAD:allowed.txt'],
      'allowed two\n',
    )

    const result = parser.parse()

    expect(result).toEqual({ text: 'allowed two\n' })
  })
})
