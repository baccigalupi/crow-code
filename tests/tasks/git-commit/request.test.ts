import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import type { Logger } from '../../../src/types.ts'
import { Environment } from '../../../src/env-vars.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { testModelRow, testProviderRow } from '../../support/model-rows.ts'
import { requestCommitSummary } from '../../../src/tasks/git-commit/request.ts'

describe('requestCommitSummary', () => {
  it('when configured, requests and returns a trimmed summary', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert([
      testModelRow({}),
      testModelRow({ identifier: 'second-model' }),
    ])
    const environment = new Environment({ NOUS_TEST_KEY: 'secret-key' })
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: '  Add commit summaries  \n' } }],
    })

    const summary = await requestCommitSummary(
      'diff contents',
      'ship command',
      mockApplicationData({
        database,
        logger,
        environment,
        fetchClient: fetchMock,
      }),
    )

    const request = fetchMock.calls[0] as Request
    const body = await request.json()
    expect(summary).toBe('Add commit summaries')
    expect(request.url).toBe('https://nous.example/v1/chat/completions')
    expect(request.headers.get('authorization')).toBe('Bearer secret-key')
    expect(body.model).toBe('first-model')
    expect(body.messages[1].content).toContain('diff contents')
    expect(body.messages[1].content).toContain('ship command')
    await database.destroy()
  })

  it('when the provider is keyless, requests without an API key', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(
      testProviderRow({
        name: 'ollama',
        base_url: 'http://ollama.example',
        api_key_env_var: null,
      }),
    )
    await database('models').insert(testModelRow({}))
    const fetchMock = mockFetchSuccess({
      choices: [{ message: { content: 'Keyless summary' } }],
    })

    const summary = await requestCommitSummary(
      'diff',
      '',
      mockApplicationData({
        database,
        logger,
        environment: new Environment({}),
        fetchClient: fetchMock,
      }),
    )

    const request = fetchMock.calls[0] as Request
    const body = await request.json()
    expect(summary).toBe('Keyless summary')
    expect(request.url).toBe('http://ollama.example/v1/chat/completions')
    expect(body.model).toBe('first-model')
    await database.destroy()
  })

  it('when the API request fails, returns an empty summary', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert(testModelRow({}))

    const summary = await requestCommitSummary(
      'diff contents',
      '',
      mockApplicationData({
        database,
        logger,
        environment: new Environment({ NOUS_TEST_KEY: 'secret-key' }),
        fetchClient: mockFetchError(500),
      }),
    )

    expect(summary).toBe('')
    await database.destroy()
  })

  it('when no model is available, returns an empty summary', async () => {
    const errors: string[] = []
    const logger = {
      info: () => {},
      error: (message: string) => errors.push(message),
    } as unknown as Logger
    const database = await createTestDatabase(logger)

    const summary = await requestCommitSummary(
      'diff',
      '',
      mockApplicationData({
        database,
        logger,
        environment: new Environment({}),
        fetchClient: mockFetchRejected('fetch should not be called'),
      }),
    )

    expect(summary).toBe('')
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
    ])
    await database.destroy()
  })

  it('when the model provider is unavailable, returns an empty summary', async () => {
    const errors: string[] = []
    const logger = {
      info: () => {},
      error: (message: string) => errors.push(message),
    } as unknown as Logger
    const database = await createTestDatabase(logger)
    await database('providers').insert(testProviderRow())
    await database('models').insert(testModelRow({ provider_id: 2 }))

    const summary = await requestCommitSummary(
      'diff',
      '',
      mockApplicationData({
        database,
        logger,
        environment: new Environment({}),
        fetchClient: mockFetchRejected('fetch should not be called'),
      }),
    )

    expect(summary).toBe('')
    expect(errors).toEqual([
      'No usable model endpoint; skipping commit summary',
    ])
    await database.destroy()
  })
})
