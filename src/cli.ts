import type { Committer, ConsoleLog, Logger, ParsedArguments } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import { Cli } from './cli/cli.ts'
import { CreateModelCatalog } from './cli/commands/create-model-catalog.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { commitChanges } from './tools/git-commit/commit.ts'

const goalFrom = (parsed: ParsedArguments) => {
  if (typeof parsed.options.goal === 'string') return parsed.options.goal
  return ''
}

export const run = async (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  commit: Committer = commitChanges,
  fetchClient: typeof fetch = fetch,
): Promise<void> => {
  const parsed = parseArguments(argumentsList)
  const createModelCatalog = new CreateModelCatalog(
    crowDirectory,
    logger,
    fetchClient,
  )
  const gitCommit = new GitCommit(
    goalFrom(parsed),
    crowDirectory,
    logger,
    consoleLog,
    commit,
    fetchClient,
  )
  await new Cli(parsed, createModelCatalog, gitCommit, consoleLog).run()
}
