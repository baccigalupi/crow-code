import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../support/mock-fetch.ts'
import { loadNousFixture } from '../../../support/fixtures.ts'
import { getNousModels } from '../../../../src/model-discovery/populate/nous/get-nous-models.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { ProviderEntity } from '../../../../src/domain/providers/entity.ts'
import { mockEnvironment } from '../../../support/mock-environment.ts'

describe('getNousModels', () => {
  it('when fetched, returns parsed records', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      mockEnvironment({}),
    )
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })

    const result = await getNousModels(
      provider,
      applicationData,
    )

    expect(result).toHaveLength(400)
    expect(result[0].id).toBe('xiaomi/mimo-v2.6-pro-ultraspeed')
    expect(result[0].provider).toBe('nous')
  })

  it('when fetched, saves each retrieved model to the models table', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'nous',
        baseUrl: 'https://example.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      mockEnvironment({}),
    )
    const logger = pino({ enabled: false })
    const record = {
      id: 'author/model',
      name: 'Model',
      context_length: 128000,
      pricing: { prompt: '0.000001', completion: '0.000002' },
      architecture: { modality: 'text->text' },
      supported_parameters: ['temperature'],
    }
    const mockFetch = mockFetchSuccess({ data: [record] })
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })
    const database = await applicationData.database()

    await getNousModels(
      provider,
      applicationData,
    )

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[0].name).toBe('Model')
    expect(rows[0].supported_parameters).toBe('["temperature"]')
  })

  it('when fetched, requests the configured base url plus v1 models', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'nous',
        baseUrl: 'https://example.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      mockEnvironment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({ data: [] })
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })

    await getNousModels(
      provider,
      applicationData,
    )

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://example.com/v1/models')
  })

  it('when the response is not ok, returns an empty list', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      mockEnvironment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })
    const database = await applicationData.database()

    const result = await getNousModels(
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
        name: 'nous',
        baseUrl: 'https://inference-api.nousresearch.com',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      mockEnvironment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')
    const applicationData = mockApplicationData({ logger, fetch: mockFetch })
    const database = await applicationData.database()

    const result = await getNousModels(
      provider,
      applicationData,
    )

    expect(result).toEqual([])
    expect(await database('models')).toEqual([])
  })
})
