/**
 * crow — CLI for crow-code. Subcommands dispatch below.
 *   crow find-models   fetch model data into the crow directory
 */
import { join } from '@std/path'
import type { Logger } from './model-info/types.ts'
import { buildModelCatalog } from './model-info/catalog/build-model-catalog.ts'

const usage = `Usage: crow <subcommand>

Available subcommands:
  find-models   fetch model data into the crow directory`

export const run = async (
  subcommand: string,
  logger: Logger,
) => {
  if (subcommand === 'find-models') {
    const crowDirectory = join(Deno.cwd(), '.crow')
    await buildModelCatalog(crowDirectory, logger)
    return
  }
  logger.error(usage)
}
