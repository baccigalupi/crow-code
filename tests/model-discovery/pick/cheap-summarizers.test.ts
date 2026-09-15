import { describe, it, expect } from 'vitest'
import { getCheapSummarizers } from '../../../src/model-discovery/pick/cheap-summarizers.js'
import type { ModelRecord } from '../../../src/model-discovery/types'

describe('getCheapSummarizers', () => {
  it('includes a free no-reasoning model', () => {
    const target: ModelRecord = {
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
    const reasoningModel: ModelRecord = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA',
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }

    const result = getCheapSummarizers([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('includes a cheap no-reasoning model', () => {
    const target: ModelRecord = {
      id: 'deepseek/deepseek-chat',
      name: 'DeepSeek Chat',
      providers: ['nous'],
      reasoning: 0,
      coding: 60,
      codingSource: 'AA',
      agentic: 30,
      costInput: 0.0005,
      costOutput: 0.0005,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'off',
      knowledgeCutoff: null,
      size: '',
    }
    const reasoningModel: ModelRecord = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA',
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }

    const result = getCheapSummarizers([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('includes a free model with off/avg reasoningMode', () => {
    const target: ModelRecord = {
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
    const reasoningModel: ModelRecord = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA',
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }

    const result = getCheapSummarizers([reasoningModel, target])

    expect(result).toEqual([target])
  })

  it('returns an empty list for an empty input', () => {
    const result = getCheapSummarizers([])

    expect(result).toEqual([])
  })

  it('excludes a model that has reasoning', () => {
    const reasoningModel: ModelRecord = {
      id: 'deepseek-reasoning',
      name: 'DeepSeek R1',
      providers: ['nous'],
      reasoning: 80,
      coding: 70,
      codingSource: 'AA',
      agentic: 60,
      costInput: 0,
      costOutput: 0,
      contextLength: 1000,
      modality: 'text->text',
      reasoningMode: 'on',
      knowledgeCutoff: null,
      size: '',
    }
    const freeNoReasoning: ModelRecord = {
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

    const result = getCheapSummarizers([reasoningModel, freeNoReasoning])

    expect(result).toEqual([freeNoReasoning])
  })

  it('excludes a model that is expensive', () => {
    const expensiveNoReasoning: ModelRecord = {
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
    const freeNoReasoning: ModelRecord = {
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

    const result = getCheapSummarizers([expensiveNoReasoning, freeNoReasoning])

    expect(result).toEqual([freeNoReasoning])
  })
})
