#!/usr/bin/env node
/**
 * Fetch model data and write .crow/models.json.
 */

import { gatherModelData } from './gather-model-data.js'

gatherModelData().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
