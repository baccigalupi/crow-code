import { describe, expect, it } from 'bun:test'
import { GitDiffNameOnlyParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/diff/name-only-parser.ts'

describe('GitDiffNameOnlyParser', () => {
  it('when options include --name-only, matches', () => {
    const parser = new GitDiffNameOnlyParser(['--cached', '--name-only'])

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --name-only, does not match', () => {
    const parser = new GitDiffNameOnlyParser(['--name-status'])

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when --name-only, returns each path', () => {
    const parser = new GitDiffNameOnlyParser(['--name-only'])

    const result = parser.parse('allowed.txt\nnotes.txt\n')

    expect(result).toEqual({
      files: [{ path: 'allowed.txt' }, { path: 'notes.txt' }],
    })
  })
})
