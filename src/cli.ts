import type { CatalogBuilder, Committer, ConsoleLog, Logger } from './types.ts'
import { parseArguments } from './cli/arguments.ts'
import { Cli } from './cli/cli.ts'
import { GitCommit } from './cli/commands/git-commit.ts'
import { Subcommands } from './cli/subcommands.ts'
import { buildModelCatalog } from './model-info/catalog/build-model-catalog.ts'
import { commitChanges } from './tools/git-commit/commit.ts'

export const run = async (
  argumentsList: string[],
  logger: Logger,
  consoleLog: ConsoleLog = console.log,
  commit: Committer = commitChanges,
  buildCatalog: CatalogBuilder = buildModelCatalog,
): Promise<void> => {
  const parsed = parseArguments(argumentsList)
  const subcommands = new Subcommands(logger, buildCatalog)
  const gitCommit = new GitCommit(parsed.goal, logger, consoleLog, commit)
  await new Cli(parsed, subcommands, gitCommit, consoleLog).run()
}
