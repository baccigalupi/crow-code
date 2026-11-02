import { describe, expect, it } from 'bun:test'
import { FetchResponse } from '../../../../src/tools/web/fetch/fetch-response.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import {
  mockFetchResponse,
  mockFetchSequence,
} from '../../../support/mock-fetch.ts'

describe('FetchResponse', () => {
  it('when the response is not a redirect, returns it with the url', async () => {
    const fetch = mockFetchResponse(() => new Response('ok'))
    const applicationData = mockApplicationData({ fetch })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', signal }

    const operation = new FetchResponse({ applicationData, operationArguments })
    await operation.run()

    expect(operation.result().url).toBe('https://192.0.2.1/a')
    expect(await operation.result().response.text()).toBe('ok')
    expect(fetch.calls).toHaveLength(1)
  })

  it('when the response is a redirect, returns the page it leads to', async () => {
    const fetch = mockFetchSequence([
      new Response(null, { status: 302, headers: { location: '/b' } }),
      new Response('b'),
    ])
    const applicationData = mockApplicationData({ fetch })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', signal }

    const operation = new FetchResponse({ applicationData, operationArguments })
    await operation.run()

    expect(operation.result().url).toBe('https://192.0.2.1/b')
    expect(fetch.calls).toHaveLength(2)
  })

  it('when the url is loopback, fails without fetching', async () => {
    const fetch = mockFetchResponse(() => new Response('x'))
    const applicationData = mockApplicationData({ fetch })
    const signal = new AbortController().signal
    const operationArguments = { url: 'http://127.0.0.1/', signal }

    const operation = new FetchResponse({ applicationData, operationArguments })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(fetch.calls).toHaveLength(0)
  })
})
