import { type Environment, loadEnvironmentalVariables } from './env-vars.ts'
import type { CommandApplicationData, ConsoleLog, Logger } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import { Cli } from './cli/cli.ts'
import {
  CreateModelCatalog,
  CreateModelCatalogMatch,
} from './cli/commands/create-model-catalog.ts'
import { GitCommit, GitCommitMatch } from './cli/commands/git-commit.ts'
import { Help, HelpMatch } from './cli/commands/help.ts'

export const run = async (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  fetchClient: typeof fetch = fetch,
  denoCommand: typeof Deno.Command = Deno.Command,
  environment: Environment = loadEnvironmentalVariables(),
): Promise<void> => {
  const parsed = parseArguments(argumentsList)
  const data: CommandApplicationData = {
    crowDirectory,
    logger,
    consoleLog,
    fetchClient,
    denoCommand,
    environment,
  }
  await new Cli(
    parsed,
    new CreateModelCatalog(
      data,
      new CreateModelCatalogMatch(parsed).extractOptions(),
    ),
    new GitCommit(data, new GitCommitMatch(parsed).extractOptions()),
    new Help(data, new HelpMatch(parsed).extractOptions()),
    data,
  ).run()
}
