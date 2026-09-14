#!/usr/bin/env node
/**
 * Fetch model data and write .crow/models.json.
 *
 *   crow-code-models            read .crow/models.json if present, otherwise fetch and write it
 *   crow-code-models --refresh  always fetch and rewrite .crow/models.json
 */

import { main } from './app.js'

main(process.argv.includes('--refresh')).catch((error) => {
  console.error(error)
  process.exitCode = 1
})
