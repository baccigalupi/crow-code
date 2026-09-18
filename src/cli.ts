/**
 * crow — CLI for crow-code. Subcommands dispatch below.
 *   crow find-models   fetch model data into the crow directory
 */
import { join } from '@std/path'
import { buildModelCatalog } from './model-info/build-model-catalog.ts'
import { createLogger } from './logger.ts'

const usage = `Usage: crow <subcommand>

Available subcommands:
  find-models   fetch model data into the crow directory`

export const run = async (subcommand: string): Promise<void> => {
  if (subcommand === 'find-models') {
    const crowDirectory = join(Deno.cwd(), '.crow')
    const logger = createLogger(crowDirectory, 'debug')
    await buildModelCatalog(crowDirectory, logger)
    return
  }
  console.error(usage)
}
