import { describe, expect, it } from 'bun:test'
import { GitReflogParser } from '../../../../../../src/tools/git/read-only/subcommands/reflog/parser.ts'

describe('GitReflogParser', () => {
  it('when given reflog output, returns hash, selector and message', () => {
    const parser = new GitReflogParser(
      '7f2203f HEAD@{0}: commit: second\nffd1758 HEAD@{1}: commit (initial): first\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        { hash: '7f2203f', selector: 'HEAD@{0}', message: 'commit: second' },
        {
          hash: 'ffd1758',
          selector: 'HEAD@{1}',
          message: 'commit (initial): first',
        },
      ],
    })
  })
})
