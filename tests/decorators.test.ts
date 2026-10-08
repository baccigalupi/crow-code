import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { memoize } from '../src/decorators.ts'

describe('memoize', () => {
  it('when a decorated method is called, returns the value', () => {
    class Example {
      @memoize
      value() {
        return 'computed'
      }
    }

    const result = new Example().value()

    expect(result).toBe('computed')
  })

  it('when a decorated method is called twice, computes once', () => {
    let calls = 0
    class Example {
      @memoize
      value() {
        return ++calls
      }
    }

    const example = new Example()
    example.value()

    expect(example.value()).toBe(1)
  })

  it('when called on different instances, computes per instance', () => {
    let calls = 0
    class Example {
      @memoize
      value() {
        return ++calls
      }
    }

    new Example().value()

    expect(new Example().value()).toBe(2)
  })
})
