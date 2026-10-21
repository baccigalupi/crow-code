import { describe, expect, it, spyOn } from 'bun:test'
import pino from 'pino'
import { requestLogger } from '../../../src/model-requests/framework/request-logger.ts'
import type { RequestContext } from '../../../src/model-requests/types.ts'

describe('RequestLogger', () => {
  it('when the network error has a cause, logs it', () => {
    const logger = pino({ enabled: false })
    const loggerErrorSpy = spyOn(logger, 'error')
    const error = new Error('socket hangup', { cause: 'ECONNRESET' })
    const context: RequestContext = {
      modelEndpoint: {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      messages: [{ role: 'user', content: 'hi' }],
      timespan: { startTime: 0, endTime: 5 },
    }

    requestLogger(
      logger,
      'https://example.com/api/v1',
      error,
      context,
    ).networkError()

    const logged = loggerErrorSpy.mock.calls[0][0] as string
    expect(logged).toContain('Error: POST https://example.com/api/v1')
    expect(logged).toContain('model=test-model provider=1 duration=5ms')
    expect(logged).toContain('failed to connect:')
    expect(logged).toContain(
      'request: {"model":"test-model","messages":[{"role":"user","length":2}]}',
    )
    expect(logged).toContain('error: Error: socket hangup (cause: ECONNRESET)')
  })

  it('when the network error is a TypeError (what fetch throws), logs name and message only', () => {
    const logger = pino({ enabled: false })
    const loggerErrorSpy = spyOn(logger, 'error')
    const error = new TypeError('fetch failed')
    const context: RequestContext = {
      modelEndpoint: {
        baseURL: 'https://example.com/api/v1',
        apiKey: 'test-key',
        model: 'test-model',
        providerId: 1,
      },
      messages: [{ role: 'user', content: 'hi' }],
      timespan: { startTime: 0, endTime: 5 },
    }

    requestLogger(
      logger,
      'https://example.com/api/v1',
      error,
      context,
    ).networkError()

    const logged = loggerErrorSpy.mock.calls[0][0] as string
    expect(logged).toContain('Error: POST https://example.com/api/v1')
    expect(logged).toContain('model=test-model provider=1 duration=5ms')
    expect(logged).toContain('error: TypeError: fetch failed')
    expect(logged).not.toContain('cause')
  })
})
