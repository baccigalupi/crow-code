import { describe, expect, it } from 'bun:test'
import { webFetch } from '../../../src/tools/web/fetch.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import {
  mockFetchError,
  mockFetchRejected,
  mockFetchResponse,
} from '../../support/mock-fetch.ts'

describe('webFetch', () => {
  it('when the page is text/plain, returns its text', async () => {
    const fetch = mockFetchResponse(
      () =>
        new Response('hello', { headers: { 'content-type': 'text/plain' } }),
    )
    const applicationData = mockApplicationData({ fetch })
    const operationArguments = { url: 'https://example.com/a' }

    const operation = webFetch({ applicationData, operationArguments })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(operation.result()).toEqual({
      url: 'https://example.com/a',
      status: 200,
      contentType: 'text/plain',
      text: 'hello',
    })
    expect(fetch.calls[0]).toBe('https://example.com/a')
  })

  it('when the status is not ok, fails with status and url', async () => {
    const applicationData = mockApplicationData({ fetch: mockFetchError(404) })
    const operationArguments = { url: 'https://example.com/missing' }

    const operation = webFetch({ applicationData, operationArguments })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.reason).toBe(
      'web fetch failed with status 404: https://example.com/missing',
    )
  })

  it('when the request rejects, fails with the url and message', async () => {
    const fetch = mockFetchRejected('network down')
    const applicationData = mockApplicationData({ fetch })
    const operationArguments = { url: 'https://example.com/a' }

    const operation = webFetch({ applicationData, operationArguments })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.reason).toBe(
      'web fetch failed: https://example.com/a — network down',
    )
  })

  it('when the page is application/json, returns the body unchanged', async () => {
    const fetch = mockFetchResponse(
      () =>
        new Response('{"a":1}', {
          headers: { 'content-type': 'application/json' },
        }),
    )
    const applicationData = mockApplicationData({ fetch })
    const operationArguments = { url: 'https://example.com/a.json' }

    const operation = webFetch({ applicationData, operationArguments })
    await operation.run()

    expect(operation.result().text).toBe('{"a":1}')
  })

  it('when the page has no content type, returns the body unchanged', async () => {
    const fetch = mockFetchResponse(
      () => new Response(new TextEncoder().encode('plain')),
    )
    const applicationData = mockApplicationData({ fetch })
    const operationArguments = { url: 'https://example.com/a' }

    const operation = webFetch({ applicationData, operationArguments })
    await operation.run()

    expect(operation.result().contentType).toBe('')
    expect(operation.result().text).toBe('plain')
  })

  it('when the page is text/html, returns its visible text', async () => {
    const fetch = mockFetchResponse(
      () =>
        new Response(
          '<html><body><script>x()</script><p>Hi &amp; bye</p></body></html>',
          { headers: { 'content-type': 'text/html; charset=utf-8' } },
        ),
    )
    const applicationData = mockApplicationData({ fetch })
    const operationArguments = { url: 'https://example.com/a' }

    const operation = webFetch({ applicationData, operationArguments })
    await operation.run()

    expect(operation.result().text).toBe('Hi & bye')
    expect(operation.result().contentType).toBe('text/html; charset=utf-8')
  })
})
