import { describe, expect, it } from 'bun:test'
import { ReadBody } from '../../../../src/tools/web/fetch/read-body.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'

describe('ReadBody', () => {
  it('when the body is under the cap, returns the parsed page', async () => {
    const applicationData = mockApplicationData()
    const headers = { 'content-type': 'text/plain' }
    const response = new Response('hello', { headers })
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(body.success()).toBe(true)
    expect(body.result()).toEqual({
      url: 'https://192.0.2.1/a',
      status: 200,
      contentType: 'text/plain',
      text: 'hello',
    })
  })

  it('when the body is one byte over the cap, fails with the url', async () => {
    const applicationData = mockApplicationData()
    const response = new Response('a'.repeat(2097153))
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(body.success()).toBe(false)
    expect(body.reason).toBe(
      'web fetch body over 2097152 bytes: https://192.0.2.1/a',
    )
  })

  it('when the body never ends, cancels the stream past the cap', async () => {
    let cancelled = false
    const stream = new ReadableStream({
      pull(controller) {
        controller.enqueue(new Uint8Array(1048576))
      },
      cancel() {
        cancelled = true
      },
    })
    const applicationData = mockApplicationData()
    const response = new Response(stream)
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(cancelled).toBe(true)
    expect(body.success()).toBe(false)
  })

  it('when the stream errors, fails with the url and message', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.error(new Error('connection reset'))
      },
    })
    const applicationData = mockApplicationData()
    const response = new Response(stream)
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(body.success()).toBe(false)
    expect(body.reason).toBe(
      'web fetch failed: https://192.0.2.1/a — connection reset',
    )
  })

  it('when a character spans two chunks, decodes it whole', async () => {
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(new Uint8Array([0xc3]))
        controller.enqueue(new Uint8Array([0xa9]))
        controller.close()
      },
    })
    const applicationData = mockApplicationData()
    const response = new Response(stream)
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(body.result().text).toBe('é')
  })

  it('when the response has no body, returns empty text', async () => {
    const applicationData = mockApplicationData()
    const response = new Response(null, { status: 204 })
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(body.success()).toBe(true)
    expect(body.result().text).toBe('')
  })

  it('when the body is exactly the cap, returns it', async () => {
    const applicationData = mockApplicationData()
    const response = new Response('a'.repeat(2097152))
    const operationArguments = { url: 'https://192.0.2.1/a', response }

    const body = new ReadBody({ applicationData, operationArguments })
    await body.run()

    expect(body.success()).toBe(true)
    expect(body.result().text.length).toBe(2097152)
  })
})
