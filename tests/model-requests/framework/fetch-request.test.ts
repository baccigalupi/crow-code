import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import {
  FetchRequest,
  fetchRequest,
} from '../../../src/model-requests/framework/fetch-request.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from '../../support/mock-fetch.ts'

describe('fetch-request', () => {
  it('when the response is ok, returns the response and reports success', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    const fetchRequest = new FetchRequest(request, fetchMock, logger)
    const response = await fetchRequest.run()

    expect(fetchRequest.success()).toBe(true)
    expect(await response.json()).toEqual({ value: 'hello' })
  })

  it('when the response is not ok, reports failure', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchError(500)

    const fetchRequest = new FetchRequest(request, fetchMock, logger)
    const response = await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
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

    const fetchRequest = new FetchRequest(request, fetchMock, logger)
    await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
    expect(fetchRequest.error).toBeUndefined()
  })

  it('when the error response has a non-JSON body, records a syntax error', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = () => {
      return Promise.resolve(new Response('not json', { status: 500 }))
    }

    const fetchRequest = new FetchRequest(request, fetchMock, logger)
    await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
    expect(fetchRequest.error).toBeInstanceOf(SyntaxError)
  })

  it('when the fetch rejects, records the error and reports failure', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchRejected('network down')

    const fetchRequest = new FetchRequest(request, fetchMock, logger)
    await fetchRequest.run()

    expect(fetchRequest.success()).toBe(false)
    expect(fetchRequest.error?.message).toBe('network down')
  })

  it('when called through fetchRequest, runs and returns the caller', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    const caller = await fetchRequest(request, fetchMock, logger)

    expect(caller).toBeInstanceOf(FetchRequest)
    expect(caller.success()).toBe(true)
  })

  it('when running the request, sends the request to the fetch client', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    await new FetchRequest(request, fetchMock, logger).run()

    expect(fetchMock.calls[0]).toBe(request)
  })
})
