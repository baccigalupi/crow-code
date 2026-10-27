import { describe, expect, it } from 'bun:test'
import { GitLsTreeParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-tree/parser.ts'

describe('GitLsTreeParser', () => {
  it('when given tree lines, returns mode, kind, sha and path', () => {
    const parser = new GitLsTreeParser(
      '040000 tree 1e5c60acc63f1a6e13a6d99875befc29cafa72c0\tsrc\n100644 blob 500e2fc6cfc188dd647e813d3dc7611cf2914f8d\tpackage.json\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          path: 'src',
          mode: '040000',
          kind: 'tree',
          sha: '1e5c60acc63f1a6e13a6d99875befc29cafa72c0',
        },
        {
          path: 'package.json',
          mode: '100644',
          kind: 'blob',
          sha: '500e2fc6cfc188dd647e813d3dc7611cf2914f8d',
        },
      ],
    })
  })
})
