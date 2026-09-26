import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import knex from 'knex'
import type { Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { requestCommitSummary } from '../../../src/tasks/git-commit/request.ts'

const fixtureDirectory = join(fixturesDirectory, 'request-commit-summary')

describe('requestCommitSummary', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

  it('when configured, requests and returns a trimmed summary', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const firstModel = {
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
    }
    const models = [firstModel, { ...firstModel, id: 'second-model' }]
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({
        fetchedAt: '',
        modelCount: models.length,
        models,
      }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'nous',
          baseUrl: 'https://nous.example',
          apiKeyEnv: 'NOUS_TEST_KEY',
        }],
      }),
    )

    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const logger = { error: () => {} } as unknown as Logger
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '  Add commit summaries  \n' } }],
    })

    const summary = await requestCommitSummary(
      'diff contents',
      'ship command',
      {
        parsedArguments: { commands: ['git-commit'], options: {} },
        crowDirectory,
        logger,
        database: knex({
          client: 'better-sqlite3',
          connection: ':memory:',
          useNullAsDefault: true,
        }),
        consoleLog: () => {},
        fetchClient: fetchMock,
        denoCommand: Deno.Command,
        environment,
      },
    )

    const request = fetchMock.calls[0] as Request
    const body = await request.json()

    expect(summary).toBe('Add commit summaries')
    expect(request.url).toBe('https://nous.example/v1/chat/completions')
    expect(request.headers.get('authorization')).toBe('Bearer secret-key')
    expect(body.model).toBe('first-model')
    expect(body.messages[1].content).toContain('diff contents')
    expect(body.messages[1].content).toContain('ship command')
  })

  it('when the provider is keyless, requests without an API key', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const models = [{
      id: 'first-model',
      name: 'First Model',
      provider: 'ollama',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }]
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({
        fetchedAt: '',
        modelCount: models.length,
        models,
      }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'ollama',
          baseUrl: 'http://ollama.example',
        }],
      }),
    )

    const environment = new Environment({})
    const logger = { error: () => {} } as unknown as Logger
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Keyless summary' } }],
    })

    const summary = await requestCommitSummary('diff', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: fetchMock,
      denoCommand: Deno.Command,
      environment,
    })

    const request = fetchMock.calls[0] as Request
    const body = await request.json()

    expect(summary).toBe('Keyless summary')
    expect(request.url).toBe('http://ollama.example/v1/chat/completions')
    expect(body.model).toBe('first-model')
  })

  it('when the API request fails, returns an empty summary', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
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
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({
        fetchedAt: '',
        modelCount: models.length,
        models,
      }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({
        providers: [{
          name: 'nous',
          baseUrl: 'https://nous.example',
          apiKeyEnv: 'NOUS_TEST_KEY',
        }],
      }),
    )

    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const logger = { error: () => {} } as unknown as Logger

    const summary = await requestCommitSummary('diff contents', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: mockFetchError(500),
      denoCommand: Deno.Command,
      environment,
    })

    expect(summary).toBe('')
  })

  it('when no model is available, returns an empty summary', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({ fetchedAt: '', modelCount: 0, models: [] }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({ providers: [] }),
    )

    const errors: string[] = []
    const logger = {
      error: (message: string) => errors.push(message),
    } as unknown as Logger

    const summary = await requestCommitSummary('diff', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: mockFetchRejected('fetch should not be called'),
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(summary).toBe('')
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
    ])
  })

  it('when the model provider is unavailable, returns an empty summary', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
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
    Deno.mkdirSync(crowDirectory, { recursive: true })
    Deno.writeTextFileSync(
      join(crowDirectory, 'models.json'),
      JSON.stringify({
        fetchedAt: '',
        modelCount: models.length,
        models,
      }),
    )
    Deno.writeTextFileSync(
      join(crowDirectory, 'providers.json'),
      JSON.stringify({ providers: [] }),
    )

    const errors: string[] = []
    const logger = {
      error: (message: string) => errors.push(message),
    } as unknown as Logger

    const summary = await requestCommitSummary('diff', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: mockFetchRejected('fetch should not be called'),
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(summary).toBe('')
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
    ])
  })
})
