#!/usr/bin/env -S deno run --allow-read --allow-write --allow-env --allow-net --allow-sys=hostname
/** crow — CLI entry point. Delegates to src/cli.ts. */
import { run } from '../src/cli.ts'

run(Deno.args[0]).catch((error) => {
  console.error(error)
  Deno.exit(1)
})
