import { describe, expect, it } from 'bun:test'
import { GitNameRevParser } from '../../../../../../src/tools/git/read-only/subcommands/name-rev/parser.ts'

describe('GitNameRevParser', () => {
  it('when name-only output is given, returns the name', () => {
    const parser = new GitNameRevParser(['--name-only', 'HEAD'], 'main\n')

    const result = parser.parse()

    expect(result).toEqual({ name: 'main' })
  })

  it('when plain output is given, returns the name without the revision', () => {
    const parser = new GitNameRevParser(['HEAD'], 'HEAD main\n')

    const result = parser.parse()

    expect(result).toEqual({ name: 'main' })
  })

  it('when the commit has no name, leaves the name out', () => {
    const parser = new GitNameRevParser(['--tags', 'HEAD'], 'HEAD undefined\n')

    const result = parser.parse()

    expect(result).toEqual({})
  })
})
