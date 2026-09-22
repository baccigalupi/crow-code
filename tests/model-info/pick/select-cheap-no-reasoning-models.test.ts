import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  getCheapNoReasoningModels,
  selectCheapNoReasoningModels,
} from '../../../src/model-info/pick/select-cheap-no-reasoning-models.ts'
import { join } from '@std/path'

const fixtureDir = join('tests', 'support', 'fixtures', '.crow')

describe('selectCheapNoReasoningModels', () => {
  it('when input has a free no-reasoning model, returns it', () => {
    const target = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      provider: 'ollama',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      provider: 'nous',
      reasoning: true,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('when input has a cheap no-reasoning model, returns it', () => {
    const target = {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0.0005,
      costOutput: 0.0005,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      provider: 'nous',
      reasoning: true,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('when input has a free no-reasoning model, returns it', () => {
    const target = {
      id: 'smart-cheap',
      name: 'Smart Cheap',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([target])

    expect(result).toEqual([target])
  })

  it('when input has a model with unknown reasoning, excludes it', () => {
    const unknownReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      provider: 'ollama',
      reasoning: null,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      knowledgeCutoff: null,
      size: '',
    }
    const target = {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0.0005,
      costOutput: 0.0005,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([unknownReasoning, target])

    expect(result).toEqual([target])
  })

  it('when input is empty, returns []', () => {
    const result = selectCheapNoReasoningModels([])

    expect(result).toEqual([])
  })

  it('when input has an expensive model, excludes it', () => {
    const expensiveNoReasoning = {
      id: 'expensive-no-reasoning',
      name: 'Expensive No-Reasoning',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0.01,
      costOutput: 0.02,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }
    const freeNoReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      provider: 'ollama',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([
      expensiveNoReasoning,
      freeNoReasoning,
    ])

    expect(result).toEqual([freeNoReasoning])
  })

  it('when given a model count, reads, filters, and limits the catalog', async () => {
    const freeNoReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      provider: 'ollama',
      reasoning: false,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      provider: 'nous',
      reasoning: true,
      reasoningOptions: [],
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      knowledgeCutoff: null,
      size: '',
    }
    const path = join(fixtureDir, 'cheap-summarizers-test.json')
    const catalog = {
      fetchedAt: '2026-01-01T00:00:00.000Z',
      modelCount: 3,
      models: [
        reasoningModel,
        freeNoReasoning,
        { ...freeNoReasoning, id: 'second-model' },
      ],
    }
    await Deno.writeTextFile(path, JSON.stringify(catalog))

    const result = getCheapNoReasoningModels(path, 1)

    expect(result).toEqual([freeNoReasoning])
  })
})
