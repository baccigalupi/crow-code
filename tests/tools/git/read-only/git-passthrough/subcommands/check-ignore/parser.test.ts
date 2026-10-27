import { describe, expect, it } from 'bun:test'
import { GitCheckIgnoreParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/check-ignore/parser.ts'

describe('GitCheckIgnoreParser', () => {
  it('when given check-ignore output, returns ignored paths', () => {
    const parser = new GitCheckIgnoreParser('build.log\n')

    const result = parser.parse()

    expect(result).toEqual({ entries: [{ path: 'build.log' }] })
  })

  it('when given check-ignore -v output, returns paths with their matching rule', () => {
    const parser = new GitCheckIgnoreParser(
      'dot-git/info/exclude:1:*.log\tbuild.log\n',
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          path: 'build.log',
          source: 'dot-git/info/exclude',
          line: 1,
          pattern: '*.log',
        },
      ],
    })
  })
})
