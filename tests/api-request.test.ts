import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchSuccess,
} from './support/mock-fetch.ts'
import { ApiRequest } from '../src/api-request.ts'
import pino from 'pino'

describe('ApiRequest', () => {
  it('when the response is ok, parses the response', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const parseBody = async (response: Response) => {
      return (await response.json()).value as string
    }
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    const result = await new ApiRequest(request, fetchMock, parseBody, logger)
      .perform()

    expect(result).toBe('hello')
  })

  it('when the response is not ok, logs the status and parses the error response', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const parseBody = () => Promise.resolve('empty')
    const fetchMock = mockFetchError(500)

    const result = await new ApiRequest(request, fetchMock, parseBody, logger)
      .perform()

    expect(result).toBe('empty')
  })

  it('when the fetch rejects, logs the failure and parses an error response', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const parseBody = () => Promise.resolve('empty')
    const fetchMock = mockFetchRejected('network down')

    const result = await new ApiRequest(request, fetchMock, parseBody, logger)
      .perform()

    expect(result).toBe('empty')
  })

  it('when performing the request, sends the request to the fetch client', async () => {
    const request = new Request('https://example.com/api')
    const logger = pino({ enabled: false })
    const parseBody = async (response: Response) => {
      return (await response.json()).value as string
    }
    const fetchMock = mockFetchSuccess({ value: 'hello' })

    await new ApiRequest(request, fetchMock, parseBody, logger).perform()

    expect(fetchMock.calls[0]).toBe(request)
  })
})
