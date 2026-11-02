import { describe, expect, it, mock } from 'bun:test'
import { SendRequest } from '../../../../src/tools/web/fetch/send-request.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockFetchResponse } from '../../../support/mock-fetch.ts'

describe('SendRequest', () => {
  it('when the url is allowed, returns the response', async () => {
    const fetch = mockFetchResponse(() => new Response('ok'))
    const applicationData = mockApplicationData({ fetch })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', signal }

    const request = new SendRequest({ applicationData, operationArguments })
    await request.run()

    expect(request.success()).toBe(true)
    expect(await request.result().text()).toBe('ok')
  })

  it('when sending, asks for manual redirects, omits credentials, identifies as crow and carries the signal', async () => {
    const fetch = mock((..._request: unknown[]) => {
      return Promise.resolve(new Response('ok'))
    })
    const applicationData = mockApplicationData({
      fetch: fetch as unknown as typeof globalThis.fetch,
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', signal }

    await new SendRequest({ applicationData, operationArguments }).run()

    expect(fetch.mock.calls[0]).toEqual([
      'https://192.0.2.1/a',
      {
        redirect: 'manual',
        credentials: 'omit',
        headers: { 'user-agent': 'crow' },
        signal,
      },
    ])
  })

  it('when the url is loopback, fails without fetching', async () => {
    const fetch = mockFetchResponse(() => new Response('x'))
    const applicationData = mockApplicationData({ fetch })
    const signal = new AbortController().signal
    const operationArguments = { url: 'http://127.0.0.1/', signal }

    const request = new SendRequest({ applicationData, operationArguments })
    await request.run()

    expect(request.success()).toBe(false)
    expect(request.reason).toBe(
      'address not allowed: 127.0.0.1 resolves to 127.0.0.1',
    )
    expect(fetch.calls).toHaveLength(0)
  })
})
