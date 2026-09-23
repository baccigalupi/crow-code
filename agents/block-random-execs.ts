#!/usr/bin/env -S deno run
// PreToolUse hook: blocks exec calls outside the prescribed allowlist.
// Prints {"decision":"block","reason":...} on stdout to deny; silence means pass.

import { blockReason } from './hooks/block-reason.ts'
import { commandAllowed } from './hooks/command-allowed.ts'
import { DevinConfig } from './hooks/devin-config.ts'

const fallback = 'Agent and dev scripts must be approved in .devin/config.json'

const block = (reason: string) => {
  console.log(JSON.stringify({ decision: 'block', reason }))
}

const readPayload = async () => {
  const text = await new Response(Deno.stdin.readable).text()
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

// deno-lint-ignore no-explicit-any
const extractCommand = (payload: any) => {
  if (payload === null || payload.tool_name !== 'exec') {
    return null
  }
  if (typeof payload.tool_input !== 'object' || payload.tool_input === null) {
    return null
  }
  if (typeof payload.tool_input.command !== 'string') {
    return null
  }
  return payload.tool_input.command
}

const main = async () => {
  const command = extractCommand(await readPayload())
  const projectDirectory = Deno.env.get('DEVIN_PROJECT_DIR')
  if (command === null || projectDirectory === undefined) return block(fallback)
  const path = `${projectDirectory}/.devin/config.json`
  const config = new DevinConfig(await Deno.readTextFile(path))
  if (!commandAllowed(command, config)) block(blockReason(command, config))
}

await main()
