import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { populateModels } from '../../../src/model-discovery/populate/populate-models.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { Environment } from '../../../src/env-vars.ts'
import { mockFetchRoutes, mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('populateModels', () => {
  it('with no providers, returns an empty list and makes no requests', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const mockFetch = mockFetchSuccess({ data: [] })

    const result = await populateModels(
      new Environment({}),
      database,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
    expect(mockFetch.calls).toHaveLength(0)
    await database.destroy()
  })

  it('dispatches a known provider to its getter and saves models', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://example.com',
      models_path: null,
      api_key_env_var: null,
    })
    const record = {
      id: 'author/model',
      name: 'Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }
    const mockFetch = mockFetchSuccess({ data: [record] })

    const result = await populateModels(
      new Environment({}),
      database,
      logger,
      mockFetch,
    )

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('author/model')
    expect(result[0].provider).toBe('nous')
    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://example.com/v1/models')
    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].identifier).toBe('author/model')
    await database.destroy()
  })

  it('dispatches ollama providers to the ollama getter', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://ollama.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'author/model', details: { context_length: 128000 } }],
    })

    await populateModels(new Environment({}), database, logger, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('http://ollama.local:11434/api/tags')
    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].identifier).toBe('author/model')
    await database.destroy()
  })

  it('dispatches openrouter providers to the openrouter getter', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'openrouter',
      base_url: 'https://openrouter.example',
      models_path: null,
      api_key_env_var: null,
    })
    const record = {
      id: 'author/model',
      name: 'Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }
    const mockFetch = mockFetchSuccess({ data: [record] })

    await populateModels(new Environment({}), database, logger, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://openrouter.example/v1/models')
    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    await database.destroy()
  })

  it('skips providers with an unknown name', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'mystery',
      base_url: 'https://unknown.example',
      models_path: null,
      api_key_env_var: null,
    })
    const mockFetch = mockFetchSuccess({ data: [] })

    const result = await populateModels(
      new Environment({}),
      database,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
    expect(mockFetch.calls).toHaveLength(0)
    expect(await database('models')).toEqual([])
    await database.destroy()
  })

  it('populates multiple providers concurrently', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const [nousId, ollamaId] = await database('providers')
      .insert([
        {
          name: 'nous',
          base_url: 'https://nous.example',
          models_path: null,
          api_key_env_var: null,
        },
        {
          name: 'ollama',
          base_url: 'http://ollama.local:11434',
          models_path: '/api/tags',
          api_key_env_var: null,
        },
      ])
      .returning('id')
    const mockFetch = mockFetchRoutes([
      [
        'nous.example',
        {
          data: [
            {
              id: 'nous/model',
              name: 'Nous Model',
              context_length: 128000,
              pricing: { prompt: '0.000001', completion: '0.000002' },
              architecture: { modality: 'text->text' },
              supported_parameters: ['temperature'],
            },
          ],
        },
      ],
      [
        'ollama.local',
        {
          models: [
            {
              name: 'ollama/model',
              details: { context_length: 64000 },
            },
          ],
        },
      ],
    ])

    const result = await populateModels(
      new Environment({}),
      database,
      logger,
      mockFetch,
    )

    expect(result).toHaveLength(2)
    expect(mockFetch.calls).toHaveLength(2)
    const rows = await database('models').orderBy('id')
    expect(rows).toHaveLength(2)
    expect(rows[0].provider_id).toBe(nousId.id)
    expect(rows[0].identifier).toBe('nous/model')
    expect(rows[1].provider_id).toBe(ollamaId.id)
    expect(rows[1].identifier).toBe('ollama/model')
    await database.destroy()
  })
})
