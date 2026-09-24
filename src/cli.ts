import type {
  CommandApplicationData,
  ConsoleLog,
  Logger,
  ParsedArguments,
} from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import { Cli } from './cli/cli.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { GitCommit } from './cli/commands/git-commit.ts'

const goalFrom = (parsed: ParsedArguments) => {
  if (typeof parsed.options.goal === 'string') return parsed.options.goal
  return ''
}

export const run = async (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  fetchClient: typeof fetch = fetch,
): Promise<void> => {
  const parsed = parseArguments(argumentsList)
  const commandData: CommandApplicationData = {
    crowDirectory,
    logger,
    consoleLog,
    fetchClient,
  }
  const createModelCatalog = new CreateModelCatalog(commandData)
  const gitCommit = new GitCommit(commandData, goalFrom(parsed))
  await new Cli(parsed, createModelCatalog, gitCommit, commandData).run()
}
