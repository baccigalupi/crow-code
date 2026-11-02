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

    clock.start()
    jest.advanceTimersByTime(14999)

    expect(clock.signal().aborted).toBe(false)
  })

  it('when fifteen seconds pass, aborts the signal with a TimeoutError', () => {
    const clock = new RequestClock()

    clock.start()
    jest.advanceTimersByTime(15000)

    expect(clock.signal().aborted).toBe(true)
    expect(clock.signal().reason.name).toBe('TimeoutError')
  })

  it('when stopped, leaves no timer running', () => {
    const clock = new RequestClock()
    clock.start()

    clock.stop()

    expect(jest.getTimerCount()).toBe(0)
  })
})
