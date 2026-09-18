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

describe('nous', () => {
  it('when the body has models, parseNousResponse normalizes them into records', () => {
    const nousConfig = {
      name: 'nous' as const,
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const body = {
      data: [{ id: 'deepseek/deepseek-chat' }],
    }

    const result = parseNousResponse(body, nousConfig)

    expect(result[0].id).toBe('deepseek/deepseek-chat')
    expect(result[0].providers).toEqual(['nous'])
  })

  it('when fetched, fetchNousModels returns normalized records', async () => {
    const nousConfig = {
      name: 'nous' as const,
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchSuccess({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    const result = await fetchNousModels(nousConfig, logger, mockFetch)

    expect(result[0].id).toBe('deepseek/deepseek-chat')
    expect(result[0].providers).toEqual(['nous'])
  })

  it('when the network request fails, fetchNousModels returns an empty list', async () => {
    const nousConfig = {
      name: 'nous' as const,
      baseUrl: 'https://inference-api.nousresearch.com',
    }
    const logger = pino({ enabled: false })
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchNousModels(nousConfig, logger, mockFetch)

    expect(result).toEqual([])
  })
})
