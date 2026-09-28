import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../support/mock-fetch.ts'
import { loadOpenRouterFixture } from '../../../support/fixtures.ts'
import { getOpenRouterModels } from '../../../../src/model-discovery/populate/openrouter/get-openrouter-models.ts'
import { ProviderEntity } from '../../../../src/domain/providers/entity.ts'
import { Environment } from '../../../../src/env-vars.ts'

describe('getOpenRouterModels', () => {
  it('when fetched, returns parsed records', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'openrouter',
        baseUrl: 'https://openrouter.ai/api',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const fixture = await loadOpenRouterFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getOpenRouterModels(provider, logger, mockFetch)

    expect(result).toHaveLength(458)
    expect(result[0].id).toBe('fireworks/ember-1')
    expect(result[0].provider).toBe('openrouter')
  })

  it('when fetched, requests the configured base url plus v1 models', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'openrouter',
        baseUrl: 'https://example.com/api',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({ data: [] })

    await getOpenRouterModels(provider, logger, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://example.com/api/v1/models')
  })

  it('when the response is not ok, returns an empty list', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'openrouter',
        baseUrl: 'https://openrouter.ai/api',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await getOpenRouterModels(provider, logger, mockFetch)

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    const provider = new ProviderEntity(
      {
        id: 1,
        name: 'openrouter',
        baseUrl: 'https://openrouter.ai/api',
        modelsPath: null,
        apiKeyEnvVar: null,
      },
      new Environment({}),
    )
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await getOpenRouterModels(provider, logger, mockFetch)

    expect(result).toEqual([])
  })
})
