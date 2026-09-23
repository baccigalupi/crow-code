#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write
// PreToolUse hook: blocks exec calls outside the prescribed allowlist.
// Prints {"decision":"block","reason":...} on stdout to deny; silence means pass.

import { blockReason } from './block-reason.ts'
import { commandAllowed } from './command-allowed.ts'
import { DevinConfig } from './devin-config.ts'
import {
  type RecoveryIds,
  recoveryIds,
  tryPruneRecovery,
  tryRecordRecovery,
} from './recovery-payload.ts'

const fallback = 'Agent and dev scripts must be approved in .devin/config.json'

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

const loadConfig = async (projectDirectory: string) => {
  const path = `${projectDirectory}/.devin/config.json`
  return new DevinConfig(await Deno.readTextFile(path))
}

const decide = async (
  command: string | null,
  projectDirectory: string | undefined,
) => {
  if (command === null || projectDirectory === undefined) return fallback
  const config = await loadConfig(projectDirectory)
  if (commandAllowed(command, config)) return null
  return blockReason(command, config)
}

const block = async (
  reason: string,
  projectDirectory: string | undefined,
  ids: RecoveryIds,
) => {
  await tryRecordRecovery(projectDirectory, ids)
  console.log(JSON.stringify({ decision: 'block', reason }))
}

const main = async () => {
  const payload = await readPayload()
  const projectDirectory = Deno.env.get('DEVIN_PROJECT_DIR')
  const ids = recoveryIds(payload)
  await tryPruneRecovery(projectDirectory, ids)
  const reason = await decide(extractCommand(payload), projectDirectory)
  if (reason !== null) await block(reason, projectDirectory, ids)
}

await main()
