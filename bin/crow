#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-run=git --allow-sys=hostname
/** crow — CLI entry point. Delegates to src/cli.ts. */
import { join } from '@std/path'
import { createLogger } from '../src/logger.ts'
import { run } from '../src/cli.ts'

const crowDirectory = join(Deno.cwd(), '.crow')
const logger = createLogger(crowDirectory, 'debug')

run(Deno.args, crowDirectory, logger).catch((error) => {
  logger.error(error)
  Deno.exit(1)
})
