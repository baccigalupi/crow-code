import knex, { type Knex } from 'knex'
import pino from 'pino'
import type OpenAI from 'openai'
import { stub } from '@std/testing/mock'
import { ApplicationData } from '../../src/application-data.ts'
import { parseArguments } from '../../src/application-data/arguments.ts'
import type { ParsedArguments } from '../../src/cli/types.ts'
import { Environment } from '../../src/application-data/env-vars.ts'
import type {
  ConsoleError,
  ConsoleLog,
  DenoCommand,
  Logger,
} from '../../src/types.ts'
import type { OpenAiClientOptions } from '../../src/model-requests/types.ts'
import type { PathPermissions } from '../../src/application-data/path-permissions.ts'
import { pathPermissions } from '../../src/application-data/path-permissions.ts'
import { mockFetchSuccess } from './mock-fetch.ts'

export type MockApplicationDataOverrides = {
  args?: string[]
  parsedArguments?: () => ParsedArguments
  crowDirectory?: string
  logger?: Logger
  database?: Knex
  close?: () => Promise<void>
  consoleLog?: ConsoleLog
  consoleError?: ConsoleError
  fetch?: typeof fetch
  chatClient?: (options: OpenAiClientOptions) => OpenAI
  denoCommand?: DenoCommand
  envars?: Environment
  gitPathPermissions?: PathPermissions
  repositoryRoot?: Promise<string>
}

export const mockApplicationData = (
  overrides: MockApplicationDataOverrides = {},
): ApplicationData => {
  const data = new ApplicationData()
  let database = overrides.database
  const lazyDatabase = () => {
    if (!database) {
      database = knex({
        client: 'better-sqlite3',
        connection: ':memory:',
        useNullAsDefault: true,
      })
    }
    return Promise.resolve(database)
  }

  const args = overrides.args || []
  const crowDirectory = overrides.crowDirectory || ''
  const logger = overrides.logger || pino({ enabled: false })
  const close = overrides.close || (() => Promise.resolve())
  const consoleLog = overrides.consoleLog || (() => {})
  const consoleError = overrides.consoleError || (() => {})
  const fetchClient = overrides.fetch || mockFetchSuccess({})
  const denoCommand = overrides.denoCommand || Deno.Command
  const envars = overrides.envars || new Environment({})

  stub(data, 'args', () => args)
  stub(
    data,
    'parsedArguments',
    overrides.parsedArguments || (() => parseArguments(args)),
  )
  stub(data, 'crowDirectory', () => crowDirectory)
  stub(data, 'logger', () => logger)
  stub(data, 'database', lazyDatabase)
  stub(data, 'close', close)
  stub(data, 'consoleLog', () => consoleLog)
  stub(data, 'consoleError', () => consoleError)
  stub(data, 'fetch', () => fetchClient)
  stub(data, 'denoCommand', () => denoCommand)
  stub(data, 'envars', () => envars)
  stub(data, 'gitPathPermissions', () =>
    overrides.gitPathPermissions ||
    pathPermissions({
      getRealPath: data.getRealPath(),
      allowedDirectories: [Deno.cwd()],
    }))
  stub(
    data,
    'repositoryRoot',
    () => overrides.repositoryRoot || Promise.resolve(Deno.cwd()),
  )

  if (overrides.chatClient) {
    stub(data, 'chatClient', overrides.chatClient)
  }

  return data
}
