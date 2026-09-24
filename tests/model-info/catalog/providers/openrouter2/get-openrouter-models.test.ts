import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../../support/mock-fetch.ts'
import { loadOpenRouterFixture } from '../../../../support/fixtures.ts'
import { getOpenRouterModels } from '../../../../../src/model-info/catalog/providers/openrouter2/get-openrouter-models.ts'

describe('getOpenRouterModels', () => {
  it('when fetched, returns parsed records', async () => {
    const openrouterConfig = {
      name: 'openrouter' as const,
      baseUrl: 'https://openrouter.ai/api',
    }
    const fixture = await loadOpenRouterFixture()
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess(fixture)

    const result = await getOpenRouterModels(
      openrouterConfig,
      logger,
      mockFetch,
    )

    expect(result).toHaveLength(458)
    expect(result[0].id).toBe('fireworks/ember-1')
    expect(result[0].provider).toBe('openrouter')
  })

  it('when fetched, requests the configured base url plus v1 models', async () => {
    const openrouterConfig = {
      name: 'openrouter' as const,
      baseUrl: 'https://example.com/api',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({ data: [] })

    await getOpenRouterModels(openrouterConfig, logger, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://example.com/api/v1/models')
  })

  it('when the response is not ok, returns an empty list', async () => {
    const openrouterConfig = {
      name: 'openrouter' as const,
      baseUrl: 'https://openrouter.ai/api',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchError(500)

    const result = await getOpenRouterModels(
      openrouterConfig,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
  })

  it('when the network request fails, returns an empty list', async () => {
    const openrouterConfig = {
      name: 'openrouter' as const,
      baseUrl: 'https://openrouter.ai/api',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await getOpenRouterModels(
      openrouterConfig,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
  })
})
