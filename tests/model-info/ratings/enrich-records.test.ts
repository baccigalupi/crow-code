import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { enrichRecords } from '../../../src/model-info/ratings/enrich-records.ts'
import type {
  ModelInfo,
  ModelsDevCatalog,
} from '../../../src/model-info/types.ts'

describe('enrichRecords', () => {
  it('when models.dev has the provider entry, applies its capability', () => {
    const catalog: ModelsDevCatalog = {
      nous: {
        'deepseek/deepseek-v4': {
          reasoning: true,
          reasoningOptions: ['toggle', 'effort'],
        },
      },
    }
    const native: ModelInfo = {
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

    const result = enrichRecords([native], catalog)

    expect(result[0].reasoning).toBe(true)
    expect(result[0].reasoningOptions).toEqual(['toggle', 'effort'])
  })

  it('when models.dev misses, keeps the provider-native capability', () => {
    const native: ModelInfo = {
      id: 'deepseek/deepseek-v4',
      name: 'DeepSeek V4',
      provider: 'nous',
      reasoning: true,
      reasoningOptions: ['toggle'],
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

    const result = enrichRecords([native], {})

    expect(result[0]).toEqual(native)
  })

  it('when models.dev gives reasoning but no options, keeps native options', () => {
    const catalog: ModelsDevCatalog = {
      nous: {
        'deepseek/deepseek-v4': { reasoning: false, reasoningOptions: [] },
      },
    }
    const native: ModelInfo = {
      id: 'deepseek/deepseek-v4',
      name: 'DeepSeek V4',
      provider: 'nous',
      reasoning: null,
      reasoningOptions: ['effort'],
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

    const result = enrichRecords([native], catalog)

    expect(result[0].reasoning).toBe(false)
    expect(result[0].reasoningOptions).toEqual(['effort'])
  })

  it('when models.dev reasoning is unknown, keeps native reasoning', () => {
    const catalog: ModelsDevCatalog = {
      nous: {
        'deepseek/deepseek-v4': {
          reasoning: null,
          reasoningOptions: ['toggle'],
        },
      },
    }
    const native: ModelInfo = {
      id: 'deepseek/deepseek-v4',
      name: 'DeepSeek V4',
      provider: 'nous',
      reasoning: true,
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

    const result = enrichRecords([native], catalog)

    expect(result[0].reasoning).toBe(true)
    expect(result[0].reasoningOptions).toEqual(['toggle'])
  })

  it('when two providers serve the same id, each keeps its own capability', () => {
    const catalog: ModelsDevCatalog = {
      nous: {
        'deepseek/deepseek-v4': { reasoning: true, reasoningOptions: [] },
      },
      openrouter: {
        'deepseek/deepseek-v4': { reasoning: false, reasoningOptions: [] },
      },
    }
    const nousRecord: ModelInfo = {
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
    const openrouterRecord: ModelInfo = {
      ...nousRecord,
      provider: 'openrouter',
    }

    const result = enrichRecords([nousRecord, openrouterRecord], catalog)

    expect(result[0].reasoning).toBe(true)
    expect(result[1].reasoning).toBe(false)
  })

  it('when the modality is embeddings, marks the record non-reasoning', () => {
    const embedding: ModelInfo = {
      id: 'openai/text-embedding-4',
      name: 'Text Embedding 4',
      provider: 'nous',
      reasoning: null,
      reasoningOptions: [],
      intelligence: null,
      coding: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'text->embeddings',
      knowledgeCutoff: null,
      size: '',
    }

    const result = enrichRecords([embedding], {})

    expect(result[0].reasoning).toBe(false)
    expect(result[0].reasoningOptions).toEqual([])
  })
})
