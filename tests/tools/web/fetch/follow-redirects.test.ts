import { describe, expect, it, mock } from 'bun:test'
import { FollowRedirects } from '../../../../src/tools/web/fetch/follow-redirects.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockFetchSequence } from '../../../support/mock-fetch.ts'

describe('FollowRedirects', () => {
  it('when the redirect is relative, follows it to the resolved url', async () => {
    const fetch = mockFetchSequence([new Response('b')])
    const applicationData = mockApplicationData({ fetch })
    const response = new Response(null, {
      status: 302,
      headers: { location: '/b' },
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', response, signal }

    const follow = new FollowRedirects({ applicationData, operationArguments })
    await follow.run()

    expect(follow.result().url).toBe('https://192.0.2.1/b')
    expect(fetch.calls[0]).toBe('https://192.0.2.1/b')
  })

  it('when following several redirects, every hop carries the same signal', async () => {
    const responses = [
      new Response(null, { status: 302, headers: { location: '/c' } }),
      new Response('ok'),
    ]
    const fetch = mock((..._request: unknown[]) => {
      return Promise.resolve(responses.shift() as Response)
    })
    const applicationData = mockApplicationData({
      fetch: fetch as unknown as typeof globalThis.fetch,
    })
    const response = new Response(null, {
      status: 302,
      headers: { location: '/b' },
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', response, signal }

    await new FollowRedirects({ applicationData, operationArguments }).run()

    expect((fetch.mock.calls[0][1] as RequestInit).signal).toBe(signal)
    expect((fetch.mock.calls[1][1] as RequestInit).signal).toBe(signal)
  })

  it('when the redirect target is loopback, fails without fetching it', async () => {
    const fetch = mockFetchSequence([])
    const applicationData = mockApplicationData({ fetch })
    const response = new Response(null, {
      status: 302,
      headers: { location: 'http://127.0.0.1/' },
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'http://192.0.2.1/a', response, signal }

    const follow = new FollowRedirects({ applicationData, operationArguments })
    await follow.run()

    expect(follow.reason).toBe(
      'address not allowed: 127.0.0.1 resolves to 127.0.0.1',
    )
    expect(fetch.calls).toHaveLength(0)
  })

  it('when the redirect downgrades https to http, fails', async () => {
    const fetch = mockFetchSequence([])
    const applicationData = mockApplicationData({ fetch })
    const response = new Response(null, {
      status: 302,
      headers: { location: 'http://192.0.2.1/b' },
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', response, signal }

    const follow = new FollowRedirects({ applicationData, operationArguments })
    await follow.run()

    expect(follow.reason).toBe(
      'redirect downgrades to http: http://192.0.2.1/b',
    )
    expect(fetch.calls).toHaveLength(0)
  })

  it('when the sixth redirect arrives, fails', async () => {
    const fetch = mockFetchSequence([
      new Response(null, { status: 302, headers: { location: '/2' } }),
      new Response(null, { status: 302, headers: { location: '/3' } }),
      new Response(null, { status: 302, headers: { location: '/4' } }),
      new Response(null, { status: 302, headers: { location: '/5' } }),
      new Response(null, { status: 302, headers: { location: '/6' } }),
    ])
    const applicationData = mockApplicationData({ fetch })
    const response = new Response(null, {
      status: 302,
      headers: { location: '/1' },
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', response, signal }

    const follow = new FollowRedirects({ applicationData, operationArguments })
    await follow.run()

    expect(follow.reason).toBe('too many redirects: https://192.0.2.1/6')
    expect(fetch.calls).toHaveLength(5)
  })

  it('when the fifth redirect lands on a page, succeeds', async () => {
    const fetch = mockFetchSequence([
      new Response(null, { status: 302, headers: { location: '/2' } }),
      new Response(null, { status: 302, headers: { location: '/3' } }),
      new Response(null, { status: 302, headers: { location: '/4' } }),
      new Response(null, { status: 302, headers: { location: '/5' } }),
      new Response('done'),
    ])
    const applicationData = mockApplicationData({ fetch })
    const response = new Response(null, {
      status: 302,
      headers: { location: '/1' },
    })
    const signal = new AbortController().signal
    const operationArguments = { url: 'https://192.0.2.1/a', response, signal }

    const follow = new FollowRedirects({ applicationData, operationArguments })
    await follow.run()

    expect(follow.success()).toBe(true)
    expect(follow.result().url).toBe('https://192.0.2.1/5')
  })
})
