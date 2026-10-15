import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy } from '@std/testing/mock'
import { findFiles } from '../../../../src/tools/files/read-only/find.ts'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import {
  clearDirectory,
  createSearchFixtureNodeModules,
  fixturesDirectory,
  searchFixtureNodeModules,
} from '../../../support/fixtures.ts'

describe('find', () => {
  beforeEach(createSearchFixtureNodeModules)
  afterEach(() => clearDirectory(searchFixtureNodeModules()))

  it('when the pattern matches files, returns matching relative paths sorted', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')

    const find = findFiles({
      applicationData,
      operationArguments: { path, pattern: 'nested/**' },
    })
    await find.run()

    expect(find.success()).toBe(true)
    expect(find.result()).toEqual({
      path,
      paths: ['nested/beta.md', 'nested/blob.bin'],
    })
  })

  it('when the pattern has no directory part, it matches basenames', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')

    const find = findFiles({
      applicationData,
      operationArguments: { path, pattern: '*.md' },
    })
    await find.run()

    expect(find.success()).toBe(true)
    expect(find.result().paths).toEqual(['nested/beta.md'])
  })

  it('when the config ignores only the default, files under node_modules are included', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search')

    const find = findFiles({
      applicationData,
      operationArguments: { path, pattern: '**/*' },
    })
    await find.run()

    expect(find.success()).toBe(true)
    expect(find.result().paths).toContain('node_modules/skipped.txt')
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
        },
      }),
    })

    const find = findFiles({
      applicationData,
      operationArguments: { path, pattern: '**/*' },
    })
    await find.run()

    expect(find.success()).toBe(true)
    expect(find.result().paths).toEqual([
      'alpha.txt',
      'node_modules/skipped.txt',
    ])
  })

  it('when the path is outside the allowed directories, returns no paths and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(Deno.cwd(), '..')
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const find = findFiles({
      applicationData,
      operationArguments: { path, pattern: '**/*' },
    })
    await find.run()

    expect(find.success()).toBe(false)
    expect(find.result()).toEqual({ path, paths: [] })
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Find files: path not allowed: ${path}`,
    )
  })

  it('when the directory does not exist, returns no paths and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'search', 'missing')
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const find = findFiles({
      applicationData,
      operationArguments: { path, pattern: '**/*' },
    })
    await find.run()

    expect(find.success()).toBe(false)
    expect(find.result()).toEqual({ path, paths: [] })
    expect(loggerErrorSpy.calls[0].args[0]).toContain('Find files: ')
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'No such file or directory',
    )
  })
})
