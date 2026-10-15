import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { exists } from '@std/fs'
import { spy, stub } from '@std/testing/mock'
import { buildApplicationData } from '../../src/application-data/builder.ts'
import { Runtime } from '../../src/application-data/runtime.ts'
import { mockDeno } from '../support/mock-deno-command.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('buildApplicationData', () => {
  it('when a path is provided, prefers it over the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    const builder = buildApplicationData({
      path,
      runtime: new Runtime(mockDeno({
        args: ['--config=./missing-config.json'],
        stdout: '/some/repo\n',
      })),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.crowGlobalDirectory).toBe(
      'tests/support/fixtures/.crow',
    )
    expect(applicationData.io.repoCrowDirectory).toEqual(fixturesDirectory)
    expect(applicationData.repositoryRoot).toBe('/some/repo')
    await applicationData.close()
    await clearDirectory(join(fixturesDirectory, '.crow'))
  })

  it('when no path is provided, uses the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    const builder = buildApplicationData({
      runtime: new Runtime(
        mockDeno({ args: [`--config=${path}`], stdout: '/some/repo\n' }),
      ),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.crowGlobalDirectory).toBe(
      'tests/support/fixtures/.crow',
    )
    expect(applicationData.io.repoCrowDirectory).toEqual(fixturesDirectory)
    expect(applicationData.repositoryRoot).toBe('/some/repo')
    await applicationData.close()
    await clearDirectory(join(fixturesDirectory, '.crow'))
  })

  it('when the config points at an alternative global directory, the database file is there', async () => {
    const crowGlobalDirectory = join(fixturesDirectory, '.crow')
    await clearDirectory(crowGlobalDirectory)
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'crow-global-config.json'),
      runtime: new Runtime(mockDeno({ stdout: '/some/repo\n' })),
    })

    await builder.run()
    const applicationData = builder.result()
    await applicationData.database()

    expect(applicationData.config.crowGlobalDirectory).toBe(
      'tests/support/fixtures/.crow',
    )
    expect(await exists(join(crowGlobalDirectory, 'crow.db'))).toBe(true)
    await applicationData.close()
    await clearDirectory(crowGlobalDirectory)
  })

  it('when the config sets an environment file, its values are available', async () => {
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'env-file-builder-config.json'),
      runtime: new Runtime(mockDeno({ stdout: '/some/repo\n' })),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(applicationData.envars().value('BUILDER_ONLY_KEY')).toBe(
      'builder-value',
    )
    await applicationData.close()
    await clearDirectory(join(fixturesDirectory, '.crow'))
  })

  it('when the database cannot be opened, reports the failure', async () => {
    const errorSpy = spy()
    using _error = stub(console, 'error', errorSpy)
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'unwritable-global-config.json'),
      runtime: new Runtime(mockDeno({ stdout: '/some/repo\n' })),
    })

    await builder.run()

    expect(builder.success()).toBe(false)
    expect(builder.reason.length).toBeGreaterThan(0)
    expect(errorSpy.calls[0].args[0]).toContain('Could not open the database')
  })

  it('when called with no arguments, uses the real Deno runtime', async () => {
    const builder = buildApplicationData()

    await builder.run()
    const applicationData = builder.result()

    expect(applicationData.repositoryRoot.length).toBeGreaterThan(0)
  })

  it('when no config path resolves, continues with the default config', async () => {
    const builder = buildApplicationData({
      runtime: new Runtime(mockDeno({ stdout: '/some/repo\n' })),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(false)
    expect(applicationData.config.crowGlobalDirectory).toBe('~/.crow')
    expect(applicationData.io.repoCrowDirectory).toEqual('.crow')
    expect(applicationData.repositoryRoot).toBe('/some/repo')
  })

  it('when the config file is missing, reports only what was attempted', async () => {
    const errorSpy = spy()
    using _error = stub(console, 'error', errorSpy)
    const builder = buildApplicationData({
      runtime: new Runtime(mockDeno({ stdout: '/some/repo\n' })),
    })

    await builder.run()

    expect(errorSpy.calls).toHaveLength(1)
    expect(errorSpy.calls[0].args[0]).toBe(
      "Could not load the config from '.crow/config.json'",
    )
  })

  it('when the config file is malformed, reports that the file is not valid JSON', async () => {
    const errorSpy = spy()
    using _error = stub(console, 'error', errorSpy)
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'malformed-config.txt'),
      runtime: new Runtime(mockDeno({ stdout: '/some/repo\n' })),
    })

    await builder.run()

    expect(errorSpy.calls).toHaveLength(1)
    expect(errorSpy.calls[0].args[0]).toBe(
      `Could not load the config from '${
        join(fixturesDirectory, 'malformed-config.txt')
      }': the file is not valid JSON`,
    )
  })

  it('when git cannot find the repository root, reports the git error', async () => {
    const errorSpy = spy()
    using _error = stub(console, 'error', errorSpy)
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'config.json'),
      runtime: new Runtime(mockDeno({
        stdout: '',
        success: false,
        stderr: 'fatal: not a git repository',
      })),
    })

    await builder.run()

    expect(errorSpy.calls).toHaveLength(1)
    expect(errorSpy.calls[0].args[0]).toBe(
      'Could not find the repository root: fatal: not a git repository',
    )
    await builder.result().close()
    await clearDirectory(join(fixturesDirectory, '.crow'))
  })
})
