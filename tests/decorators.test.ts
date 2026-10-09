import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { delegate, memoize } from '../src/decorators.ts'
import type { DenoCommand, RealPath } from '../src/types.ts'

describe('decorators', () => {
  describe('delegate', () => {
    it('when a delegated member is called, calls it on the attribute', () => {
      class FakeDeno {
        Command() {
          return Deno.Command
        }
      }
      @delegate({ Command: 'denoCommand' }, 'deno')
      class DenoHost {
        private deno = new FakeDeno()
      }
      const host = new DenoHost() as unknown as { denoCommand(): DenoCommand }

      const result = host.denoCommand()

      expect(result).toBe(Deno.Command)
    })

    it('when renamed, exposes the member under the given name', () => {
      class FakeDeno {
        realPath() {
          return Deno.realPath
        }
      }
      @delegate({ realPath: 'getRealPath' }, 'deno')
      class DenoHost {
        private deno = new FakeDeno()
      }
      const host = new DenoHost() as unknown as { getRealPath(): RealPath }

      const result = host.getRealPath()

      expect(result).toBe(Deno.realPath)
    })

    it('when several members are delegated, exposes each under its name', () => {
      class FakeDeno {
        Command() {
          return Deno.Command
        }

        realPath() {
          return Deno.realPath
        }
      }
      @delegate({ Command: 'denoCommand', realPath: 'getRealPath' }, 'deno')
      class DenoHost {
        private deno = new FakeDeno()
      }
      const host = new DenoHost() as unknown as {
        denoCommand(): DenoCommand
        getRealPath(): RealPath
      }

      const results = [host.denoCommand(), host.getRealPath()]

      expect(results).toEqual([Deno.Command, Deno.realPath])
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
