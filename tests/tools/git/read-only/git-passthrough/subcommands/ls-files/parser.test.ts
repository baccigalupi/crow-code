import { describe, expect, it } from 'bun:test'
import { GitLsFilesParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/ls-files/parser.ts'

describe('GitLsFilesParser', () => {
  it('when given plain paths, returns path entries', () => {
    const parser = new GitLsFilesParser([])

    const result = parser.parse('a.txt\nsrc/b.ts\n')

    expect(result).toEqual({
      entries: [{ path: 'a.txt' }, { path: 'src/b.ts' }],
    })
  })

  it('when given staged lines, returns mode, sha and stage', () => {
    const parser = new GitLsFilesParser(['-s'])

    const result = parser.parse(
      '100644 fe4e0926999e7629315c1e020561a5025c67b41b 0\tsrc/a b.ts\n',
    )

    expect(result).toEqual({
      entries: [
        {
          path: 'src/a b.ts',
          mode: '100644',
          sha: 'fe4e0926999e7629315c1e020561a5025c67b41b',
          stage: 0,
        },
      ],
    })
  })

  it('when staged and untracked lines mix, parses each line on its own', () => {
    const parser = new GitLsFilesParser(['-s', '-o'])

    const result = parser.parse(
      'untracked.txt\n100644 83846b292607658f182920aa30b41a8c14b44353 0\tstaged.txt\n',
    )

    expect(result).toEqual({
      entries: [
        { path: 'untracked.txt' },
        {
          path: 'staged.txt',
          mode: '100644',
          sha: '83846b292607658f182920aa30b41a8c14b44353',
          stage: 0,
        },
      ],
    })
  })

  it('when given -z, splits records on NUL', () => {
    const parser = new GitLsFilesParser(['-z'])

    const result = parser.parse('a.txt\0b c.txt\0')

    expect(result).toEqual({
      entries: [{ path: 'a.txt' }, { path: 'b c.txt' }],
    })
  })
})
