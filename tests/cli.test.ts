import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import pino from 'pino'
import { run } from '../src/cli.ts'
import { openAndMigrateDatabase } from '../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockApplicationData } from './support/mock-application-data.ts'
import { mockFetchRoutes } from './support/mock-fetch.ts'

describe('run', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))

  it('when create-model-catalog is requested, populates the model catalog', async () => {
    const database = await openAndMigrateDatabase(
      join(fixturesDirectory, 'cli', '.crow'),
      pino({ enabled: false }),
    )
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      database,
      fetch: fetchMock,
    })

    await run(applicationData)

    expect(fetchMock.calls).toHaveLength(1)
    await database.destroy()
  })

  it('when add-provider is requested, creates the provider', async () => {
    const database = await openAndMigrateDatabase(
      join(fixturesDirectory, 'cli', '.crow'),
      pino({ enabled: false }),
    )
    const applicationData = mockApplicationData({
      args: [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      database,
      consoleLog: () => {},
    })

    await run(applicationData)

    const rows = await database('providers').select('*')
    expect(rows).toEqual([{
      id: expect.any(Number),
      name: 'ollama',
      base_url: 'http://x',
      models_path: null,
      api_key_env_var: 'OLLAMA_KEY',
    }])
    await database.destroy()
  })

  it('when the command is unknown, writes usage', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['unknown'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog,
    })

    await run(applicationData)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-h'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when --help is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--help'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when -V is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const applicationData = mockApplicationData({
      args: ['--version'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog: (summary: string) => outputs.push(summary),
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when a command finishes, closes the application data', async () => {
    const close = mock.fn(() => Promise.resolve())
    const applicationData = mockApplicationData({
      args: ['-V'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      close,
      consoleLog: () => {},
    })

    await run(applicationData)

    expect(close.mock.calls).toHaveLength(1)
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['--unknown'],
      crowDirectory: join(fixturesDirectory, 'cli', '.crow'),
      consoleLog,
      fetch: () => {
        throw new Error('fetch should not be called')
      },
    })

    await run(applicationData)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })
})
