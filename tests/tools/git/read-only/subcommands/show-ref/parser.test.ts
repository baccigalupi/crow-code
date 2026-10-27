import { describe, expect, it } from 'bun:test'
import { GitShowRefParser } from '../../../../../../src/tools/git/read-only/subcommands/show-ref/parser.ts'

describe('GitShowRefParser', () => {
  it('when given a branch line, returns a branch entry', () => {
    const parser = new GitShowRefParser(
      'ffd175847ab5c34abf8e3a66c4bab26b9ef87939 refs/heads/feature\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          name: 'refs/heads/feature',
          sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
          kind: 'branch',
        },
      ],
    })
  })

  it('when given a HEAD line, returns a head entry', () => {
    const parser = new GitShowRefParser(
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6 HEAD\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          name: 'HEAD',
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          kind: 'head',
        },
      ],
    })
  })

  it('when given a peeled tag line, returns a peeled tag entry', () => {
    const parser = new GitShowRefParser(
      '7f2203f286226e6c29da25b8edb35b13a7efa7c6 refs/tags/v1.0^{}\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          name: 'refs/tags/v1.0',
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          kind: 'tag',
          peeled: true,
        },
      ],
    })
  })
})
