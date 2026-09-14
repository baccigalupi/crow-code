import { describe, it, expect } from 'vitest'
import { filterRecords } from '../src/filter'
import { ModelRecord, Options } from '../src/types'

const baseModel: ModelRecord = {
  id: 'a',
  name: 'a',
  providers: ['nous'],
  reasoning: null,
  coding: null,
  codingSource: null,
  agentic: null,
  costInput: 0,
  costOutput: 0,
  contextLength: null,
  modality: '-',
  reasoningMode: '-',
  knowledgeCutoff: null,
  size: '',
}

const baseOptions: Options = {
  refresh: false,
  sort: 'coding',
  top: 40,
  all: false,
  json: false,
}

describe('filterRecords', () => {
  it('when a filter is set, keeps models whose id or name contains it', () => {
    const models = [
      { ...baseModel, id: 'qwen/qwen3', name: 'Qwen 3' },
      { ...baseModel, id: 'deepseek/deepseek-chat', name: 'DeepSeek Chat' },
    ]

    const result = filterRecords(models, { ...baseOptions, filter: 'qwen' })

    expect(result.map((model) => model.id)).toEqual(['qwen/qwen3'])
  })

  it('when a provider is set, keeps only that provider', () => {
    const models = [
      { ...baseModel, id: 'nous-model', providers: ['nous'] },
      { ...baseModel, id: 'local-model', providers: ['ollama'] },
    ]

    const result = filterRecords(models, { ...baseOptions, provider: 'ollama' })

    expect(result.map((model) => model.id)).toEqual(['local-model'])
  })

  it('when no filters are set, returns every model', () => {
    const models = [
      { ...baseModel, id: 'a' },
      { ...baseModel, id: 'b' },
    ]

    const result = filterRecords(models, baseOptions)

    expect(result).toHaveLength(2)
  })
})
