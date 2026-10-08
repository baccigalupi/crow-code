import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCallArg, spy, stub } from '@std/testing/mock'
import { createRunner } from '../../src/tui/runner.ts'
import { mockTerminal } from '../support/mock-terminal.ts'

describe('runner', () => {
  it('when ctrl-c is written to stdin, status resolves completed', async () => {
    const terminal = mockTerminal({})
    const runner = createRunner(terminal.io)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')

    expect(await pending).toBe('completed')
  })

  it('when stdin cannot set raw mode, status resolves interrupted since Ink requires it for user input', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const runner = createRunner(terminal.io)

    const status = await runner.status()

    expect(status).toBe('interrupted')
  })

  it('when the app completes, run exits with code 0', async () => {
    const terminal = mockTerminal({})
    const runner = createRunner(terminal.io)
    using exit = stub(Deno, 'exit', () => undefined as never)

    const pending = runner.run()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')
    await pending

    expect(exit.calls[0].args).toEqual([0])
  })

  it('when the app is interrupted, run exits with code 1', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const runner = createRunner(terminal.io)
    using exit = stub(Deno, 'exit', () => undefined as never)

    await runner.run()

    expect(exit.calls[0].args).toEqual([1])
  })

  it('when the app runs to completion, its signal listeners are removed', async () => {
    const terminal = mockTerminal({})
    const runner = createRunner(terminal.io)
    using remove = spy(Deno, 'removeSignalListener')

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')
    await pending

    assertSpyCallArg(remove, 0, 0, 'SIGINT')
    assertSpyCallArg(remove, 1, 0, 'SIGTERM')
  })

  it('when interrupted, unmounts and exits with code 1', async () => {
    const terminal = mockTerminal({})
    const runner = createRunner(terminal.io)
    using exit = stub(Deno, 'exit', () => undefined as never)

    const status = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    runner.interrupt()

    expect(await status).toBe('completed')
    expect(exit.calls[0].args).toEqual([1])
  })

  it('when the app fails, writes the error to stderr and resolves interrupted', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const runner = createRunner(terminal.io)
    using write = spy(terminal.stderr, 'write')

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(String(write.calls[0].args[0])).toContain(
      'setRawMode is not a function',
    )
  })

  it('when no stderr is provided, writes the error to Deno.stderr', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const runner = createRunner({
      stdin: terminal.io.stdin,
      stdout: terminal.io.stdout,
    })
    using write = stub(Deno.stderr, 'writeSync', () => 0)

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(new TextDecoder().decode(write.calls[0].args[0])).toContain(
      'setRawMode is not a function',
    )
  })
})
