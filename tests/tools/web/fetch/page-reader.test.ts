import { describe, expect, it } from 'bun:test'
import { PageReader } from '../../../../src/tools/web/fetch/page-reader.ts'

describe('PageReader', () => {
  it('when the page is text/plain, returns its text', async () => {
    const headers = { 'content-type': 'text/plain' }
    const response = new Response('hello', { headers })

    const page = await new PageReader({
      url: 'https://192.0.2.1/a',
      response,
    }).read()

    expect(page).toEqual({
      url: 'https://192.0.2.1/a',
      status: 200,
      contentType: 'text/plain',
      text: 'hello',
    })
  })

  it('when the page is text/html, returns its visible text', async () => {
    const headers = { 'content-type': 'text/html' }
    const response = new Response('<p>Hi &amp; bye</p>', { headers })

    const page = await new PageReader({
      url: 'https://192.0.2.1/a',
      response,
    }).read()

    expect(page.text).toBe('Hi & bye')
  })

  it('when the page has no content type, returns the body unchanged', async () => {
    const response = new Response(new TextEncoder().encode('plain'))

    const page = await new PageReader({
      url: 'https://192.0.2.1/a',
      response,
    }).read()

    expect(page.contentType).toBe('')
    expect(page.text).toBe('plain')
  })
})
