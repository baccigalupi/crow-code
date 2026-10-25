import { describe, expect, it } from 'bun:test'
import { GitRevListParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/rev-list/parser.ts'

describe('GitRevListParser', () => {
  it('when given rev-list output, returns shas', () => {
    const parser = new GitRevListParser()

    const result = parser.parse(
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6\nffd175847ab5c34abf8e3a66c4bab26b9ef87939\n',
    )

    expect(result).toEqual({
      shas: [
        '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
      ],
    })
  })
})
