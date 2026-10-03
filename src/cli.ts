import { type Environment, loadEnvironmentalVariables } from './env-vars.ts'
import { openAndMigrateDatabase } from './database/open-and-migrate-database.ts'
import type { ApplicationData, ConsoleLog, Logger } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import type { Command } from './cli/commands/command.ts'
import type OpenAI from 'openai'
import type { OpenAiClientOptions } from './model-requests/types.ts'
import { openAiClient as defaultOpenAiClient } from './model-requests/framework/openai-client.ts'
import { AddProvider } from './cli/commands/add-provider.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { Help } from './cli/commands/help.ts'
import { Version } from './cli/commands/version.ts'

type RunOptions = {
  crowDirectory: string
  logger: Logger
  consoleLog: ConsoleLog
  fetchClient: typeof fetch
  openAiClient: (options: OpenAiClientOptions) => OpenAI
  denoCommand: typeof Deno.Command
  environment: Environment
}

class Cli {
  private data: ApplicationData

  constructor(data: ApplicationData) {
    this.data = data
  }

  async run() {
    try {
      await this.matchedCommand().run()
    } finally {
      await this.data.database.destroy()
    }
  }

  private commands(): Command[] {
    return [
      new Version(this.data),
      new CreateModelCatalog(this.data),
      new AddProvider(this.data),
      new Help(this.data),
    ]
  }

  private matchedCommand() {
    return this.commands().filter((command) => command.isMatch())[0]
  }
}

export const run = (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  fetchClient: typeof fetch = fetch,
  openAiClient: (options: OpenAiClientOptions) => OpenAI = defaultOpenAiClient,
  denoCommand: typeof Deno.Command = Deno.Command,
  environment: Environment = loadEnvironmentalVariables(),
): Promise<void> =>
  cli(argumentsList, {
    crowDirectory,
    logger,
    consoleLog,
    fetchClient,
    openAiClient,
    denoCommand,
    environment,
  }).then((cli) => cli.run())

const cli = async (argumentsList: string[], options: RunOptions) => {
  const { crowDirectory, logger } = options
  const database = await openAndMigrateDatabase(crowDirectory, logger)
  const parsedArguments = parseArguments(argumentsList)
  return new Cli({ parsedArguments, database, ...options })
}
