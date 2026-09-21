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
      intelligence: null,
      coding: null,
      agentic: null,
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
      intelligence: 80,
      coding: 70,
      agentic: 60,
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
      intelligence: 60,
      coding: 60,
      agentic: 30,
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
      intelligence: 80,
      coding: 70,
      agentic: 60,
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

  it('when input has a high-intelligence no-reasoning model, returns it', () => {
    const target = {
      id: 'smart-cheap',
      name: 'Smart Cheap',
      provider: 'nous',
      reasoning: false,
      reasoningOptions: [],
      intelligence: 90,
      coding: 80,
      agentic: 70,
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
      intelligence: null,
      coding: null,
      agentic: null,
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
      intelligence: 60,
      coding: 60,
      agentic: 30,
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
      intelligence: null,
      coding: 50,
      agentic: null,
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
      intelligence: null,
      coding: null,
      agentic: null,
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

  it('when given a model catalog path, reads models.json and filters', async () => {
    const freeNoReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      provider: 'ollama',
      reasoning: false,
      reasoningOptions: [],
      intelligence: null,
      coding: null,
      agentic: null,
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
      intelligence: 80,
      coding: 70,
      agentic: 60,
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
      modelCount: 2,
      models: [reasoningModel, freeNoReasoning],
    }
    await Deno.writeTextFile(path, JSON.stringify(catalog))

    const result = getCheapNoReasoningModels(path)

    expect(result).toEqual([freeNoReasoning])
  })
})
