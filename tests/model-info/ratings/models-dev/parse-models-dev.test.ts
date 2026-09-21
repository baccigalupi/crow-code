import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { loadModelsDevFixture } from '../../../support/fixtures.ts'
import { parseCatalog } from '../../../../src/model-info/ratings/models-dev/parse-models-dev.ts'

describe('parseCatalog', () => {
  it('when parsing the real fixture, returns parsed entries', async () => {
    const raw = await loadModelsDevFixture()

    const result = await parseCatalog(raw)

    expect(result['subconscious']['subconscious/glm-5.2'].reasoning).toBe(true)
    expect(result['subconscious']['subconscious/glm-5.2'].reasoningOptions)
      .toEqual([
        'toggle',
        'budget_tokens',
      ])
  })

  it('when response is ok, returns parsed catalog', async () => {
    const raw = {
      openai: {
        models: {
          'openai/gpt-4o-mini': { reasoning: false },
        },
      },
    }
    const response = new Response(JSON.stringify(raw))

    const result = await parseCatalog(response)

    expect(result['openai']['openai/gpt-4o-mini'].reasoning).toBe(false)
  })

  it('when response is not ok, returns an empty catalog', async () => {
    const response = new Response(null, { status: 500 })

    const result = await parseCatalog(response)

    expect(result).toEqual({})
  })

  it('when a model has reasoning options, returns the option types', async () => {
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

    const result = await parseCatalog(raw)

    expect(result).toEqual({
      deepseek: {
        'deepseek/deepseek-v4': {
          reasoning: true,
          reasoningOptions: ['toggle', 'toggle', 'effort'],
        },
      },
    })
  })

  it('when a model is non-reasoning, reasoning is false', async () => {
    const raw = {
      openai: {
        models: {
          'openai/gpt-4o-mini': { reasoning: false },
        },
      },
    }

    const result = await parseCatalog(raw)

    expect(result['openai']['openai/gpt-4o-mini'].reasoning).toBe(false)
    expect(result['openai']['openai/gpt-4o-mini'].reasoningOptions).toEqual(
      [],
    )
  })

  it('when a model has no reasoning field, reasoning is null', async () => {
    const raw = {
      openai: { models: { 'openai/mystery': {} } },
    }

    const result = await parseCatalog(raw)

    expect(result['openai']['openai/mystery'].reasoning).toBeNull()
  })

  it('when an option type is unknown, it is dropped', async () => {
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

    const result = await parseCatalog(raw)

    expect(result['openai']['openai/x'].reasoningOptions).toEqual([
      'budget_tokens',
    ])
  })
})
