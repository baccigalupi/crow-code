import { afterEach, beforeEach, describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import knex from 'knex'
import { AddProvider } from '../../../src/cli/commands/add-provider.ts'
import { Environment } from '../../../src/env-vars.ts'
import { openAndMigrateDatabase } from '../../../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import pino from 'pino'

const fixtureDirectory = join(fixturesDirectory, 'add-provider')

describe('AddProvider', () => {
  beforeEach(() => clearDirectory(fixtureDirectory))
  afterEach(() => clearDirectory(fixtureDirectory))

  it('when the command is add-provider, matches', () => {
    const command = new AddProvider({
      parsedArguments: { commands: ['add-provider'], options: {} },
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

  it('when the command is something else, does not match', () => {
    const command = new AddProvider({
      parsedArguments: { commands: ['git-commit'], options: {} },
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

  it('when options are passed, extracts them', () => {
    const command = new AddProvider({
      parsedArguments: {
        commands: ['add-provider'],
        options: { name: 'x', 'base-url': 'y', verbose: true },
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

    expect(command.extractOptions()).toEqual({
      name: 'x',
      'base-url': 'y',
      verbose: true,
    })
  })

  it('when run with provider params, creates the provider in the injected crow directory', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)

    await new AddProvider({
      parsedArguments: {
        commands: ['add-provider'],
        options: {
          name: 'ollama',
          'base-url': 'http://x',
          'api-key-env-var': 'OLLAMA_KEY',
        },
      },
      crowDirectory,
      logger,
      database,
      consoleLog: () => {},
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    const rows = await database('providers').select('*')
    expect(rows).toEqual([{
      id: expect.any(Number),
      name: 'ollama',
      base_url: 'http://x',
      models_path: null,
      api_key_env_var: 'OLLAMA_KEY',
    }])
    await database.destroy()
  })

  it('when run succeeds, writes the .env key reminder', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)
    const consoleLog = mock.fn()

    await new AddProvider({
      parsedArguments: {
        commands: ['add-provider'],
        options: {
          name: 'ollama',
          'base-url': 'http://x',
          'api-key-env-var': 'OLLAMA_KEY',
        },
      },
      crowDirectory,
      logger,
      database,
      consoleLog,
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to the .env file',
    )
    await database.destroy()
  })

  it('when the provider has no api key env var, writes the reminder with a placeholder key', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)
    const consoleLog = mock.fn()

    await new AddProvider({
      parsedArguments: {
        commands: ['add-provider'],
        options: { name: 'ollama', 'base-url': 'http://x' },
      },
      crowDirectory,
      logger,
      database,
      consoleLog,
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Provider added. Add your api key <api_key> to the .env file',
    )
    await database.destroy()
  })

  it('when creation fails, writes the failure message', async () => {
    const crowDirectory = join(fixtureDirectory, '.crow')
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://x',
    })
    const consoleLog = mock.fn()

    await new AddProvider({
      parsedArguments: {
        commands: ['add-provider'],
        options: { name: 'other', 'base-url': 'http://x' },
      },
      crowDirectory,
      logger,
      database,
      consoleLog,
      fetchClient: fetch,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe(
      'Unable to create a provider',
    )
    const rows = await database('providers').select('*')
    expect(rows).toHaveLength(1)
    await database.destroy()
  })
})
