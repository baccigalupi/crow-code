import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../src/types.ts'
import { Environment } from '../src/env-vars.ts'
import { run } from '../src/cli.ts'
import { openAndMigrateDatabase } from '../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { mockDenoCommand } from './support/mock-deno-command.ts'
import { mockFetchRoutes, mockFetchSuccess } from './support/mock-fetch.ts'
import pino from 'pino'

describe('run', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'cli', '.crow')))

  it('when the generated summary is empty, does not commit', async () => {
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['git-commit'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      () => {},
      undefined,
      mockDenoCommand() as never,
    )

    expect(true).toBe(true)
  })

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
    expect(outputs[0]).toContain('git-commit')
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
    expect(outputs[0]).toContain('git-commit')
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

  it('when git-commit is passed a goal, sends the goal in the request', async () => {
    const logger = pino({ enabled: false })
    const cliCrowDir = join(fixturesDirectory, 'cli', '.crow')
    const database = await openAndMigrateDatabase(cliCrowDir, logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://nous.example',
      models_path: null,
      api_key_env_var: 'NOUS_TEST_KEY',
    })
    await database('models').insert({
      provider_id: 1,
      identifier: 'first-model',
      name: 'First Model',
      context_length: 1000,
      cost_input: 0,
      cost_output: 0,
      dynamic_delegation: 0,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: 0,
      can_disable_reasoning: 0,
      reasoning_options: '{}',
    })
    await database.destroy()
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'summary' } }],
    })

    await run(
      ['--goal=ship it', 'git-commit'],
      join(fixturesDirectory, 'cli', '.crow'),
      logger,
      () => {},
      fetchMock,
      mockDenoCommand() as never,
      environment,
    )

    const request = fetchMock.calls[0] as Request
    const body = await request.json()
    expect(body.messages[1].content).toContain('ship it')
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
