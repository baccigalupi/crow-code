import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalizeRecords } from '../../../src/model-info/ratings/normalize-records.ts'
import { Environment } from '../../../src/env-vars.ts'
import { mockFetchRoutes } from '../../support/mock-fetch.ts'
import pino from 'pino'
import type { ModelInfo } from '../../../src/model-info/types.ts'

const baseRecord: ModelInfo = {
  id: 'deepseek/deepseek-v4',
  name: 'DeepSeek V4',
  provider: 'nous',
  reasoning: null,
  reasoningOptions: [],
  intelligence: null,
  coding: null,
  agentic: null,
  costInput: 0,
  costOutput: 0,
  contextLength: null,
  modality: 'text->text',
  knowledgeCutoff: null,
  size: '',
}

const modelsDevResponse = {
  nous: {
    models: {
      'deepseek/deepseek-v4': {
        reasoning: true,
        reasoning_options: [{ type: 'toggle' }],
      },
    },
  },
}

const aaResponse = {
  data: [
    {
      slug: 'deepseek-v4',
      model_creator: { name: 'DeepSeek' },
      reasoning_model: null,
      evaluations: {
        artificial_analysis_intelligence_index: 40,
        artificial_analysis_coding_index: 60,
        artificial_analysis_agentic_index: 30,
      },
    },
  ],
  pagination: { has_more: false },
}

describe('normalizeRecords', () => {
  it('when both sources have data, applies both to a record', async () => {
    const records = [baseRecord]
    const fetchMock = mockFetchRoutes([
      ['models.dev', modelsDevResponse],
      ['artificialanalysis', aaResponse],
    ])
    const logger = pino({ enabled: false })
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    const result = await normalizeRecords(
      records,
      environment,
      logger,
      fetchMock,
    )

    expect(result[0].reasoning).toBe(true)
    expect(result[0].reasoningOptions).toEqual(['toggle'])
    expect(result[0].intelligence).toBe(40)
    expect(result[0].coding).toBe(60)
    expect(result[0].agentic).toBe(30)
  })

  it('when both sources provide reasoning, models.dev wins', async () => {
    const records = [baseRecord]
    const fetchMock = mockFetchRoutes([
      ['models.dev', modelsDevResponse],
      [
        'artificialanalysis',
        {
          data: [
            {
              slug: 'deepseek-v4',
              model_creator: { name: 'DeepSeek' },
              reasoning_model: false,
              evaluations: {
                artificial_analysis_intelligence_index: 40,
                artificial_analysis_coding_index: 60,
                artificial_analysis_agentic_index: 30,
              },
            },
          ],
          pagination: { has_more: false },
        },
      ],
    ])
    const logger = pino({ enabled: false })
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    const result = await normalizeRecords(
      records,
      environment,
      logger,
      fetchMock,
    )

    expect(result[0].reasoning).toBe(true)
  })

  it('when reasoning is still null, AA reasoning_model back-fills it', async () => {
    const records = [baseRecord]
    const fetchMock = mockFetchRoutes([
      [
        'models.dev',
        {
          nous: {
            models: {
              'deepseek/deepseek-v4': {
                reasoning: null,
                reasoning_options: [],
              },
            },
          },
        },
      ],
      [
        'artificialanalysis',
        {
          data: [
            {
              slug: 'deepseek-v4',
              model_creator: { name: 'DeepSeek' },
              reasoning_model: true,
              evaluations: {
                artificial_analysis_intelligence_index: 40,
                artificial_analysis_coding_index: 60,
                artificial_analysis_agentic_index: 30,
              },
            },
          ],
          pagination: { has_more: false },
        },
      ],
    ])
    const logger = pino({ enabled: false })
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    const result = await normalizeRecords(
      records,
      environment,
      logger,
      fetchMock,
    )

    expect(result[0].reasoning).toBe(true)
  })

  it('when a fetch fails, still returns normalized records', async () => {
    const records = [baseRecord]
    const fetchMock = (input: string | URL | Request) => {
      const address = input instanceof Request ? input.url : String(input)
      if (address.includes('models.dev')) {
        return Promise.resolve(Response.json(modelsDevResponse))
      }
      return Promise.reject(new Error('network error'))
    }
    const logger = pino({ enabled: false })
    const environment = new Environment({ AA_API_KEY: 'test-key' })

    const result = await normalizeRecords(
      records,
      environment,
      logger,
      fetchMock,
    )

    expect(result[0].reasoning).toBe(true)
    expect(result[0].reasoningOptions).toEqual(['toggle'])
    expect(result[0].intelligence).toBeNull()
    expect(result[0].coding).toBeNull()
    expect(result[0].agentic).toBeNull()
  })
})
