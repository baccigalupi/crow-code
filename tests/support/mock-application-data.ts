import pino from 'pino'
import type { Knex } from 'knex'
import type OpenAI from 'openai'
import { spyOn } from 'bun:test'
import { ApplicationData } from '../../src/application-data/application-data.ts'
import { Runtime } from '../../src/application-data/runtime.ts'
import { defaultFilesystem } from '../../src/application-data/filesystem.ts'
import { CrowConfig } from '../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../src/domain/config.ts'
import { Io } from '../../src/application-data/io.ts'
import { parseArguments } from '../../src/application-data/arguments.ts'
import { Environment } from '../../src/application-data/env-vars.ts'
import type {
  Command,
  ConsoleError,
  ConsoleLog,
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
  command?: Command
  exit?: (code: number) => void
  envars?: Environment
  config?: CrowConfig
  cwd?: string
}

export const mockApplicationData = (
  overrides: MockApplicationDataOverrides = {},
): ApplicationData => {
  const data = new ApplicationData()
  const args = overrides.args || []
  data.runtime = new Runtime(process, overrides.cwd)
  data.filesystem = defaultFilesystem()
  data.io = new Io('')
  data.parsedArguments = parseArguments(args)
  data.repositoryRoot = data.runtime.cwd
  data.config = overrides.config || new CrowConfig('.', defaultCrowConfig())
  data.envars = overrides.envars ||
    new Environment({ runtimeEnvironment: {}, filesystem: defaultFilesystem() })

  const logger = overrides.logger || pino({ enabled: false })
  // Lazy on purpose: createTestDatabase starts native sqlite work
  // (migrations and cleanup) the moment it is called. Tests that never call
  // database() must not trigger it.
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
  const chatClient = overrides.chatClient || mockOpenAiClient('')

  spyOn(data, 'args').mockImplementation(() => args)
  spyOn(data, 'logger').mockImplementation(() => logger)
  spyOn(data, 'database').mockImplementation(lazyDatabase)
  data.close = () => Promise.resolve()
  spyOn(data, 'consoleLog').mockImplementation(() => consoleLog)
  spyOn(data, 'consoleError').mockImplementation(() => consoleError)
  spyOn(data, 'fetch').mockImplementation(() => fetchClient)
  if (overrides.command) {
    spyOn(data.runtime, 'runCommand').mockImplementation(overrides.command)
  }
  const exit = (overrides.exit || (() => {})) as Runtime['exit']
  spyOn(data.runtime, 'exit').mockImplementation(exit)
  spyOn(data, 'chatClient').mockImplementation(chatClient)

  return data
}
