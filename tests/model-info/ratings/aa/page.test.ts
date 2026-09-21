import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { BenchmarksPage } from '../../../../src/model-info/ratings/aa/page.ts'
import { Environment } from '../../../../src/env-vars.ts'
import { mockFetchSuccess } from '../../../support/mock-fetch.ts'
import pino from 'pino'

describe('BenchmarksPage', () => {
  it('when the request succeeds, returns the parsed page', async () => {
    const body = { data: [{ slug: 'x' }], pagination: { has_more: true } }
    const logger = pino({ enabled: false })
    const environment = new Environment({ AA_API_KEY: 'test-key' })
    const page = new BenchmarksPage(
      1,
      environment,
      mockFetchSuccess(body),
      logger,
    )

    const result = await page.fetch()

    expect(result).toEqual(body)
  })

  it('when the api key is missing, returns an empty page without fetching', async () => {
    const logger = pino({ enabled: false })
    const environment = new Environment({})
    const fetchMock = mockFetchSuccess({})
    const page = new BenchmarksPage(1, environment, fetchMock, logger)

    const result = await page.fetch()

    expect(result).toEqual({ data: [], pagination: { has_more: false } })
    expect(fetchMock.calls).toHaveLength(0)
  })
})
