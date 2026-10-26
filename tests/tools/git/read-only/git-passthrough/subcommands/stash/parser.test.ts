import { describe, expect, it } from 'bun:test'
import { GitStashParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/stash/parser.ts'

describe('GitStashParser', () => {
  it('when given stash list output, returns selector and message', () => {
    const parser = new GitStashParser('stash@{0}: On main: fixture stash\n')

    const result = parser.parse()

    expect(result).toEqual({
      entries: [{ selector: 'stash@{0}', message: 'On main: fixture stash' }],
    })
  })

  it('when given no output, returns no entries', () => {
    const parser = new GitStashParser('')

    const result = parser.parse()

    expect(result).toEqual({ entries: [] })
  })
})
