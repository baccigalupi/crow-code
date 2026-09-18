import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import {
  fetchOpenRouterModels,
  parseOpenRouterResponse,
} from '../../../src/model-info/providers/openrouter.ts'
import type { ProviderConfig } from '../../../src/model-info/types.ts'

const logger = pino({ enabled: false })

const openrouterConfig: ProviderConfig = {
  name: 'openrouter',
  baseUrl: 'https://openrouter.ai',
  modelsUrl: 'https://openrouter.ai/api/v1/models',
}

describe('openrouter', () => {
  it('when the body has models, parseOpenRouterResponse normalizes them into records', () => {
    const body = {
      data: [{ id: 'openai/gpt-4o', name: 'GPT-4o' }],
    }

    const result = parseOpenRouterResponse(body, openrouterConfig)

    expect(result[0].id).toBe('openai/gpt-4o')
    expect(result[0].providers).toEqual(['openrouter'])
  })

  it('when fetched, returns normalized records', async () => {
    const mockFetch = mockFetchSuccess({
      data: [{ id: 'openai/gpt-4o', name: 'GPT-4o' }],
    })

    const result = await fetchOpenRouterModels(
      openrouterConfig,
      logger,
      mockFetch,
    )

    expect(result[0].id).toBe('openai/gpt-4o')
    expect(result[0].providers).toEqual(['openrouter'])
  })

  it('when modelsUrl is not set, falls back to baseUrl', async () => {
    const configWithoutModelsUrl: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
    }
    const mockFetch = mockFetchSuccess({ data: [{ id: 'openai/gpt-4o' }] })

    await fetchOpenRouterModels(configWithoutModelsUrl, logger, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://openrouter.ai')
  })

  it('when the network request fails, returns an empty list', async () => {
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchOpenRouterModels(
      openrouterConfig,
      logger,
      mockFetch,
    )

    expect(result).toEqual([])
  })
})
