import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { NousParser } from '../../../../src/model-info/providers/nous/parser.ts'
import type { ProviderConfig } from '../../../../src/model-info/types.ts'

const nousConfig: ProviderConfig = {
  name: 'nous',
  baseUrl: 'https://inference-api.nousresearch.com',
}

describe('NousParser', () => {
  it('when the body has no data key, returns an empty list', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({})

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const parser = new NousParser(nousConfig)
    const body = {
      data: [
        {
          id: 'deepseek/deepseek-v4',
          name: 'DeepSeek V4',
          context_length: 1000,
          knowledge_cutoff: '2025-01-01',
          pricing: { prompt: '0.0000005', completion: '0.0000015' },
          architecture: { modality: 'text->text' },
        },
      ],
    }

    const result = parser.parseResponse(body)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('deepseek/deepseek-v4')
    expect(result[0].name).toBe('DeepSeek V4')
    expect(result[0].provider).toBe('nous')
    expect(result[0].costInput).toBe(0.5)
    expect(result[0].costOutput).toBe(1.5)
    expect(result[0].contextLength).toBe(1000)
    expect(result[0].modality).toBe('text->text')
    expect(result[0].knowledgeCutoff).toBe('2025-01-01')
    expect(result[0].coding).toBeNull()
  })

  it('when the name is missing, uses the id as the name', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    expect(result[0].name).toBe('deepseek/deepseek-chat')
  })

  it('when pricing is missing, costs are zero', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [{ id: 'deepseek/deepseek-chat' }],
    })

    expect(result[0].costInput).toBe(0)
    expect(result[0].costOutput).toBe(0)
  })

  it('when a reasoning object is present, reasoning is true', () => {
    const parser = new NousParser(nousConfig)
    const body = {
      data: [
        {
          id: 'deepseek/deepseek-v4',
          reasoning: { mandatory: true, default_enabled: true },
        },
      ],
    }

    const result = parser.parseResponse(body)

    expect(result[0].reasoning).toBe(true)
  })

  it('when the modality is embeddings, reasoning is false', () => {
    const parser = new NousParser(nousConfig)
    const body = {
      data: [
        {
          id: 'openai/text-embedding-4',
          supported_parameters: [],
          architecture: { modality: 'text->embeddings' },
        },
      ],
    }

    const result = parser.parseResponse(body)

    expect(result[0].reasoning).toBe(false)
  })

  it('when supported_parameters is empty, reasoning is false', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [{ id: 'x', supported_parameters: [] }],
    })

    expect(result[0].reasoning).toBe(false)
  })

  it('when supported_parameters has no reasoning params, reasoning is false', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [{ id: 'x', supported_parameters: ['tools', 'temperature'] }],
    })

    expect(result[0].reasoning).toBe(false)
  })

  it('when supported_parameters has reasoning params, reasoning stays null', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [{ id: 'x', supported_parameters: ['reasoning'] }],
    })

    expect(result[0].reasoning).toBeNull()
  })

  it('when reasoning metadata is omitted, reasoning is null', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [{ id: 'x' }],
    })

    expect(result[0].reasoning).toBeNull()
    expect(result[0].reasoningOptions).toEqual([])
  })

  it('when supported_parameters lists reasoning params, maps them to reasoning options', () => {
    const parser = new NousParser(nousConfig)

    const result = parser.parseResponse({
      data: [
        {
          id: 'x',
          supported_parameters: [
            'reasoning',
            'include_reasoning',
            'reasoning_effort',
            'tools',
          ],
        },
      ],
    })

    expect(result[0].reasoningOptions).toEqual(['toggle', 'effort'])
  })
})
