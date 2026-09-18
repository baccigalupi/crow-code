import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { mergeModelRecords } from '../../../src/model-info/catalog/merge-model-records.ts'
import type { ModelInfo } from '../../../src/model-info/types.ts'

describe('mergeModelRecords', () => {
  it('when records share an id, merges their providers', () => {
    const first: ModelInfo = {
      id: 'model',
      name: 'Model',
      providers: ['nous'],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'text',
      reasoningMode: '-',
      knowledgeCutoff: null,
      size: '',
    }
    const second: ModelInfo = { ...first, providers: ['ollama'] }

    const result = mergeModelRecords([first, second])

    expect(result).toHaveLength(1)
    expect(result[0].providers).toEqual(['nous', 'ollama'])
  })
})
