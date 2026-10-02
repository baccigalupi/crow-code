import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { fetchRequest } from '../../../src/model-requests/framework/fetch-request.ts'
import { ModelRequestErrorHandler } from '../../../src/model-requests/framework/model-request-error-handler.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockFetchError, mockFetchSuccess } from '../../support/mock-fetch.ts'

describe('ModelRequestErrorHandler', () => {
  it('when the request failed without an api token, creates a provider availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: '',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      database,
      fetchClient: mockFetchError(401),
    })
    const apiRequest = await fetchRequest(
      new Request('https://example.com/api/v1/chat/completions'),
      modelEndpoint,
      applicationData,
    )

    await new ModelRequestErrorHandler(
      modelEndpoint,
      applicationData,
      apiRequest,
    ).run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].reason).toBe('no-api-key')
    await database.destroy()
  })

  it('when the request failed with an api token, does not create a provider availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      database,
      fetchClient: mockFetchError(500),
    })
    const apiRequest = await fetchRequest(
      new Request('https://example.com/api/v1/chat/completions'),
      modelEndpoint,
      applicationData,
    )

    await new ModelRequestErrorHandler(
      modelEndpoint,
      applicationData,
      apiRequest,
    ).run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(0)
    await database.destroy()
  })

  it('when the request succeeded, does not create a provider availability record', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const modelEndpoint = {
      baseURL: 'https://example.com/api/v1',
      apiKey: '',
      model: 'test-model',
      providerId: 1,
    }
    const applicationData = mockApplicationData({
      database,
      fetchClient: mockFetchSuccess({
        choices: [{ message: { content: '[]' } }],
      }),
    })
    const apiRequest = await fetchRequest(
      new Request('https://example.com/api/v1/chat/completions'),
      modelEndpoint,
      applicationData,
    )

    await new ModelRequestErrorHandler(
      modelEndpoint,
      applicationData,
      apiRequest,
    ).run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(0)
    await database.destroy()
  })
})
