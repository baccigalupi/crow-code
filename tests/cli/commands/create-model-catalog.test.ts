import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import knex from 'knex'
import { CreateModelCatalog } from '../../../src/cli/commands/create-model-catalog.ts'
import { Environment } from '../../../src/env-vars.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'
import { mockFetchSuccess } from '../../support/mock-fetch.ts'
import { createTestDatabase } from '../../support/test-database.ts'
import { openAiClient } from '../../../src/model-requests/framework/openai-client.ts'
import pino from 'pino'

describe('CreateModelCatalog', () => {
  beforeEach(() =>
    clearDirectory(join(fixturesDirectory, 'create-model-catalog'))
  )
  afterEach(() =>
    clearDirectory(join(fixturesDirectory, 'create-model-catalog'))
  )

  it('when the command is create-model-catalog, matches', () => {
    const command = new CreateModelCatalog({
      parsedArguments: { commands: ['create-model-catalog'], options: {} },
      crowDirectory: '',
      logger: pino({ enabled: false }),
      database: knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      }),
      consoleLog: () => {},
      fetchClient: fetch,
      openAiClient: openAiClient,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    const result = command.isMatch()

    expect(result).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const command = new CreateModelCatalog({
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
      openAiClient: openAiClient,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    const result = command.isMatch()

    expect(result).toBe(false)
  })

  it('when options are passed, extracts none of them', () => {
    const command = new CreateModelCatalog({
      parsedArguments: {
        commands: ['create-model-catalog'],
        options: { verbose: true },
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
      openAiClient: openAiClient,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    })

    const result = command.extractOptions()

    expect(result).toEqual({})
  })

  it('when run, populates models from database providers', async () => {
    const fixtureDirectory = join(fixturesDirectory, 'create-model-catalog')
    const database = await createTestDatabase(pino({ enabled: false }))
    await database('providers').insert({
      name: 'ollama',
      base_url: 'http://pile-driver.local:11434',
      models_path: '/api/tags',
      api_key_env_var: null,
    })
    const fetchMock = mockFetchSuccess({
      models: [{ name: 'author/model', details: { context_length: 128000 } }],
    })

    await new CreateModelCatalog({
      parsedArguments: { commands: ['create-model-catalog'], options: {} },
      crowDirectory: join(fixtureDirectory, '.crow'),
      logger: pino({ enabled: false }),
      database,
      consoleLog: () => {},
      fetchClient: fetchMock,
      openAiClient: openAiClient,
      denoCommand: Deno.Command,
      environment: new Environment({}),
    }).run()

    expect(await database('models').select('identifier')).toEqual([
      { identifier: 'author/model' },
    ])
    await database.destroy()
  })
})
