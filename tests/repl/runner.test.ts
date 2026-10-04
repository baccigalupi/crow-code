import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCalls, spy, stub } from '@std/testing/mock'
import { createTerminalApp } from '@ubernaut/exotui/app'
import { ReplOptions } from '../../src/repl/repl.ts'
import { createRunner } from '../../src/repl/runner.ts'
import type { App } from '../../src/repl/types.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'

describe('createRunner', () => {
  it('creates a runner that starts and cleans up the terminal app', async () => {
    const start = spy()
    const destroy = spy()
    const app = { start, destroy } as unknown as App
    const appCreator: { create(options: ReplOptions): App } = {
      create: createTerminalApp,
    }
    using createApp = stub(appCreator, 'create', () => app)
    const runner = createRunner(mockApplicationData(), appCreator.create)
    using exit = stub(Deno, 'exit', () => undefined as never)

    const running = runner.run()
    const options = createApp.calls[0].args[0] as ReplOptions
    options.onAction({ type: 'app.quit' })
    await running

    expect(options).toBeInstanceOf(ReplOptions)
    assertSpyCalls(createApp, 1)
    assertSpyCalls(start, 1)
    assertSpyCalls(destroy, 1)
    expect(exit.calls[0].args).toEqual([0])
  })
})
