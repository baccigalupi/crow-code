import { afterEach, beforeEach, describe, expect, it, jest } from 'bun:test'
import { RequestClock } from '../../../../src/tools/web/fetch/request-clock.ts'

describe('RequestClock', () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.clearAllTimers()
    jest.useRealTimers()
  })

  it('when started, leaves the signal open until fifteen seconds pass', () => {
    const clock = new RequestClock()

    clock.start('https://192.0.2.1/a')
    jest.advanceTimersByTime(14999)

    expect(clock.signal().aborted).toBe(false)
  })

  it('when fifteen seconds pass, aborts the signal with a TimeoutError', () => {
    const clock = new RequestClock()

    clock.start('https://192.0.2.1/a')
    jest.advanceTimersByTime(15000)

    expect(clock.signal().aborted).toBe(true)
    expect(clock.signal().reason.name).toBe('TimeoutError')
  })

  it('when fifteen seconds pass, the abort message names the limit and url', () => {
    const clock = new RequestClock()

    clock.start('https://192.0.2.1/a')
    jest.advanceTimersByTime(15000)

    expect(clock.signal().reason.message).toBe(
      'web fetch timed out after 15000 ms: https://192.0.2.1/a',
    )
  })

  it('when stopped, leaves no timer running', () => {
    const clock = new RequestClock()
    clock.start('https://192.0.2.1/a')

    clock.stop()

    expect(jest.getTimerCount()).toBe(0)
  })
})
