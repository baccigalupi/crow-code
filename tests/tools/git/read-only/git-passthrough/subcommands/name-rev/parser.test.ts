import { describe, expect, it } from 'bun:test'
import { GitNameRevParser } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/name-rev/parser.ts'

describe('GitNameRevParser', () => {
  it('when name-only output is given, returns the name', () => {
    const parser = new GitNameRevParser(['--name-only', 'HEAD'])

    const result = parser.parse('main\n')

    expect(result).toEqual({ name: 'main' })
  })

  it('when plain output is given, returns the name without the revision', () => {
    const parser = new GitNameRevParser(['HEAD'])

    const result = parser.parse('HEAD main\n')

    expect(result).toEqual({ name: 'main' })
  })

  it('when the commit has no name, leaves the name out', () => {
    const parser = new GitNameRevParser(['--tags', 'HEAD'])

    const result = parser.parse('HEAD undefined\n')

    expect(result).toEqual({})
  })
})
