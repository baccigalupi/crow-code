import { describe, it, expect } from 'vitest'
import { buildNousRecord } from '../../src/model-discovery/nous-record'
import { AABenchmarks, NousModel } from '../../src/model-discovery/types'

describe('buildNousRecord', () => {
  it('when given a full Nous model, maps every field', () => {
    const model: NousModel = {
      id: 'deepseek/deepseek-v4',
      name: 'DeepSeek V4',
      context_length: 1000,
      knowledge_cutoff: '2025-01-01',
      pricing: { prompt: '0.0000005', completion: '0.0000015' },
      reasoning: {
        mandatory: true,
        default_enabled: true,
        default_effort: 'high',
      },
      architecture: { modality: 'text->text' },
    }
    const benchmark: AABenchmarks = {
      intelligence: 40,
      coding: 60,
      agentic: 30,
    }

    const result = buildNousRecord(model, benchmark)

    expect(result.id).toBe('deepseek/deepseek-v4')
    expect(result.name).toBe('DeepSeek V4')
    expect(result.reasoning).toBe(40)
    expect(result.coding).toBe(60)
    expect(result.codingSource).toBe('AA')
    expect(result.agentic).toBe(30)
    expect(result.costInput).toBe(0.5)
    expect(result.costOutput).toBe(1.5)
    expect(result.contextLength).toBe(1000)
    expect(result.modality).toBe('text->text')
    expect(result.reasoningMode).toBe('forced/high')
    expect(result.knowledgeCutoff).toBe('2025-01-01')
  })

  it('when the name is missing, uses the id as the name', () => {
    const model: NousModel = { id: 'deepseek/deepseek-chat' }

    const result = buildNousRecord(model, undefined)

    expect(result.name).toBe('deepseek/deepseek-chat')
  })

  it('when pricing is missing, costs are zero', () => {
    const model: NousModel = { id: 'deepseek/deepseek-chat' }

    const result = buildNousRecord(model, undefined)

    expect(result.costInput).toBe(0)
    expect(result.costOutput).toBe(0)
  })

  it('when reasoning metadata is missing, mode is a dash', () => {
    const model: NousModel = { id: 'deepseek/deepseek-chat' }

    const result = buildNousRecord(model, undefined)

    expect(result.reasoningMode).toBe('-')
  })

  it('when reasoning is optional, mode is off', () => {
    const model: NousModel = {
      id: 'deepseek/deepseek-chat',
      reasoning: { mandatory: false, default_enabled: false },
    }

    const result = buildNousRecord(model, undefined)

    expect(result.reasoningMode).toBe('off')
  })

  it('when the AA coding score is zero, falls back to the Aider score', () => {
    const model: NousModel = { id: 'openai/gpt-5' }
    const benchmark: AABenchmarks = { intelligence: 30, coding: 0, agentic: 20 }

    const result = buildNousRecord(model, benchmark)

    expect(result.coding).toBe(88)
    expect(result.codingSource).toBe('Aider')
  })
})
