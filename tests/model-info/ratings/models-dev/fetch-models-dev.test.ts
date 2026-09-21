import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { loadModelsDevFixture } from '../../../support/fixtures.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../../support/mock-fetch.ts'
import { fetchModelsDev } from '../../../../src/model-info/ratings/models-dev/fetch-models-dev.ts'

const logger = pino({ enabled: false })

describe('fetchModelsDev', () => {
  it('when the response has models, returns the parsed catalog', async () => {
    const mockFetch = mockFetchSuccess(await loadModelsDevFixture())

    const result = await fetchModelsDev(logger, mockFetch)

    expect(result['subconscious']['subconscious/glm-5.2'].reasoning).toBe(true)
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
