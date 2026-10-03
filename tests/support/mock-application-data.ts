import { mock } from 'node:test'
import knex from 'knex'
import pino from 'pino'
import { Environment } from '../../src/env-vars.ts'
import type { ApplicationData } from '../../src/types.ts'
import { mockFetchSuccess } from './mock-fetch.ts'
import { openAiClient } from '../../src/model-requests/framework/openai-client.ts'

export const mockApplicationData = (
  overrides: Partial<ApplicationData> = {},
): ApplicationData => {
  return {
    parsedArguments: { commands: [], options: {} },
    crowDirectory: '',
    logger: pino({ enabled: false }),
    database: knex({
      client: 'better-sqlite3',
      connection: ':memory:',
      useNullAsDefault: true,
    }),
    consoleLog: mock.fn(),
    fetchClient: mockFetchSuccess({}),
    openAiClient: openAiClient,
    denoCommand: Deno.Command,
    environment: new Environment({}),
    ...overrides,
  }
}
