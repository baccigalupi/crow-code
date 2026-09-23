import type { Committer, ConsoleLog, Logger } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import { Cli } from './cli/cli.ts'
import { FindModels } from './cli/commands/find-models.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { commitChanges } from './tools/git-commit/commit.ts'

export const run = async (
  argumentsList: string[],
  crowDirectory: string,
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  commit: Committer = commitChanges,
  fetchClient: typeof fetch = fetch,
): Promise<void> => {
  const parsed = parseArguments(argumentsList)
  const findModels = new FindModels(crowDirectory, logger, fetchClient)
  const gitCommit = new GitCommit(
    parsed.goal,
    crowDirectory,
    logger,
    consoleLog,
    commit,
    fetchClient,
  )
  await new Cli(parsed, findModels, gitCommit, consoleLog).run()
}
