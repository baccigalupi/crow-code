import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { join, resolve } from 'node:path'
import {
  SearchFiles,
  searchFiles,
} from '../../../../src/tools/files/read-only/search.ts'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import {
  clearDirectory,
  createSearchFixtureNodeModules,
  fixturesDirectory,
  searchFixtureNodeModules,
} from '../../../support/fixtures.ts'

describe('search', () => {
  beforeEach(createSearchFixtureNodeModules)
  afterEach(() => clearDirectory(searchFixtureNodeModules()))

  it('when the pattern matches in several files, returns matches outside the configured ignored directories', async () => {
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

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result()).toEqual({
      path,
      matches: [
        { path: 'alpha.txt', line: 2, text: 'two' },
        { path: 'nested/beta.md', line: 3, text: 'two of them' },
      ],
    })
  })

  it('when the tree contains a symlink escaping the root, the symlink is not read', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches).toEqual([
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'nested/beta.md', line: 3, text: 'two of them' },
    ])
  })

  it('when the config ignores only the default, files under node_modules are included', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches).toEqual([
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'nested/beta.md', line: 3, text: 'two of them' },
      { path: 'node_modules/skipped.txt', line: 1, text: 'two' },
    ])
  })

  it('when the config ignores a directory, that directory is skipped', async () => {
    const path = join(fixturesDirectory, 'tools', 'search')
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [join(path, 'nested')],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches).toEqual([
      { path: 'alpha.txt', line: 2, text: 'two' },
      { path: 'node_modules/skipped.txt', line: 1, text: 'two' },
    ])
  })

  it('when filePattern is given, only matching files are searched', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two', filePattern: '*.md' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches).toEqual([
      { path: 'nested/beta.md', line: 3, text: 'two of them' },
    ])
  })

  it('when context is given, matches include surrounding lines', async () => {
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

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two', context: 1 },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches).toEqual([
      {
        path: 'alpha.txt',
        line: 2,
        text: 'two',
        before: ['one'],
        after: ['three'],
      },
      {
        path: 'nested/beta.md',
        line: 3,
        text: 'two of them',
        before: [''],
        after: [],
      },
    ])
  })

  it('when flags are given, the pattern honours them', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'BETA', flags: 'i' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches).toEqual([
      { path: 'nested/beta.md', line: 1, text: '# Beta' },
    ])
  })

  it('when the pattern is an invalid regex, returns no matches and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: '(' },
    })
    await search.run()

    expect(search.success()).toBe(false)
    expect(search.result()).toEqual({ path, matches: [] })
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Sorted matches: Invalid regular expression',
    )
    expect(loggerErrorSpy.mock.calls[1][0]).toContain(
      'Search files: Invalid regular expression',
    )
  })

  it('when the path is outside the allowed directories, returns no matches and logs', async () => {
    const applicationData = mockApplicationData()
    const path = resolve(process.cwd(), '..', 'outside-directory')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(false)
    expect(search.result()).toEqual({ path, matches: [] })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Search files: path not allowed: ${path}`,
    )
  })

  it('when the directory does not exist, returns no matches and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search', 'missing')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(false)
    expect(search.result()).toEqual({ path, matches: [] })
    expect(loggerErrorSpy.mock.calls[0][0]).toContain('Sorted matches: ')
    expect(loggerErrorSpy.mock.calls[1][0]).toContain('Search files: ')
    expect(loggerErrorSpy.mock.calls[1][0]).toContain(
      'no such file or directory',
    )
  })

  it('when no path permissions are given, allows a path under the current working directory', async () => {
    const applicationData = mockApplicationData()
    const path = join('tests', 'support', 'fixtures', 'tools', 'search')

    const search = searchFiles({
      applicationData,
      operationArguments: { path, pattern: 'two' },
    })
    await search.run()

    expect(search.success()).toBe(true)
    expect(search.result().matches[0]).toEqual({
      path: 'alpha.txt',
      line: 2,
      text: 'two',
    })
  })

  it('when called through searchFiles, returns a SearchFiles', () => {
    const applicationData = mockApplicationData()

    const search = searchFiles({
      applicationData,
      operationArguments: { path: 'tests', pattern: 'two' },
    })

    expect(search).toBeInstanceOf(SearchFiles)
  })
})
