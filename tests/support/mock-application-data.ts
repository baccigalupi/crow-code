import pino from 'pino'
import type { Knex } from 'knex'
import type OpenAI from 'openai'
import { stub } from '@std/testing/mock'
import { ApplicationData } from '../../src/application-data/application-data.ts'
import { DenoRuntime } from '../../src/application-data/deno-runtime.ts'
import { CrowConfig } from '../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../src/application-data/load-config.ts'
import { Io } from '../../src/application-data/io.ts'
import { parseArguments } from '../../src/application-data/arguments.ts'
import { Environment } from '../../src/application-data/env-vars.ts'
import type {
  ConsoleError,
  ConsoleLog,
  DenoCommand,
  Logger,
} from '../../src/types.ts'
import type { OpenAiClientOptions } from '../../src/model-requests/types.ts'
import { mockFetchSuccess } from './mock-fetch.ts'
import { mockOpenAiClient } from './mock-openai-client.ts'
import { createTestDatabase } from './test-database.ts'

export type MockApplicationDataOverrides = {
  args?: string[]
  logger?: Logger
  consoleLog?: ConsoleLog
  consoleError?: ConsoleError
  fetch?: typeof fetch
  chatClient?: (options: OpenAiClientOptions) => OpenAI
  denoCommand?: DenoCommand
  envars?: Environment
  config?: CrowConfig
}

export const mockApplicationData = (
  overrides: MockApplicationDataOverrides = {},
): ApplicationData => {
  const data = new ApplicationData()
  const args = overrides.args || []
  data.denoRuntime = new DenoRuntime(Deno)
  data.io = new Io('')
  data.parsedArguments = parseArguments(args)
  data.repositoryRoot = Deno.cwd()
  data.config = overrides.config || new CrowConfig('.', defaultCrowConfig())

  const logger = overrides.logger || pino({ enabled: false })
  // Lazy on purpose: createTestDatabase starts native better-sqlite3 work
  // (migrations and cleanup) the moment it is called. Tests that never call
  // database() must not trigger it — leaked work crashed the Deno test runner
  // (SIGSEGV) under coverage.
  let database: Promise<Knex> | undefined
  const lazyDatabase = () => {
    if (!database) {
      database = createTestDatabase(logger)
    }
    return database
  }
  const consoleLog = overrides.consoleLog || (() => {})
  const consoleError = overrides.consoleError || (() => {})
  const fetchClient = overrides.fetch || mockFetchSuccess({})
  const denoCommand = overrides.denoCommand || Deno.Command
  const envars = overrides.envars || new Environment({})
  const chatClient = overrides.chatClient || mockOpenAiClient('')

  stub(data, 'args', () => args)
  stub(data, 'logger', () => logger)
  stub(data, 'database', lazyDatabase)
  data.close = () => Promise.resolve()
  stub(data, 'consoleLog', () => consoleLog)
  stub(data, 'consoleError', () => consoleError)
  stub(data, 'fetch', () => fetchClient)
  stub(data, 'denoCommand', () => denoCommand)
  stub(data, 'envars', () => envars)
  stub(data, 'chatClient', chatClient)

  return data
}
