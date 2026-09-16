#!/usr/bin/env -S deno run --allow-read --allow-env --allow-net
/**
 * Fetch model data and write .crow/models.json.
 */

import { gatherModelData } from './gather-model-data.ts'

export const run = () => {
  gatherModelData().catch((error: unknown) => {
    console.error(error)
    Deno.exit(1)
  })
}
