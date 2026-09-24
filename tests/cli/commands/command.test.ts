import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Environment } from '../../../src/env-vars.ts'
import { Command } from '../../../src/cli/commands/command.ts'

describe('Command', () => {
  it('when constructed, exposes the application data to subclasses', async () => {
    const consoleLog = mock.fn()

    class EchoDirectory extends Command {
      run() {
        this.consoleLog(this.crowDirectory)
        return Promise.resolve()
      }
    }

    await new EchoDirectory(
      {
        crowDirectory: '/tmp/crow',
        logger: pino({ enabled: false }),
        consoleLog,
        fetchClient: fetch,
        denoCommand: Deno.Command,
        environment: new Environment({}),
      },
      {},
    ).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('/tmp/crow')
  })

  it('when constructed, exposes the options to subclasses', async () => {
    const consoleLog = mock.fn()

    class EchoGoal extends Command {
      run() {
        this.consoleLog(this.options.goal)
        return Promise.resolve()
      }
    }

    await new EchoGoal(
      {
        crowDirectory: '',
        logger: pino({ enabled: false }),
        consoleLog,
        fetchClient: fetch,
        denoCommand: Deno.Command,
        environment: new Environment({}),
      },
      { goal: 'ship it' },
    ).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('ship it')
  })
})
