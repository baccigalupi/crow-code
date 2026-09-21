import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { resolveModelsDevEntry } from '../../../../src/model-info/ratings/models-dev/resolve-models-dev.ts'
import type { ModelsDevCatalog } from '../../../../src/model-info/types.ts'

const catalog: ModelsDevCatalog = {
  openrouter: {
    'openai/gpt-6-astra': { reasoning: true, reasoningControls: ['effort'] },
    'deepseek/deepseek-v4-flash-0731': {
      reasoning: true,
      reasoningControls: ['toggle'],
    },
  },
  deepseek: {
    'deepseek/deepseek-v4-flash-0731': {
      reasoning: false,
      reasoningControls: [],
    },
  },
  poolside: {
    'poolside/laguna-xs-2.1': { reasoning: false, reasoningControls: [] },
  },
  google: {
    'google/gemma-4-26b-a4b-it': { reasoning: false, reasoningControls: [] },
  },
}

describe('resolveModelsDevEntry', () => {
  it('when the provider and id match exactly, returns the entry', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'openrouter',
      'openai/gpt-6-astra',
      'text->text',
    )

    expect(result).toEqual({ reasoning: true, reasoningControls: ['effort'] })
  })

  it('when the id has a serving suffix, resolves the normalized id', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'openrouter',
      'deepseek/deepseek-v4-flash-0731:free',
      'text->text',
    )

    expect(result).toEqual({ reasoning: true, reasoningControls: ['toggle'] })
  })

  it('when the id is a serving alias, inherits the base capability', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'nous',
      'openai/gpt-6-astra-flex',
      'text->text',
    )

    expect(result).toEqual({ reasoning: true, reasoningControls: ['effort'] })
  })

  it('when the id is an Ollama local alias, resolves the canonical model', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'ollama',
      'gemma4:26b',
      'local',
    )

    expect(result).toEqual({ reasoning: false, reasoningControls: [] })
  })

  it('when the provider is missing but the id is canonical, uses another provider entry', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'nous',
      'deepseek/deepseek-v4-flash-0731',
      'text->text',
    )

    expect(result).toEqual({ reasoning: false, reasoningControls: [] })
  })

  it('when the modality is embeddings, returns non-reasoning without a lookup', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'nous',
      'openai/text-embedding-4',
      'text->embeddings',
    )

    expect(result).toEqual({ reasoning: false, reasoningControls: [] })
  })

  it('when an embedding id also exists in the catalog, embeddings still wins', () => {
    const withEmbedding = {
      nous: {
        'openai/text-embedding-4': {
          reasoning: true,
          reasoningControls: ['toggle' as const],
        },
      },
    }

    const result = resolveModelsDevEntry(
      withEmbedding,
      'nous',
      'openai/text-embedding-4',
      'text->embeddings',
    )

    expect(result).toEqual({ reasoning: false, reasoningControls: [] })
  })

  it('when a local name has no alias, stays unmatched', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'ollama',
      'qwen3-coder:30b',
      'local',
    )

    expect(result).toBeUndefined()
  })

  it('when a canonical id matches nothing, stays unmatched', () => {
    const result = resolveModelsDevEntry(
      catalog,
      'openrouter',
      'openrouter/auto-beta',
      'text->text',
    )

    expect(result).toBeUndefined()
  })
})
