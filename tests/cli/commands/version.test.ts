import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import knex from 'knex'
import pino from 'pino'
import { Environment } from '../../../src/env-vars.ts'
import { Version } from '../../../src/cli/commands/version.ts'

describe('Version', () => {
  it('when --version is passed, matches', () => {
    const command = new Version({
      parsedArguments: { commands: [], options: { version: true } },
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

  it('when -V is passed, matches', () => {
    const command = new Version({
      parsedArguments: { commands: [], options: { V: true } },
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

  it('when no version option is passed, does not match', () => {
    const command = new Version({
      parsedArguments: { commands: [], options: {} },
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

    expect(command.isMatch()).toBe(false)
  })

  it('when options are passed, extracts none of them', () => {
    const command = new Version({
      parsedArguments: {
        commands: [],
        options: { version: true, verbose: true },
      },
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

  it('when run, writes the project version', async () => {
    const consoleLog = mock.fn()
    const database = knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    })
    const command = new Version({
      parsedArguments: { commands: [], options: { version: true } },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      database,
      consoleLog,
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    await command.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('crow 0.0.1')
    await database.destroy()
  })
})
