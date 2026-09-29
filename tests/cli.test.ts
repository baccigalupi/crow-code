import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../src/types.ts'
import { run } from '../src/cli.ts'
import { openAndMigrateDatabase } from '../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockFetchRoutes } from './support/mock-fetch.ts'
import pino from 'pino'

describe('run', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))

  it('when create-model-catalog is requested, populates the model catalog', async () => {
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
    )
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })
    await database.destroy()
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])

    await run(
      ['create-model-catalog'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      () => {},
      fetchMock,
    )

    expect(fetchMock.calls).toHaveLength(1)
  })

  it('when add-provider is requested, creates the provider', async () => {
    const logger = pino({ enabled: false })

    await run(
      [
        'add-provider',
        '--name=ollama',
        '--base-url=http://x',
        '--api-key-env-var=OLLAMA_KEY',
      ],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      () => {},
    )

    const database = await openAndMigrateDatabase(
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
    )
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
    const logger = { error: () => {}, info: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run(
      ['unknown'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      consoleLog,
    )

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['-h'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when --help is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['--help'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain(
      'create-model-catalog   populate models from configured providers',
    )
  })

  it('when -V is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['-V'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when --version is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['--version'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toBe('crow 0.0.1')
  })

  it('when no arguments are passed, writes usage', async () => {
    const logger = { error: () => {}, info: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run([], join(fixturesDirectory, 'cli', '.crow'), logger, consoleLog)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when an unsupported option is passed, writes usage without invoking command dependencies', async () => {
    const logger = { error: () => {}, info: () => {} } as unknown as Logger
    const consoleLog = mock.fn()

    await run(
      ['--unknown'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      consoleLog,
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })
})
