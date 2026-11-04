import { describe, expect, it } from 'bun:test'
import { PageParser } from '../../../../../src/tools/web/fetch/read-body/page-parser.ts'

describe('PageParser', () => {
  it('when the page is text/plain, returns its text', async () => {
    const headers = { 'content-type': 'text/plain' }
    const response = new Response(null, { headers })
    const fetched = { url: 'https://192.0.2.1/a', response }

    const page = await new PageParser(fetched, 'hello').page()

    expect(page).toEqual({
      url: 'https://192.0.2.1/a',
      status: 200,
      contentType: 'text/plain',
      text: 'hello',
    })
  })

  it('when the page is text/html, returns its visible text', async () => {
    const headers = { 'content-type': 'text/html' }
    const response = new Response(null, { headers })
    const fetched = { url: 'https://192.0.2.1/a', response }

    const page = await new PageParser(fetched, '<p>Hi &amp; bye</p>').page()

    expect(page.text).toBe('Hi & bye')
  })

  it('when the page is application/xhtml+xml, returns its visible text', async () => {
    const headers = { 'content-type': 'application/xhtml+xml' }
    const response = new Response(null, { headers })
    const fetched = { url: 'https://192.0.2.1/a', response }

    const page = await new PageParser(fetched, '<p>Hi &amp; bye</p>').page()

    expect(page.text).toBe('Hi & bye')
  })

  it('when the page has no content type, returns the body unchanged', async () => {
    const response = new Response(null)
    const fetched = { url: 'https://192.0.2.1/a', response }

    const page = await new PageParser(fetched, '<p>plain</p>').page()

    expect(page.contentType).toBe('')
    expect(page.text).toBe('<p>plain</p>')
  })
})
