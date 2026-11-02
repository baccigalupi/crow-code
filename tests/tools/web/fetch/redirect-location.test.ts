import { describe, expect, it } from 'bun:test'
import { RedirectLocation } from '../../../../src/tools/web/fetch/redirect-location.ts'

describe('RedirectLocation', () => {
  it('when the status is 302 with a location, is a redirect', () => {
    const response = new Response(null, {
      status: 302,
      headers: { location: '/b' },
    })

    const location = new RedirectLocation('https://192.0.2.1/a', response)

    expect(location.isRedirect()).toBe(true)
  })

  it('when the status is 302 without a location, is not a redirect', () => {
    const response = new Response(null, { status: 302 })

    const location = new RedirectLocation('https://192.0.2.1/a', response)

    expect(location.isRedirect()).toBe(false)
  })

  it('when the status is 200, is not a redirect', () => {
    const response = new Response('ok', { headers: { location: '/b' } })

    const location = new RedirectLocation('https://192.0.2.1/a', response)

    expect(location.isRedirect()).toBe(false)
  })

  it('when the location is relative, resolves it against the url', () => {
    const response = new Response(null, {
      status: 301,
      headers: { location: '/b' },
    })

    const location = new RedirectLocation('https://192.0.2.1/a', response)

    expect(location.target()).toBe('https://192.0.2.1/b')
  })
})
