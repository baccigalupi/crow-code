#!/usr/bin/env node
/**
 * Fetch model data and write .crow/models.json.
 */

import { main } from './app.js'

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
