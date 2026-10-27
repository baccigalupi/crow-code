import { describe, expect, it } from 'bun:test'
import { GitCheckAttrParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/check-attr/parser.ts'

describe('GitCheckAttrParser', () => {
  it('when given check-attr output, returns the attribute', () => {
    const parser = new GitCheckAttrParser('allowed.txt: diff: set\n')

    const result = parser.parse()

    expect(result).toEqual({
      entries: [{ path: 'allowed.txt', attribute: 'diff', value: 'set' }],
    })
  })

  it('when given check-attr -a output, returns one entry per attribute', () => {
    const parser = new GitCheckAttrParser(
      'allowed.txt: diff: set\nallowed.txt: text: set\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        { path: 'allowed.txt', attribute: 'diff', value: 'set' },
        { path: 'allowed.txt', attribute: 'text', value: 'set' },
      ],
    })
  })

  it('when the path contains a colon and space, keeps the whole path', () => {
    const parser = new GitCheckAttrParser('a: b.txt: diff: unspecified\n')

    const result = parser.parse()

    expect(result).toEqual({
      entries: [{ path: 'a: b.txt', attribute: 'diff', value: 'unspecified' }],
    })
  })
})
