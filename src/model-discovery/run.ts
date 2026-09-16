#!/usr/bin/env -S deno run --allow-read --allow-env --allow-net
/**
 * Fetch model data and write .crow/models.json.
 */

import { gatherModelData } from './gather-model-data.js'

gatherModelData().catch((error) => {
  console.error(error)
  Deno.exit(1)
})
