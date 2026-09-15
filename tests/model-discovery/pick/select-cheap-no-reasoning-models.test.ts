import { describe, it, expect } from 'vitest'
import {
  selectCheapNoReasoningModels,
  getCheapNoReasoningModels,
} from '../../../src/model-discovery/pick/select-cheap-no-reasoning-models.js'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const fixtureDir = join('tests', 'support', 'fixtures', '.crow')

describe('selectCheapNoReasoningModels', () => {
  it('when input has a free no-reasoning model, returns it', () => {
    const target = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      providers: ['ollama'],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      reasoningMode: '-',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA' as const,
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
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
      providers: ['nous'],
      reasoning: 0,
      coding: 60,
      codingSource: 'AA' as const,
      agentic: 30,
      costInput: 0.0005,
      costOutput: 0.0005,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'off',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA' as const,
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('when input has a free model with off/avg reasoningMode, returns it', () => {
    const target = {
      id: 'off-slash-model',
      name: 'Off/Slash Model',
      providers: ['nous'],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      reasoningMode: 'off/avg',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA' as const,
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('when input is empty, returns []', () => {
    const result = selectCheapNoReasoningModels([])

    expect(result).toEqual([])
  })

  it('when input has a model with reasoning, excludes it', () => {
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA' as const,
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }
    const freeNoReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      providers: ['ollama'],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      reasoningMode: '-',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([
      reasoningModel,
      freeNoReasoning,
    ])

    expect(result).toEqual([freeNoReasoning])
  })

  it('when input has an expensive model, excludes it', () => {
    const expensiveNoReasoning = {
      id: 'expensive-no-reasoning',
      name: 'Expensive No-Reasoning',
      providers: ['nous'],
      reasoning: null,
      coding: 50,
      codingSource: null,
      agentic: null,
      costInput: 0.01,
      costOutput: 0.02,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'off',
      knowledgeCutoff: null,
      size: '',
    }
    const freeNoReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      providers: ['ollama'],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      reasoningMode: '-',
      knowledgeCutoff: null,
      size: '',
    }

    const result = selectCheapNoReasoningModels([
      expensiveNoReasoning,
      freeNoReasoning,
    ])

    expect(result).toEqual([freeNoReasoning])
  })

  it('when given a cache path, reads models.json and filters', () => {
    const freeNoReasoning = {
      id: 'qwen3-coder:30b',
      name: 'qwen3-coder:30b',
      providers: ['ollama'],
      reasoning: null,
      coding: null,
      codingSource: null,
      agentic: null,
      costInput: 0,
      costOutput: 0,
      contextLength: null,
      modality: 'local',
      reasoningMode: '-',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA' as const,
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }
    const path = join(fixtureDir, 'cheap-summarizers-test.json')
    const cache = {
      fetchedAt: '2026-01-01T00:00:00.000Z',
      sources: ['test'],
      models: [reasoningModel, freeNoReasoning],
    }
    writeFileSync(path, JSON.stringify(cache))

    const result = getCheapNoReasoningModels(path)

    expect(result).toEqual([freeNoReasoning])
  })
})
