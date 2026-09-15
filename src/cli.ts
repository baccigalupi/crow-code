/**
 * crow — CLI for crow-code. Subcommands dispatch below.
 *   crow find-models   fetch model data and write .crow/models.json
 */
import { gatherModelData } from './model-discovery/gather-model-data.js'

const usage = `Usage: crow <subcommand>

Available subcommands:
  find-models   fetch model data and write .crow/models.json`

export const run = async (subcommand: string): Promise<void> => {
  if (subcommand === 'find-models') {
    await gatherModelData()
    return
  }
  console.error(usage)
}
