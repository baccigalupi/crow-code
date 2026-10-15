import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { sortedMatches } from '../../../../../src/tools/files/read-only/search/sorted-matches.ts'
import {
  defaultRuntime,
  Runtime,
} from '../../../../../src/application-data/runtime.ts'
import { mockEnvironment } from '../../../../support/mock-environment.ts'
import {
  clearDirectory,
  createSearchFixtureNodeModules,
  fixturesDirectory,
  searchFixtureNodeModules,
} from '../../../../support/fixtures.ts'

describe('sorted-matches', () => {
  beforeEach(createSearchFixtureNodeModules)
  afterEach(() => clearDirectory(searchFixtureNodeModules()))

  it('when several files match, returns matches sorted by path then line', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({
      path,
      pattern: 'two|one',
      ignoredDirectories: [join(path, 'node_modules')],
      runtime: defaultRuntime(),
    }).all()

    expect(matches).toEqual([
      { path: 'alpha.txt', line: 1, text: 'one' },
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'nested/beta.md', line: 3, text: 'two of them' },
    ])
  })

  it('when flags are given, applies them to the pattern', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({
      path,
      pattern: 'BETA',
      flags: 'i',
      runtime: defaultRuntime(),
    }).all()

    expect(matches).toEqual([{
      path: 'nested/beta.md',
      line: 1,
      text: '# Beta',
    }])
  })

  it('when no ignoredDirectories are given, includes node_modules matches', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({
      path,
      pattern: 'two',
      runtime: defaultRuntime(),
    })
      .all()

    expect(matches).toContainEqual({
      path: 'node_modules/skipped.txt',
      line: 1,
      text: 'two',
    })
  })

  it('when filePattern is given, matches come only from matching files', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const matches = await sortedMatches({
      path,
      pattern: 'two|one',
      filePattern: '*.txt',
      ignoredDirectories: [join(path, 'node_modules')],
      runtime: defaultRuntime(),
    }).all()

    expect(matches).toEqual([
      { path: 'alpha.txt', line: 1, text: 'one' },
      { path: 'alpha.txt', line: 2, text: 'two' },
    ])
  })

  it('when the path is relative, resolves it against the runtime working directory', async () => {
    const runtime = new Runtime(
      Deno,
      mockEnvironment({}),
      join(fixturesDirectory, 'tools'),
    )

    const matches = await sortedMatches({
      path: 'search',
      pattern: 'BETA',
      flags: 'i',
      runtime,
    }).all()

    expect(matches).toEqual([{
      path: 'nested/beta.md',
      line: 1,
      text: '# Beta',
    }])
  })

  it('when the pattern is an invalid regex, throws', () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const construct = () =>
      sortedMatches({ path, pattern: '(', runtime: defaultRuntime() })

    expect(construct).toThrow('Invalid regular expression')
  })
})
