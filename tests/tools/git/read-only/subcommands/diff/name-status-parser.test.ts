import { describe, expect, it } from 'bun:test'
import { GitDiffNameStatusParser } from '../../../../../../src/tools/git/read-only/subcommands/diff/name-status-parser.ts'

describe('GitDiffNameStatusParser', () => {
  it('when options include --name-status, matches', () => {
    const parser = new GitDiffNameStatusParser(
      ['--cached', '--name-status'],
      '',
    )

    const match = parser.isMatch()

    expect(match).toBe(true)
  })

  it('when options do not include --name-status, does not match', () => {
    const parser = new GitDiffNameStatusParser(['--name-only'], '')

    const match = parser.isMatch()

    expect(match).toBe(false)
  })

  it('when --name-status, returns each file with its status', () => {
    const parser = new GitDiffNameStatusParser(
      ['--name-status'],
      'M\tallowed.txt\nR100\told.txt\tnew.txt\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      files: [
        { status: 'M', path: 'allowed.txt' },
        { status: 'R100', path: 'new.txt' },
      ],
    })
  })
})
