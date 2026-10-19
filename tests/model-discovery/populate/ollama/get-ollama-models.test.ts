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
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { ProviderEntity } from '../../../../src/domain/providers/entity.ts'
import { Environment } from '../../../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../../../src/application-data/filesystem.ts'

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
      new Environment({
        runtimeEnvironment: {},
        filesystem: defaultFilesystem(),
      }),
    )
    const fixture = await loadOllamaFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })

    const result = await getOllamaModels(
      provider,
      applicationData,
    )

    expect(result).toHaveLength(3)
    expect(result[0].id).toBe('qwen3-coder:30b')
    expect(result[0].provider).toBe('ollama')
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
      new Environment({
        runtimeEnvironment: {},
        filesystem: defaultFilesystem(),
      }),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({
      models: [{ name: 'author/model', details: { context_length: 128000 } }],
    })
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })
    const database = await applicationData.database()

    await getOllamaModels(
      provider,
      applicationData,
    )

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[0].name).toBe('author/model')
    expect(rows[0].supported_parameters).toBe('[]')
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
      new Environment({
        runtimeEnvironment: {},
        filesystem: defaultFilesystem(),
      }),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({ models: [] })
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })

    await getOllamaModels(
      provider,
      applicationData,
    )

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('http://other.local:11434/api/tags')
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
      new Environment({
        runtimeEnvironment: {},
        filesystem: defaultFilesystem(),
      }),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })
    const database = await applicationData.database()

    const result = await getOllamaModels(
      provider,
      applicationData,
    )

    expect(result).toEqual([])
    expect(await database('models')).toEqual([])
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
      new Environment({
        runtimeEnvironment: {},
        filesystem: defaultFilesystem(),
      }),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })
    const database = await applicationData.database()

    const result = await getOllamaModels(
      provider,
      applicationData,
    )

    expect(result).toEqual([])
    expect(await database('models')).toEqual([])
  })
})
