import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCalls, spy, stub } from '@std/testing/mock'
import { createMemoryTerminalHost } from '@ismail-elkorchi/terminal-ui/host'
import { createRunner, runReplApp } from '../../src/repl/runner.ts'

describe('createRunner', () => {
  it('when the app exits with completed status, exits with code 0', async () => {
    const run = spy(() => Promise.resolve('completed' as const))
    const runner = createRunner(run)
    using exit = stub(Deno, 'exit', () => undefined as never)

    await runner.run()

    assertSpyCalls(run, 1)
    assertSpyCalls(exit, 1)
    expect(exit.calls[0].args).toEqual([0])
  })

  it('when the app exits interrupted, exits with code 1', async () => {
    const run = spy(() => Promise.resolve('interrupted' as const))
    const runner = createRunner(run)
    using exit = stub(Deno, 'exit', () => undefined as never)

    await runner.run()

    assertSpyCalls(run, 1)
    assertSpyCalls(exit, 1)
    expect(exit.calls[0].args).toEqual([1])
  })

  it('when the app run throws, propagates the error without exiting', async () => {
    const failure = new Error('run failed')
    const runner = createRunner(() => Promise.reject(failure))
    using exit = stub(Deno, 'exit', () => undefined as never)

    const result = await runner.run().catch((error) => error)

    expect(result).toBe(failure)
    assertSpyCalls(exit, 0)
  })

  it('when the default app runs on a memory host, resolves after ctrl-c', async () => {
    const host = createMemoryTerminalHost({
      terminalSize: { columns: 80, rows: 24 },
    })

    const pending = runReplApp(host)
    host.input('\x03')
    const status = await pending

    expect(status).toBe('completed')
  })
})
