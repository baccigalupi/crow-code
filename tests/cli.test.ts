import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../src/types.ts'
import { Environment } from '../src/env-vars.ts'
import { run } from '../src/cli.ts'
import { openAndMigrateDatabase } from '../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'
import { FakeCommand } from './support/fake-command.ts'
import { mockFetchRoutes, mockFetchSuccess } from './support/mock-fetch.ts'
import pino from 'pino'

const crowDirectory = join(fixturesDirectory, 'cli', '.crow')

describe('run', () => {
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

  it('when the generated summary is empty, does not commit', async () => {
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['git-commit'],
      crowDirectory,
      logger,
      () => {},
      undefined,
      FakeCommand as never,
    )
  })

  it('when create-model-catalog is requested, builds the model catalog', async () => {
    await Deno.mkdir(crowDirectory, { recursive: true })
    await Deno.writeTextFile(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'ollama',
          baseUrl: 'http://pile-driver.local:11434',
          modelsUrl: 'http://pile-driver.local:11434/api/tags',
        }],
      }),
    )
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchRoutes([['pile-driver', { models: [] }]])

    await run(
      ['create-model-catalog'],
      crowDirectory,
      logger,
      () => {},
      fetchMock,
    )

    expect(fetchMock.calls).toHaveLength(1)
    expect(Deno.statSync(join(crowDirectory, 'models.json')).isFile).toBe(true)
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
      crowDirectory,
      logger,
      () => {},
    )

    const database = await openAndMigrateDatabase(crowDirectory, logger)
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

    await run(['unknown'], crowDirectory, logger, consoleLog)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when -h is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['-h'],
      crowDirectory,
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain('create-model-catalog')
    expect(outputs[0]).toContain('git-commit')
  })

  it('when --help is passed, writes help text without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['--help'],
      crowDirectory,
      logger,
      (summary: string) => outputs.push(summary),
      () => {
        throw new Error('fetch should not be called')
      },
    )

    expect(outputs[0]).toContain('Usage: crow')
    expect(outputs[0]).toContain('create-model-catalog')
    expect(outputs[0]).toContain('git-commit')
  })

  it('when -V is passed, writes the version without invoking command dependencies', async () => {
    const outputs: string[] = []
    const logger = { error: () => {}, info: () => {} } as unknown as Logger

    await run(
      ['-V'],
      crowDirectory,
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
      crowDirectory,
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

    await run([], crowDirectory, logger, consoleLog)

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })

  it('when git-commit is passed a goal, sends the goal in the request', async () => {
    const models = [{
      id: 'first-model',
      name: 'First Model',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }]
    await Deno.mkdir(crowDirectory, { recursive: true })
    await Deno.writeTextFile(
      join(crowDirectory, 'models.json'),
      JSON.stringify({
        fetchedAt: '',
        modelCount: models.length,
        models,
      }),
    )
    await Deno.writeTextFile(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'nous',
          baseUrl: 'https://nous.example/v1',
          apiKeyEnv: 'NOUS_TEST_KEY',
        }],
      }),
    )

    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const logger = { error: () => {}, info: () => {} } as unknown as Logger
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'summary' } }],
    })

    await run(
      ['--goal=ship it', 'git-commit'],
      crowDirectory,
      logger,
      () => {},
      fetchMock,
      FakeCommand as never,
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
      crowDirectory,
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
