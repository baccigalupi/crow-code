import { describe, expect, it } from 'bun:test'
import { FetchFailure } from '../../../../src/tools/web/fetch/fetch-failure.ts'

describe('FetchFailure', () => {
  it('when the error is a timeout, returns its message', () => {
    const error = new DOMException(
      'web fetch timed out after 15000 ms: https://192.0.2.1/a',
      'TimeoutError',
    )

    const reason = new FetchFailure('https://192.0.2.1/b', error).reason()

    expect(reason).toBe(
      'web fetch timed out after 15000 ms: https://192.0.2.1/a',
    )
  })

  it('when the error is anything else, returns the url and message', () => {
    const error = new Error('network down')

    const reason = new FetchFailure('https://192.0.2.1/a', error).reason()

    expect(reason).toBe('web fetch failed: https://192.0.2.1/a — network down')
  })
})
