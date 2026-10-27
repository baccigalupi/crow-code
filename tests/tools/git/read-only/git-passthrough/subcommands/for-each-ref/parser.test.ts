import { describe, expect, it } from 'bun:test'
import { GitForEachRefParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/for-each-ref/parser.ts'

describe('GitForEachRefParser', () => {
  it('when given for-each-ref output, returns entries with object types', () => {
    const parser = new GitForEachRefParser(
      'ffd175847ab5c34abf8e3a66c4bab26b9ef87939 commit\trefs/heads/feature\n0fbf7f4404cfacce4dac0cc459c533c4475f1510 tag\trefs/tags/v1.0\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          name: 'refs/heads/feature',
          sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
          kind: 'branch',
          objectType: 'commit',
        },
        {
          name: 'refs/tags/v1.0',
          sha: '0fbf7f4404cfacce4dac0cc459c533c4475f1510',
          kind: 'tag',
          objectType: 'tag',
        },
      ],
    })
  })
})
