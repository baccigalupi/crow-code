import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { Environment } from '../../../src/env-vars.ts'
import { Command } from '../../../src/cli/commands/command.ts'

describe('Command', () => {
  it('when constructed, exposes the parsed commands to subclasses', () => {
    class FirstCommand extends Command {
      isMatch() {
        return this.commands[0] === 'first'
      }

      extractOptions() {
        return {}
      }

      run() {
        return Promise.resolve()
      }
    }

    const command = new FirstCommand({
      parsedArguments: { commands: ['first'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(true)
  })

  it('when constructed, exposes the parsed options to subclasses', () => {
    class GoalCommand extends Command {
      isMatch() {
        return true
      }

      extractOptions() {
        return { goal: this.options.goal }
      }

      run() {
        return Promise.resolve()
      }
    }

    const command = new GoalCommand({
      parsedArguments: { commands: [], options: { goal: 'ship' } },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.extractOptions()).toEqual({ goal: 'ship' })
  })

  it('when constructed, exposes the application data to subclasses', async () => {
    const consoleLog = mock.fn()

    class EchoDirectory extends Command {
      isMatch() {
        return true
      }

      extractOptions() {
        return {}
      }

      run() {
        this.consoleLog(this.crowDirectory)
        return Promise.resolve()
      }
    }

    await new EchoDirectory({
      parsedArguments: { commands: [], options: {} },
      crowDirectory: '/tmp/crow',
      logger: pino({ enabled: false }),
      consoleLog,
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('/tmp/crow')
  })
})
