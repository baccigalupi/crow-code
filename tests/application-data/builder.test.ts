import { describe, expect, it } from 'bun:test'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { buildApplicationData } from '../../src/application-data/builder.ts'
import { mockRuntime } from '../support/mock-command.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('buildApplicationData', () => {
  it('when a path is provided, prefers it over the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    const builder = buildApplicationData({
      path,
      runtime: mockRuntime({
        args: ['--config=./missing-config.json'],
        stdout: '/some/repo\n',
      }),
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
      runtime: mockRuntime({
        args: [`--config=${path}`],
        stdout: '/some/repo\n',
      }),
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
      runtime: mockRuntime({ stdout: '/some/repo\n' }),
    })

    await builder.run()
    const applicationData = builder.result()
    await applicationData.database()

    expect(applicationData.config.crowGlobalDirectory).toBe(
      'tests/support/fixtures/.crow',
    )
    expect(existsSync(join(crowGlobalDirectory, 'crow.db'))).toBe(true)
    await applicationData.close()
    await clearDirectory(crowGlobalDirectory)
  })

  it('when the config sets an environment file, its values are available', async () => {
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'env-file-builder-config.json'),
      runtime: mockRuntime({ stdout: '/some/repo\n' }),
    })

    await builder.run()
    const applicationData = builder.result()

    expect(applicationData.envars.value('BUILDER_ONLY_KEY')).toBe(
      'builder-value',
    )
    await applicationData.close()
    await clearDirectory(join(fixturesDirectory, '.crow'))
  })

  it('when the database cannot be opened, fails with the reason', async () => {
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'unwritable-global-config.json'),
      runtime: mockRuntime({ stdout: '/some/repo\n' }),
    })

    await builder.run()

    expect(builder.success()).toBe(false)
    expect(builder.reason.length).toBeGreaterThan(0)
  })

  it('when called with no arguments, uses the real Deno runtime', async () => {
    const builder = buildApplicationData()

    await builder.run()
    const applicationData = builder.result()

    expect(applicationData.repositoryRoot.length).toBeGreaterThan(0)
  })

  it('when the config file is malformed, fails with the reason', async () => {
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'malformed-config.txt'),
      runtime: mockRuntime({ stdout: '/some/repo\n' }),
    })

    await builder.run()

    expect(builder.success()).toBe(false)
    expect(builder.reason).toBe('the file is not valid JSON')
  })

  it('when git cannot find the repository root, fails with the git error', async () => {
    const builder = buildApplicationData({
      path: join(fixturesDirectory, 'config.json'),
      runtime: mockRuntime({
        stdout: '',
        success: false,
        stderr: 'fatal: not a git repository',
      }),
    })

    await builder.run()

    expect(builder.success()).toBe(false)
    expect(builder.reason).toBe('fatal: not a git repository')
    await builder.result().close()
    await clearDirectory(join(fixturesDirectory, '.crow'))
  })
})
