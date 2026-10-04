import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, assertSpyCalls, spy, stub } from '@std/testing/mock'
import { createRunner } from '../../src/repl/runner.ts'
import type { App } from '../../src/repl/types.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'

describe('createRunner', () => {
  it('creates a runner that starts and cleans up the terminal app', async () => {
    const start = spy()
    const destroy = spy()
    const app = { start, destroy } as unknown as App
    const createApp = spy(() => app)
    const runner = createRunner(mockApplicationData(), createApp)
    using addSignal = stub(Deno, 'addSignalListener', () => {})
    using removeSignal = stub(Deno, 'removeSignalListener', () => {})
    using exit = stub(Deno, 'exit', () => undefined as never)

    const running = runner.run()
    runner.quit()
    await running

    assertSpyCalls(createApp, 1)
    assertSpyCalls(start, 1)
    assertSpyCalls(destroy, 1)
    assertSpyCalls(addSignal, 2)
    assertSpyCalls(removeSignal, 2)
    expect(exit.calls[0].args).toEqual([0])
  })

  it('cleans up when Deno sends SIGINT', async () => {
    const start = spy()
    const destroy = spy()
    const app = { start, destroy } as unknown as App
    const createApp = spy(() => app)
    const runner = createRunner(mockApplicationData(), createApp)
    using addSignal = stub(Deno, 'addSignalListener', () => {})
    using removeSignal = stub(Deno, 'removeSignalListener', () => {})
    using exit = stub(Deno, 'exit', () => undefined as never)

    const running = runner.run()
    const handleInterrupt = addSignal.calls[0].args[1]
    handleInterrupt()
    await running

    assertSpyCall(addSignal, 0, { args: ['SIGINT', handleInterrupt] })
    assertSpyCalls(createApp, 1)
    assertSpyCalls(destroy, 1)
    assertSpyCalls(removeSignal, 2)
    assertSpyCall(exit, 0, { args: [1] })
  })

  it('cleans up when the terminal app throws', async () => {
    const failure = new Error('start failed')
    const start = spy(() => {
      throw failure
    })
    const destroy = spy()
    const app = { start, destroy } as unknown as App
    const createApp = spy(() => app)
    const runner = createRunner(mockApplicationData(), createApp)
    using addSignal = stub(Deno, 'addSignalListener', () => {})
    using removeSignal = stub(Deno, 'removeSignalListener', () => {})
    using exit = stub(Deno, 'exit', () => undefined as never)

    const result = await runner.run().catch((error) => error)

    expect(result).toBe(failure)
    assertSpyCalls(createApp, 1)
    assertSpyCalls(addSignal, 2)
    assertSpyCalls(destroy, 1)
    assertSpyCalls(removeSignal, 2)
    assertSpyCalls(exit, 0)
  })
})
