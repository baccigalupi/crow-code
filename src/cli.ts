/**
 * crow — CLI for crow-code. Subcommands dispatch below.
 *   crow find-models   fetch model data into the crow directory
 */
import { join } from '@std/path'
import { gatherModelData } from './model-discovery/gather-model-data.ts'

const usage = `Usage: crow <subcommand>

Available subcommands:
  find-models   fetch model data into the crow directory`

export const run = async (subcommand: string): Promise<void> => {
  if (subcommand === 'find-models') {
    await gatherModelData(join(Deno.cwd(), '.crow'))
    return
  }
  console.error(usage)
}
