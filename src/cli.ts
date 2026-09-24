import { type Environment, loadEnvironmentalVariables } from './env-vars.ts'
import type { CommandApplicationData, ConsoleLog, Logger } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import { Cli } from './cli/cli.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { Help } from './cli/commands/help.ts'
import { Version } from './cli/commands/version.ts'

export const run = async (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  fetchClient: typeof fetch = fetch,
  denoCommand: typeof Deno.Command = Deno.Command,
  environment: Environment = loadEnvironmentalVariables(),
): Promise<void> => {
  const data: CommandApplicationData = {
    parsedArguments: parseArguments(argumentsList),
    crowDirectory,
    logger,
    consoleLog,
    fetchClient,
    denoCommand,
    environment,
  }
  await new Cli(
    new CreateModelCatalog(data),
    new GitCommit(data),
    new Help(data),
    new Version(data),
  ).run()
}
