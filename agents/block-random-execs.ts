#!/usr/bin/env -S deno run
// PreToolUse hook: blocks exec calls outside the prescribed allowlist.
// Prints {"decision":"block","reason":...} on stdout to deny; silence means pass.

import { commandAllowed } from './hooks/command-allowed.ts'

const reason =
  'Allowed commands: scripts in agents/ or dev/, git (except push), bd, curl'

const block = () => {
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
  if (command === null || !commandAllowed(command)) {
    block()
  }
}

await main()
