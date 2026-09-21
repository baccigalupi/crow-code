import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { OpenRouterParser } from '../../../../src/model-info/providers/openrouter/parser.ts'
import type { ProviderConfig } from '../../../../src/model-info/types.ts'

const openrouterConfig: ProviderConfig = {
  name: 'openrouter',
  baseUrl: 'https://openrouter.ai',
  modelsUrl: 'https://openrouter.ai/api/v1/models',
}

describe('OpenRouterParser', () => {
  it('when the body has no data key, returns an empty list', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({})

    expect(result).toEqual([])
  })

  it('when the body has models, normalizes them into records', () => {
    const parser = new OpenRouterParser(openrouterConfig)
    const body = {
      data: [
        {
          id: 'openai/gpt-4o',
          name: 'GPT-4o',
          context_length: 128000,
          pricing: { prompt: '0.000005', completion: '0.000015' },
          architecture: { modality: 'text->text' },
        },
      ],
    }

    const result = parser.parseResponse(body)

    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('openai/gpt-4o')
    expect(result[0].name).toBe('GPT-4o')
    expect(result[0].provider).toBe('openrouter')
    expect(result[0].costInput).toBe(5)
    expect(result[0].costOutput).toBe(15)
    expect(result[0].contextLength).toBe(128000)
    expect(result[0].modality).toBe('text->text')
    expect(result[0].knowledgeCutoff).toBeNull()
    expect(result[0].coding).toBeNull()
  })

  it('when the name is missing, uses the id as the name', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({ data: [{ id: 'openai/gpt-4o' }] })

    expect(result[0].name).toBe('openai/gpt-4o')
  })

  it('when pricing is missing, costs are zero', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({ data: [{ id: 'openai/gpt-4o' }] })

    expect(result[0].costInput).toBe(0)
    expect(result[0].costOutput).toBe(0)
  })

  it('when architecture is missing, modality is a dash', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({ data: [{ id: 'openai/gpt-4o' }] })

    expect(result[0].modality).toBe('-')
  })

  it('when context_length is missing, contextLength is null', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({ data: [{ id: 'openai/gpt-4o' }] })

    expect(result[0].contextLength).toBeNull()
  })

  it('when the modality is embeddings, reasoning is false', () => {
    const parser = new OpenRouterParser(openrouterConfig)
    const body = {
      data: [
        {
          id: 'openai/text-embedding-4',
          architecture: { modality: 'text->embeddings' },
        },
      ],
    }

    const result = parser.parseResponse(body)

    expect(result[0].reasoning).toBe(false)
  })

  it('when supported_parameters has no reasoning params, reasoning is false', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({
      data: [{ id: 'x', supported_parameters: ['tools'] }],
    })

    expect(result[0].reasoning).toBe(false)
  })

  it('when supported_parameters has reasoning params, reasoning stays null', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({
      data: [
        {
          id: 'x',
          supported_parameters: ['reasoning', 'reasoning_effort'],
        },
      ],
    })

    expect(result[0].reasoning).toBeNull()
    expect(result[0].reasoningOptions).toEqual(['toggle', 'effort'])
  })

  it('when reasoning metadata is omitted, reasoning is null', () => {
    const parser = new OpenRouterParser(openrouterConfig)

    const result = parser.parseResponse({ data: [{ id: 'x' }] })

    expect(result[0].reasoning).toBeNull()
    expect(result[0].reasoningOptions).toEqual([])
  })
})
