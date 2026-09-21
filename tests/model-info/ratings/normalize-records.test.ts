import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalizeRecords } from '../../../src/model-info/ratings/normalize-records.ts'
import { mockFetchRoutes } from '../../support/mock-fetch.ts'
import pino from 'pino'
import type { ModelInfo } from '../../../src/model-info/types.ts'

const baseRecord: ModelInfo = {
  id: 'deepseek/deepseek-v4',
  name: 'DeepSeek V4',
  provider: 'nous',
  reasoning: null,
  reasoningOptions: [],
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

describe('normalizeRecords', () => {
  it('when models.dev has data, enriches the record', async () => {
    const records = [baseRecord]
    const fetchMock = mockFetchRoutes([['models.dev', modelsDevResponse]])
    const logger = pino({ enabled: false })

    const result = await normalizeRecords(records, logger, fetchMock)

    expect(result[0].reasoning).toBe(true)
    expect(result[0].reasoningOptions).toEqual(['toggle'])
  })

  it('when the fetch fails, returns the original record', async () => {
    const records = [baseRecord]
    const fetchMock = () => Promise.reject(new Error('network error'))
    const logger = pino({ enabled: false })

    const result = await normalizeRecords(records, logger, fetchMock)

    expect(result).toEqual(records)
  })
})
