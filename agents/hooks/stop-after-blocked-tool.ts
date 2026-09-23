#!/usr/bin/env -S deno run --allow-env --allow-read --allow-write
// Stop hook: keeps the turn alive while a tool-call rejection is unrecovered.

import { recoveryIds, tryPruneRecovery } from './recovery-payload.ts'
import { stopDecision } from './stop-recovery.ts'

const readPayload = async () => {
  const text = await new Response(Deno.stdin.readable).text()
  try {
    return JSON.parse(text)
  } catch {
    return {}
  }
}

// deno-lint-ignore no-explicit-any
const normalize = (payload: any) => ({
  ...recoveryIds(payload),
  stopHookActive: payload !== null && payload.stop_hook_active === true,
})

const main = async () => {
  const projectDirectory = Deno.env.get('DEVIN_PROJECT_DIR')
  if (projectDirectory === undefined) return
  const input = normalize(await readPayload())
  await tryPruneRecovery(projectDirectory, input)
  const decision = await stopDecision(input, projectDirectory)
  if (decision !== null) console.log(JSON.stringify(decision))
}

await main()
