import { describe, expect, it } from 'bun:test'
import { delegate, memoize } from '../src/decorators.ts'

describe('decorators', () => {
  describe('delegate', () => {
    it('when a delegated member is called, calls it on the attribute', () => {
      class Greeter {
        greet() {
          return 'hello'
        }
      }
      @delegate({ greet: 'greet' }, 'greeter')
      class Host {
        private greeter = new Greeter()
      }
      interface Host {
        greet(): string
      }

      const result = new Host().greet()

      expect(result).toBe('hello')
    })

    it('when renamed, exposes the member under the given name', () => {
      class Greeter {
        greet() {
          return 'hello'
        }
      }
      @delegate({ greet: 'welcome' }, 'greeter')
      class Host {
        private greeter = new Greeter()
      }
      interface Host {
        welcome(): string
      }

      const result = new Host().welcome()

      expect(result).toBe('hello')
    })

    it('when several members are delegated, exposes each under its name', () => {
      class Greeter {
        greet() {
          return 'hello'
        }

        farewell() {
          return 'goodbye'
        }
      }
      @delegate({ greet: 'welcome', farewell: 'sendOff' }, 'greeter')
      class Host {
        private greeter = new Greeter()
      }
      interface Host {
        welcome(): string
        sendOff(): string
      }
      const host = new Host()

      const results = [host.welcome(), host.sendOff()]

      expect(results).toEqual(['hello', 'goodbye'])
    })
  })

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
})
