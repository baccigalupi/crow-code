import { describe, it, expect } from 'vitest'
import { parseNousResponse } from '../../../src/model-discovery/providers/nous'

describe('nous', () => {
  it('when the body has no data key, returns an empty list', () => {
    const result = parseNousResponse({})

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const body = {
      data: [
        {
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
        },
      ],
    }

    const result = parseNousResponse(body)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('deepseek/deepseek-v4')
    expect(result[0].name).toBe('DeepSeek V4')
    expect(result[0].providers).toEqual(['nous'])
    expect(result[0].costInput).toBe(0.5)
    expect(result[0].costOutput).toBe(1.5)
    expect(result[0].contextLength).toBe(1000)
    expect(result[0].modality).toBe('text->text')
    expect(result[0].reasoningMode).toBe('forced/high')
    expect(result[0].knowledgeCutoff).toBe('2025-01-01')
    expect(result[0].coding).toBeNull()
  })

  it('when the name is missing, uses the id as the name', () => {
    const result = parseNousResponse({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    expect(result[0].name).toBe('deepseek/deepseek-chat')
  })

  it('when pricing is missing, costs are zero', () => {
    const result = parseNousResponse({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    expect(result[0].costInput).toBe(0)
    expect(result[0].costOutput).toBe(0)
  })

  it('when reasoning metadata is missing, mode is a dash', () => {
    const result = parseNousResponse({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    expect(result[0].reasoningMode).toBe('-')
  })

  it('when reasoning is optional, mode is off', () => {
    const body = {
      data: [
        { id: 'x', reasoning: { mandatory: false, default_enabled: false } },
      ],
    }

    const result = parseNousResponse(body)

    expect(result[0].reasoningMode).toBe('off')
  })
})
