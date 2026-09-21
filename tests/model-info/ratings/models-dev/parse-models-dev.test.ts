import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { parseModelsDevCatalog } from '../../../../src/model-info/ratings/models-dev/parse-models-dev.ts'

describe('parseModelsDevCatalog', () => {
  it('when a model has reasoning options, returns deduped control types', () => {
    const raw = {
      deepseek: {
        models: {
          'deepseek/deepseek-v4': {
            reasoning: true,
            reasoning_options: [
              { type: 'toggle' },
              { type: 'toggle' },
              { type: 'effort', values: ['low', 'high'] },
            ],
          },
        },
      },
    }

    const result = parseModelsDevCatalog(raw)

    expect(result).toEqual({
      deepseek: {
        'deepseek/deepseek-v4': {
          reasoning: true,
          reasoningControls: ['toggle', 'effort'],
        },
      },
    })
  })

  it('when a model is non-reasoning, reasoning is false', () => {
    const raw = {
      openai: {
        models: {
          'openai/gpt-4o-mini': { reasoning: false },
        },
      },
    }

    const result = parseModelsDevCatalog(raw)

    expect(result['openai']['openai/gpt-4o-mini'].reasoning).toBe(false)
    expect(result['openai']['openai/gpt-4o-mini'].reasoningControls).toEqual(
      [],
    )
  })

  it('when a model has no reasoning field, reasoning is null', () => {
    const raw = {
      openai: { models: { 'openai/mystery': {} } },
    }

    const result = parseModelsDevCatalog(raw)

    expect(result['openai']['openai/mystery'].reasoning).toBeNull()
  })

  it('when an option type is unknown, it is dropped', () => {
    const raw = {
      openai: {
        models: {
          'openai/x': {
            reasoning: true,
            reasoning_options: [{ type: 'magic' }, { type: 'budget_tokens' }],
          },
        },
      },
    }

    const result = parseModelsDevCatalog(raw)

    expect(result['openai']['openai/x'].reasoningControls).toEqual([
      'budget_tokens',
    ])
  })

  it('when a model entry is not an object, it yields a null capability', () => {
    const raw = {
      openai: { models: { 'openai/broken': 'oops' } },
    }

    const result = parseModelsDevCatalog(raw)

    expect(result['openai']['openai/broken']).toEqual({
      reasoning: null,
      reasoningControls: [],
    })
  })

  it('when a provider has no models object, it is skipped', () => {
    const raw = { openai: { name: 'OpenAI' } }

    const result = parseModelsDevCatalog(raw)

    expect(result).toEqual({})
  })

  it('when the body is not an object, returns an empty catalog', () => {
    const result = parseModelsDevCatalog('not an object')

    expect(result).toEqual({})
  })
})
