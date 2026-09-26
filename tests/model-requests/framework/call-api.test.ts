import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  CallApi,
  callApi,
} from '../../../src/model-requests/framework/call-api.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'

describe('CallApi', () => {
  it('when the response is ok, returns the response and reports success', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    const callApi = new CallApi(request, fetchMock, logger)
    const response = await callApi.perform()

    expect(callApi.success()).toBe(true)
    expect(await response.json()).toEqual({ value: 'hello' })
  })

  it('when the response is not ok, reports failure', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchError(500)

    const callApi = new CallApi(request, fetchMock, logger)
    const response = await callApi.perform()

    expect(callApi.success()).toBe(false)
    expect(response.status).toBe(500)
  })

  it('when the error response has a JSON body, succeeds parsing without error', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = () => {
      return Promise.resolve(
        new Response(JSON.stringify({ error: 'bad' }), { status: 400 }),
      )
    }

    const callApi = new CallApi(request, fetchMock, logger)
    await callApi.perform()

    expect(callApi.success()).toBe(false)
    expect(callApi.error).toBeUndefined()
  })

  it('when the error response has a non-JSON body, records a syntax error', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = () => {
      return Promise.resolve(new Response('not json', { status: 500 }))
    }

    const callApi = new CallApi(request, fetchMock, logger)
    await callApi.perform()

    expect(callApi.success()).toBe(false)
    expect(callApi.error).toBeInstanceOf(SyntaxError)
  })

  it('when the fetch rejects, records the error and reports failure', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchRejected('network down')

    const callApi = new CallApi(request, fetchMock, logger)
    await callApi.perform()

    expect(callApi.success()).toBe(false)
    expect(callApi.error?.message).toBe('network down')
  })

  it('when called through callApi, performs and returns the caller', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    const caller = await callApi(request, fetchMock, logger)

    expect(caller).toBeInstanceOf(CallApi)
    expect(caller.success()).toBe(true)
  })

  it('when performing the request, sends the request to the fetch client', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    await new CallApi(request, fetchMock, logger).perform()

    expect(fetchMock.calls[0]).toBe(request)
  })
})
