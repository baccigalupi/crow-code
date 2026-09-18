import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import {
  fetchOpenRouterModels,
  parseOpenRouterResponse,
} from '../../../src/model-discovery/providers/openrouter.ts'
import type { ProviderConfig } from '../../../src/model-discovery/types.ts'

describe('openrouter', () => {
  it('when the body has no data key, returns an empty list', () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }

    const result = parseOpenRouterResponse({}, openrouterConfig)

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }
    const body = {
      data: [
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          context_length: 128000,
          pricing: { prompt: '0.000005', completion: '0.000015' },
          architecture: { modality: 'text->text' },
        },
      ],
    }

    const result = parseOpenRouterResponse(body, openrouterConfig)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('openai/gpt-4o')
    expect(result[0].name).toBe('GPT-4o')
    expect(result[0].providers).toEqual(['openrouter'])
    expect(result[0].costInput).toBe(5)
    expect(result[0].costOutput).toBe(15)
    expect(result[0].contextLength).toBe(128000)
    expect(result[0].modality).toBe('text->text')
    expect(result[0].reasoningMode).toBe('-')
    expect(result[0].knowledgeCutoff).toBeNull()
    expect(result[0].coding).toBeNull()
  })

  it('when the name is missing, uses the id as the name', () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }

    const result = parseOpenRouterResponse(
      { data: [{ id: 'openai/gpt-4o' }] },
      openrouterConfig,
    )

    expect(result[0].name).toBe('openai/gpt-4o')
  })

  it('when pricing is missing, costs are zero', () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }

    const result = parseOpenRouterResponse(
      { data: [{ id: 'openai/gpt-4o' }] },
      openrouterConfig,
    )

    expect(result[0].costInput).toBe(0)
    expect(result[0].costOutput).toBe(0)
  })

  it('when architecture is missing, modality is a dash', () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }

    const result = parseOpenRouterResponse(
      { data: [{ id: 'openai/gpt-4o' }] },
      openrouterConfig,
    )

    expect(result[0].modality).toBe('-')
  })

  it('when context_length is missing, contextLength is null', () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }

    const result = parseOpenRouterResponse(
      { data: [{ id: 'openai/gpt-4o' }] },
      openrouterConfig,
    )

    expect(result[0].contextLength).toBeNull()
  })

  it('when fetched, returns normalized records', async () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }
    const mockFetch = mockFetchSuccess({
      data: [{ id: 'openai/gpt-4o', name: 'GPT-4o' }],
    })

    const result = await fetchOpenRouterModels(openrouterConfig, mockFetch)

    expect(result[0].id).toBe('openai/gpt-4o')
    expect(result[0].providers).toEqual(['openrouter'])
  })

  it('when modelsUrl is not set, falls back to baseUrl', async () => {
    const configWithoutModelsUrl: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
    }
    const mockFetch = mockFetchSuccess({ data: [{ id: 'openai/gpt-4o' }] })

    await fetchOpenRouterModels(configWithoutModelsUrl, mockFetch)

    expect(mockFetch.calls).toHaveLength(1)
    expect(mockFetch.calls[0]).toBe('https://openrouter.ai')
  })

  it('when the network request fails, returns an empty list', async () => {
    const openrouterConfig: ProviderConfig = {
      name: 'openrouter',
      baseUrl: 'https://openrouter.ai',
      modelsUrl: 'https://openrouter.ai/api/v1/models',
    }
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchOpenRouterModels(openrouterConfig, mockFetch)

    expect(result).toEqual([])
  })
})
