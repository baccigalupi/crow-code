import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { sortedMatches } from '../../../../../src/tools/files/read-only/search/sorted-matches.ts'
import { CrowConfig } from '../../../../../src/application-data/config.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
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
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [join(path, 'node_modules')],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })

    const operation = sortedMatches({
      applicationData,
      operationArguments: { path, pattern: 'two|one' },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(operation.result()).toEqual([
      { path: 'alpha.txt', line: 1, text: 'one' },
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'nested/beta.md', line: 3, text: 'two of them' },
    ])
  })

  it('when flags are given, applies them to the pattern', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const operation = sortedMatches({
      applicationData: mockApplicationData(),
      operationArguments: { path, pattern: 'BETA', flags: 'i' },
    })
    await operation.run()

    expect(operation.result()).toEqual([{
      path: 'nested/beta.md',
      line: 1,
      text: '# Beta',
    }])
  })

  it('when no directories are ignored, includes node_modules matches', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const operation = sortedMatches({
      applicationData: mockApplicationData(),
      operationArguments: { path, pattern: 'two' },
    })
    await operation.run()

    expect(operation.result()).toContainEqual({
      path: 'node_modules/skipped.txt',
      line: 1,
      text: 'two',
    })
  })

  it('when filePattern is given, matches come only from matching files', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [join(path, 'node_modules')],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })

    const operation = sortedMatches({
      applicationData,
      operationArguments: { path, pattern: 'two|one', filePattern: '*.txt' },
    })
    await operation.run()

    expect(operation.result()).toEqual([
      { path: 'alpha.txt', line: 1, text: 'one' },
      { path: 'alpha.txt', line: 2, text: 'two' },
    ])
  })

  it('when the path is relative, resolves it against the runtime working directory', async () => {
    const applicationData = mockApplicationData({
      cwd: join(fixturesDirectory, 'tools'),
    })

    const operation = sortedMatches({
      applicationData,
      operationArguments: { path: 'search', pattern: 'BETA', flags: 'i' },
    })
    await operation.run()

    expect(operation.result()).toEqual([{
      path: 'nested/beta.md',
      line: 1,
      text: '# Beta',
    }])
  })

  it('when the pattern is an invalid regex, fails with the regex error and no matches', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')

    const operation = sortedMatches({
      applicationData: mockApplicationData(),
      operationArguments: { path, pattern: '(' },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.reason).toContain('Invalid regular expression')
    expect(operation.result()).toEqual([])
  })
})
