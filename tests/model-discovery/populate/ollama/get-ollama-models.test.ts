import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../support/mock-fetch.ts'
import { loadOllamaFixture } from '../../../support/fixtures.ts'
import { getOllamaModels } from '../../../../src/model-discovery/populate/ollama/get-ollama-models.ts'
import { createTestDatabase } from '../../../support/test-database.ts'
import { ProviderEntity } from '../../../../src/domain/providers/entity.ts'
import { Environment } from '../../../../src/env-vars.ts'

describe('getOllamaModels', () => {
  it('when fetched, returns parsed records', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'ollama',
        baseUrl: 'http://pile-driver.local:11434',
        modelsPath: '/api/tags',
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const fixture = await loadOllamaFixture()
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getOllamaModels(provider, logger, database, mockFetch)

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
    await database.destroy()
  })

  it('when fetched, saves each retrieved model to the models table', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'ollama',
        baseUrl: 'http://pile-driver.local:11434',
        modelsPath: '/api/tags',
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'author/model', details: { context_length: 128000 } }],
    })

    await getOllamaModels(provider, logger, database, mockFetch)

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[0].name).toBe('author/model')
    expect(rows[0].supported_parameters).toBe('[]')
    await database.destroy()
  })

  it('when fetched, requests the configured modelsUrl', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'ollama',
        baseUrl: 'http://other.local:11434',
        modelsPath: '/api/tags',
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const mockFetch = mockFetchSuccess({ models: [] })

    await getOllamaModels(provider, logger, database, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('http://other.local:11434/api/tags')
    await database.destroy()
  })

  it('when the response is not ok, returns an empty list', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'ollama',
        baseUrl: 'http://pile-driver.local:11434',
        modelsPath: '/api/tags',
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const mockFetch = mockFetchError(500)

    const result = await getOllamaModels(provider, logger, database, mockFetch)

    expect(result).toEqual([])
    expect(await database('models')).toEqual([])
    await database.destroy()
  })

  it('when the network request fails, returns an empty list', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'ollama',
        baseUrl: 'http://pile-driver.local:11434',
        modelsPath: '/api/tags',
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const mockFetch = mockFetchRejected('network down')

    const result = await getOllamaModels(provider, logger, database, mockFetch)

    expect(result).toEqual([])
    expect(await database('models')).toEqual([])
    await database.destroy()
  })
})
