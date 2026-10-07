import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { sortedMatches } from '../../../../src/tools/files/search/sorted-matches.ts'
import {
  clearDirectory,
  createSearchFixtureNodeModules,
  fixturesDirectory,
  searchFixtureNodeModules,
} from '../../../support/fixtures.ts'

describe('sorted-matches', () => {
  beforeEach(createSearchFixtureNodeModules)
  afterEach(() => clearDirectory(searchFixtureNodeModules()))

  it('when several files match, returns matches sorted by path then line', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({ path, pattern: 'two|one' }).all()

    expect(matches).toEqual([
      { path: 'alpha.txt', line: 1, text: 'one' },
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'nested/beta.md', line: 3, text: 'two of them' },
    ])
  })

  it('when flags are given, applies them to the pattern', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({ path, pattern: 'BETA', flags: 'i' })
      .all()

    expect(matches).toEqual([{
      path: 'nested/beta.md',
      line: 1,
      text: '# Beta',
    }])
  })

  it('when ignoredDirectories is empty, includes node_modules matches', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({
      path,
      pattern: 'two',
      ignoredDirectories: [],
    }).all()

    expect(matches).toContainEqual({
      path: 'node_modules/skipped.txt',
      line: 1,
      text: 'two',
    })
  })

  it('when the pattern is an invalid regex, throws', () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const construct = () => sortedMatches({ path, pattern: '(' })

    expect(construct).toThrow('Invalid regular expression')
  })
})
