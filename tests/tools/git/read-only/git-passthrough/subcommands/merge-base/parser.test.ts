import { describe, expect, it } from 'bun:test'
import { GitMergeBaseParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/merge-base/parser.ts'

describe('GitMergeBaseParser', () => {
  it('when given plain output, returns the trimmed sha', () => {
    const parser = new GitMergeBaseParser(
      ['HEAD', 'HEAD~1'],
      'ffd175847ab5c34abf8e3a66c4bab26b9ef87939\n',
      0,
    )

    const result = parser.parse()

    expect(result).toEqual({ sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939' })
  })

  it('when --all is given, returns every sha', () => {
    const parser = new GitMergeBaseParser(
      ['--all', 'HEAD', 'HEAD~1'],
      'aaa\nbbb\n',
      0,
    )

    const result = parser.parse()

    expect(result).toEqual({ shas: ['aaa', 'bbb'] })
  })

  it('when --independent is given, returns every sha', () => {
    const parser = new GitMergeBaseParser(
      ['--independent', 'a', 'b'],
      'aaa\n',
      0,
    )

    const result = parser.parse()

    expect(result).toEqual({ shas: ['aaa'] })
  })

  it('when --is-ancestor exits 0, returns isAncestor true', () => {
    const parser = new GitMergeBaseParser(['--is-ancestor', 'a', 'b'], '', 0)

    const result = parser.parse()

    expect(result).toEqual({ isAncestor: true })
  })

  it('when --is-ancestor exits 1, returns isAncestor false', () => {
    const parser = new GitMergeBaseParser(['--is-ancestor', 'a', 'b'], '', 1)

    const result = parser.parse()

    expect(result).toEqual({ isAncestor: false })
  })
})
