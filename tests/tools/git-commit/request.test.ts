import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import { mockFetchRejected } from '../../support/mock-fetch.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'
import { requestCommitSummary } from '../../../src/tools/git-commit/request.ts'

const model = {
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

const writeCatalog = (crowDirectory: string, models: unknown[]) => {
  Deno.writeTextFileSync(
    join(crowDirectory, 'models.json'),
    JSON.stringify({ fetchedAt: '', modelCount: models.length, models }),
  )
}

const writeProviders = (crowDirectory: string, providers: unknown[]) => {
  Deno.writeTextFileSync(
    join(crowDirectory, 'providers.json'),
    JSON.stringify({ providers }),
  )
}

describe('requestCommitSummary', () => {
  it('when configured, requests and returns a trimmed summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model, { ...model, id: 'second-model' }])
    writeProviders(crowDirectory, [{
      name: 'nous',
      baseUrl: 'https://nous.example',
      apiKeyEnv: 'NOUS_TEST_KEY',
    }])
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
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the provider is keyless, requests without an API key', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [{ ...model, provider: 'ollama' }])
    writeProviders(crowDirectory, [{
      name: 'ollama',
      baseUrl: 'http://ollama.example',
    }])
    const environment = new Environment({})
    const logger = { error: () => {} } as unknown as Logger
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Keyless summary' } }],
    })

    const summary = await requestCommitSummary('diff', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
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
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the API request fails, returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model])
    writeProviders(crowDirectory, [{
      name: 'nous',
      baseUrl: 'https://nous.example',
      apiKeyEnv: 'NOUS_TEST_KEY',
    }])
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const logger = { error: () => {} } as unknown as Logger

    const summary = await requestCommitSummary('diff contents', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      consoleLog: () => {},
      fetchClient: mockFetchError(500),
      denoCommand: Deno.Command,
      environment,
    })

    expect(summary).toBe('')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when no model is available, returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [])
    writeProviders(crowDirectory, [])
    const errors: string[] = []
    const logger = {
      error: (message: string) => errors.push(message),
    } as unknown as Logger

    const summary = await requestCommitSummary('diff', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      consoleLog: () => {},
      fetchClient: mockFetchRejected('fetch should not be called'),
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(summary).toBe('')
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
    ])
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the model provider is unavailable, returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model])
    writeProviders(crowDirectory, [])
    const errors: string[] = []
    const logger = {
      error: (message: string) => errors.push(message),
    } as unknown as Logger

    const summary = await requestCommitSummary('diff', '', {
      parsedArguments: { commands: ['git-commit'], options: {} },
      crowDirectory,
      logger,
      consoleLog: () => {},
      fetchClient: mockFetchRejected('fetch should not be called'),
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(summary).toBe('')
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
    ])
    Deno.removeSync(crowDirectory, { recursive: true })
  })
})
