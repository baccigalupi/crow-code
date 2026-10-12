import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { stub } from '@std/testing/mock'
import { buildApplicationData } from '../../src/application-data/builder.ts'
import { DenoRuntime } from '../../src/application-data/deno-runtime.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('buildApplicationData', () => {
  it('when a path is provided, prefers it over the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    using _parsedArguments = stub(
      DenoRuntime.prototype,
      'parsedArguments',
      () => ({
        commands: [],
        options: { config: './missing-config.json' },
        configPath: () => './missing-config.json',
      }),
    )
    const builder = buildApplicationData(path)

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.userDirectory).toBe('/custom/crow')
    expect(applicationData.io.repoCrowDirectory).toEqual(fixturesDirectory)
  })

  it('when no path is provided, uses the command-line path', async () => {
    const path = join(fixturesDirectory, 'config.json')
    using _parsedArguments = stub(
      DenoRuntime.prototype,
      'parsedArguments',
      () => ({
        commands: [],
        options: { config: path },
        configPath: () => path,
      }),
    )
    const builder = buildApplicationData()

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(true)
    expect(applicationData.config.userDirectory).toBe('/custom/crow')
    expect(applicationData.io.repoCrowDirectory).toEqual(fixturesDirectory)
  })

  it('when no config path resolves, continues with the default config', async () => {
    const builder = buildApplicationData()

    await builder.run()
    const applicationData = builder.result()

    expect(builder.success()).toBe(false)
    expect(applicationData.config.userDirectory).toBe('~/.crow')
    expect(applicationData.io.repoCrowDirectory).toEqual('.crow')
  })
})
