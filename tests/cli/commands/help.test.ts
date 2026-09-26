import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import knex from 'knex'
import pino from 'pino'
import { Help } from '../../../src/cli/commands/help.ts'
import { Environment } from '../../../src/env-vars.ts'

describe('Help', () => {
  it('when any arguments are passed, matches', () => {
    const command = new Help({
      parsedArguments: { commands: ['unknown'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.isMatch()).toBe(true)
  })

  it('when options are passed, extracts none of them', () => {
    const command = new Help({
      parsedArguments: { commands: [], options: { help: true, verbose: true } },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    expect(command.extractOptions()).toEqual({})
  })

  it('when run, writes the usage text', async () => {
    const consoleLog = mock.fn()
    const database = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    })
    const command = new Help({
      parsedArguments: { commands: [], options: { help: true } },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      database,
      consoleLog,
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    await command.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
    expect(consoleLog.mock.calls[0].arguments[0]).toContain('add-provider')
    await database.destroy()
  })
})
