import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'
import {
  fetchNousModels,
  parseNousResponse,
} from '../../../src/model-info/providers/nous.ts'
import type { ProviderConfig } from '../../../src/model-info/types.ts'

const logger = pino({ enabled: false })

describe('nous', () => {
  it('when the body has no data key, returns an empty list', () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const result = parseNousResponse({}, nousConfig)

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const body = {
      data: [
        {
          id: 'deepseek/deepseek-v4',
          name: 'DeepSeek V4',
          context_length: 1000,
          knowledge_cutoff: '2025-01-01',
          pricing: { prompt: '0.0000005', completion: '0.0000015' },
          reasoning: {
            mandatory: true,
            default_enabled: true,
            default_effort: 'high',
          },
          architecture: { modality: 'text->text' },
        },
      ],
    }

    const result = parseNousResponse(body, nousConfig)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('deepseek/deepseek-v4')
    expect(result[0].name).toBe('DeepSeek V4')
    expect(result[0].providers).toEqual(['nous'])
    expect(result[0].costInput).toBe(0.5)
    expect(result[0].costOutput).toBe(1.5)
    expect(result[0].contextLength).toBe(1000)
    expect(result[0].modality).toBe('text->text')
    expect(result[0].reasoningMode).toBe('forced/high')
    expect(result[0].knowledgeCutoff).toBe('2025-01-01')
    expect(result[0].coding).toBeNull()
  })

  it('when the name is missing, uses the id as the name', () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const result = parseNousResponse(
      { data: [{ id: 'deepseek/deepseek-chat' }] },
      nousConfig,
    )

    expect(result[0].name).toBe('deepseek/deepseek-chat')
  })

  it('when pricing is missing, costs are zero', () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const result = parseNousResponse(
      { data: [{ id: 'deepseek/deepseek-chat' }] },
      nousConfig,
    )

    expect(result[0].costInput).toBe(0)
    expect(result[0].costOutput).toBe(0)
  })

  it('when reasoning metadata is missing, mode is a dash', () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const result = parseNousResponse(
      { data: [{ id: 'deepseek/deepseek-chat' }] },
      nousConfig,
    )

    expect(result[0].reasoningMode).toBe('-')
  })

  it('when reasoning is optional, mode is off', () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const body = {
      data: [
        { id: 'x', reasoning: { mandatory: false, default_enabled: false } },
      ],
    }

    const result = parseNousResponse(body, nousConfig)

    expect(result[0].reasoningMode).toBe('off')
  })

  it('when fetched, returns normalized records', async () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const mockFetch = mockFetchSuccess({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    const result = await fetchNousModels(nousConfig, logger, mockFetch)

    expect(result[0].id).toBe('deepseek/deepseek-chat')
    expect(result[0].providers).toEqual(['nous'])
  })

  it('when the network request fails, returns an empty list', async () => {
    const nousConfig: ProviderConfig = {
      name: 'nous',
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchNousModels(nousConfig, logger, mockFetch)

    expect(result).toEqual([])
  })
})
