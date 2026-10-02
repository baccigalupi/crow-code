import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  FetchRequest,
  fetchRequest,
} from '../../../src/model-requests/framework/fetch-request.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'

describe('fetch-request', () => {
  it('when the response is ok, returns the response and reports success', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = mockFetchSuccess({ value: 'hello' })
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    const fetchRequest = new FetchRequest(
      request,
      modelEndpoint,
      applicationData,
    )
    const response = await fetchRequest.run()

    expect(fetchRequest.success()).toBe(true)
    expect(await response.json()).toEqual({ value: 'hello' })
  })

  it('when the response is not ok, reports failure', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = mockFetchError(500)
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    const fetchRequest = new FetchRequest(
      request,
      modelEndpoint,
      applicationData,
    )
    const response = await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
    expect(response.status).toBe(500)
  })

  it('when the error response has a JSON body, succeeds parsing without error', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = () => {
      return Promise.resolve(
        new Response(JSON.stringify({ error: 'bad' }), { status: 400 }),
      )
    }
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    const fetchRequest = new FetchRequest(
      request,
      modelEndpoint,
      applicationData,
    )
    await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
  })

  it('when the error response has a non-JSON body, reports failure', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = () => {
      return Promise.resolve(new Response('not json', { status: 500 }))
    }
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    const fetchRequest = new FetchRequest(
      request,
      modelEndpoint,
      applicationData,
    )
    await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
  })

  it('when the fetch rejects, records the error and reports failure', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = mockFetchRejected('network down')
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    const fetchRequest = new FetchRequest(
      request,
      modelEndpoint,
      applicationData,
    )
    await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
  })

  it('when called through fetchRequest, runs and returns the caller', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = mockFetchSuccess({ value: 'hello' })
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    const caller = await fetchRequest(request, modelEndpoint, applicationData)

    expect(caller).toBeInstanceOf(FetchRequest)
    expect(caller.success()).toBe(true)
  })

  it('when running the request, sends the request to the fetch client', async () => {
    const request = new Request('https://example.com/api')
    const fetchMock = mockFetchSuccess({ value: 'hello' })
    const applicationData = mockApplicationData({ fetchClient: fetchMock })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: 'test-key',
      model: 'test-model',
      providerId: 1,
    }

    await new FetchRequest(request, modelEndpoint, applicationData).run()

    expect(fetchMock.calls[0]).toBe(request)
  })

  it('when the request fails without an api token, creates a provider availability record', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const fetchMock = mockFetchError(401)
    const applicationData = mockApplicationData({
      database,
      fetchClient: fetchMock,
    })
    const modelEndpoint = {
      baseURL: 'https://example.com/api',
      apiKey: '',
      model: 'test-model',
      providerId: 1,
    }

    await new FetchRequest(request, modelEndpoint, applicationData).run()

    const rows = await database('provider_availabilities')
    expect(rows).toHaveLength(1)
    expect(rows[0].provider_id).toBe(1)
    expect(rows[0].reason).toBe('no-api-key')
    await database.destroy()
  })
})
