import { describe, expect, it } from 'bun:test'
import { GitBranchParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/branch/parser.ts'

describe('GitBranchParser', () => {
  it('when given branch output, returns names with current', () => {
    const parser = new GitBranchParser('  feature\n* main\n', false)

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        { name: 'feature', current: false },
        { name: 'main', current: true },
      ],
    })
  })

  it('when given branch -v output, returns sha and subject', () => {
    const parser = new GitBranchParser(
      '  feature ffd1758 first\n* main    7f2203f second\n',
      false,
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        { name: 'feature', current: false, sha: 'ffd1758', subject: 'first' },
        { name: 'main', current: true, sha: '7f2203f', subject: 'second' },
      ],
    })
  })

  it('when given a symbolic ref, returns its target', () => {
    const parser = new GitBranchParser(
      '  remotes/origin/HEAD -> origin/main\n  remotes/origin/main\n',
      false,
    )

    const result = parser.parse()

    expect(result).toEqual({
      entries: [
        {
          name: 'remotes/origin/HEAD',
          current: false,
          target: 'origin/main',
        },
        { name: 'remotes/origin/main', current: false },
      ],
    })
  })

  it('when given --show-current output, returns the name', () => {
    const parser = new GitBranchParser('main\n', true)

    const result = parser.parse()

    expect(result).toEqual({ name: 'main' })
  })
})
