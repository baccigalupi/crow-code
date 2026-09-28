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
import { ProviderEntity } from '../../../../src/domain/providers/entity.ts'
import { Environment } from '../../../../src/env-vars.ts'

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
      new Environment({}),
    )
    const fixture = await loadNousFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getNousModels(provider, logger, mockFetch)

    expect(result).toHaveLength(400)
    expect(result[0].id).toBe('xiaomi/mimo-v2.6-pro-ultraspeed')
    expect(result[0].provider).toBe('nous')
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
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({ data: [] })

    await getNousModels(provider, logger, mockFetch)

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
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await getNousModels(provider, logger, mockFetch)

    expect(result).toEqual([])
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
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await getNousModels(provider, logger, mockFetch)

    expect(result).toEqual([])
  })
})
