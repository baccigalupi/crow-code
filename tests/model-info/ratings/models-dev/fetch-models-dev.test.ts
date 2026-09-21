import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../support/mock-fetch.ts'
import { fetchModelsDev } from '../../../../src/model-info/ratings/models-dev/fetch-models-dev.ts'

const logger = pino({ enabled: false })

describe('fetchModelsDev', () => {
  it('when the response has models, returns their capability per provider', async () => {
    const mockFetch = mockFetchSuccess({
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
    })

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result).toEqual({
      deepseek: {
        'deepseek/deepseek-v4': {
          reasoning: true,
          reasoningControls: ['toggle', 'effort'],
        },
      },
    })
  })

  it('when a model is non-reasoning, reasoning is false', async () => {
    const mockFetch = mockFetchSuccess({
      openai: {
        models: {
          'openai/gpt-4o-mini': { reasoning: false },
        },
      },
    })

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result['openai']['openai/gpt-4o-mini'].reasoning).toBe(false)
    expect(result['openai']['openai/gpt-4o-mini'].reasoningControls).toEqual(
      [],
    )
  })

  it('when a model has no reasoning field, reasoning is null', async () => {
    const mockFetch = mockFetchSuccess({
      openai: { models: { 'openai/mystery': {} } },
    })

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result['openai']['openai/mystery'].reasoning).toBeNull()
  })

  it('when an option type is unknown, it is dropped', async () => {
    const mockFetch = mockFetchSuccess({
      openai: {
        models: {
          'openai/x': {
            reasoning: true,
            reasoning_options: [{ type: 'magic' }, { type: 'budget_tokens' }],
          },
        },
      },
    })

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result['openai']['openai/x'].reasoningControls).toEqual([
      'budget_tokens',
    ])
  })

  it('when a model entry is not an object, it yields a null capability', async () => {
    const mockFetch = mockFetchSuccess({
      openai: { models: { 'openai/broken': 'oops' } },
    })

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result['openai']['openai/broken']).toEqual({
      reasoning: null,
      reasoningControls: [],
    })
  })

  it('when a provider has no models object, it is skipped', async () => {
    const mockFetch = mockFetchSuccess({ openai: { name: 'OpenAI' } })

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result).toEqual({})
  })

  it('when the body is malformed, returns an empty catalog', async () => {
    const mockFetch = mockFetchSuccess('not an object')

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result).toEqual({})
  })

  it('when the response is an error, returns an empty catalog', async () => {
    const mockFetch = mockFetchError(500)

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result).toEqual({})
  })

  it('when the network request fails, returns an empty catalog', async () => {
    const mockFetch = mockFetchRejected('network down')

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result).toEqual({})
  })
})
