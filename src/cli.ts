import type { Logger } from './model-info/types.ts'
import type {
  CatalogBuilder,
  Committer,
  ConsoleLog,
  DiffReader,
  SummaryRequester,
} from './types.ts'
import { Cli } from './cli/cli.ts'
import { Subcommands } from './cli/subcommands.ts'
import { buildModelCatalog } from './model-info/catalog/build-model-catalog.ts'
import { commitChanges } from './tools/git-commit/commit.ts'
import { getCurrentDiff } from './tools/git-commit/current-diff.ts'
import { requestCommitSummary } from './tools/git-commit/request.ts'

export const run = async (
  argumentsList: string[],
  logger: Logger,
  readDiff: DiffReader = getCurrentDiff,
  requestSummary: SummaryRequester = requestCommitSummary,
  consoleLog: ConsoleLog = console.log,
  commit: Committer = commitChanges,
  buildCatalog: CatalogBuilder = buildModelCatalog,
): Promise<void> => {
  const subcommands = new Subcommands(
    logger,
    readDiff,
    requestSummary,
    consoleLog,
    commit,
    buildCatalog,
  )
  await new Cli(argumentsList, subcommands, consoleLog).run()
}
