import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import type { Logger } from '../../../src/model-info/types.ts'
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
      baseUrl: 'https://nous.example/v1',
      apiKeyEnv: 'NOUS_TEST_KEY',
    }])
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const logger = { error: () => {} } as unknown as Logger
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '  Add commit summaries  \n' } }],
    })

    const summary = await requestCommitSummary(
      crowDirectory,
      'diff contents',
      'ship command',
      logger,
      fetchMock,
    )

    const request = fetchMock.calls[0] as Request
    const body = await request.json()
    expect(summary).toBe('Add commit summaries')
    expect(request.url).toBe('https://nous.example/v1/chat/completions')
    expect(request.headers.get('authorization')).toBe('Bearer secret-key')
    expect(body.model).toBe('first-model')
    expect(body.messages[1].content).toContain('diff contents')
    expect(body.messages[1].content).toContain('ship command')
    Deno.env.delete('NOUS_TEST_KEY')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the API request fails, returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model])
    writeProviders(crowDirectory, [{
      name: 'nous',
      baseUrl: 'https://nous.example/v1',
      apiKeyEnv: 'NOUS_TEST_KEY',
    }])
    Deno.env.set('NOUS_TEST_KEY', 'secret-key')
    const logger = { error: () => {} } as unknown as Logger

    const summary = await requestCommitSummary(
      crowDirectory,
      'diff contents',
      '',
      logger,
      mockFetchError(500),
    )

    expect(summary).toBe('')
    Deno.env.delete('NOUS_TEST_KEY')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when no model is available, logs and returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [])
    writeProviders(crowDirectory, [])
    const messages: string[] = []
    const logger = {
      error: (message: unknown) => messages.push(String(message)),
    } as unknown as Logger

    const summary = await requestCommitSummary(
      crowDirectory,
      'diff',
      '',
      logger,
    )

    expect(summary).toBe('')
    expect(messages[0]).toContain('model')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the model provider is unavailable, logs and returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model])
    writeProviders(crowDirectory, [])
    const messages: string[] = []
    const logger = {
      error: (message: unknown) => messages.push(String(message)),
    } as unknown as Logger

    const summary = await requestCommitSummary(
      crowDirectory,
      'diff',
      '',
      logger,
    )

    expect(summary).toBe('')
    expect(messages[0]).toContain('provider')
    Deno.removeSync(crowDirectory, { recursive: true })
  })

  it('when the API key is unavailable, logs and returns an empty summary', async () => {
    const crowDirectory = Deno.makeTempDirSync()
    writeCatalog(crowDirectory, [model])
    writeProviders(crowDirectory, [{
      name: 'nous',
      baseUrl: 'https://nous.example/v1',
      apiKeyEnv: 'MISSING_TEST_KEY',
    }])
    const messages: string[] = []
    const logger = {
      error: (message: unknown) => messages.push(String(message)),
    } as unknown as Logger

    const summary = await requestCommitSummary(
      crowDirectory,
      'diff',
      '',
      logger,
    )

    expect(summary).toBe('')
    expect(messages[0]).toContain('API key')
    Deno.removeSync(crowDirectory, { recursive: true })
  })
})
