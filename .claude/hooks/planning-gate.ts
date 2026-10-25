#!/usr/bin/env bun
// Denies Write/Edit of a file under .claude/plans/ unless the planning skill
// was loaded earlier in this session (AGENTS.md § Planning). Looks for the
// Skill tool call or the user's /planning command in the session transcript.
// Decision logic lives in planning-gate-decision.ts so it can be unit-tested
// directly without spawning this script.
import { decidePlanningWrite } from './planning-gate-decision.ts'

const raw = await Bun.stdin.text()

const deny = (reason: string) => {
  process.stdout.write(
    JSON.stringify({
      hookSpecificOutput: {
        hookEventName: 'PreToolUse',
        permissionDecision: 'deny',
        permissionDecisionReason: reason,
      },
    }),
  )
}

try {
  const payload = JSON.parse(raw)
  const filePath: string = payload?.tool_input?.file_path ?? ''
  const transcriptPath: string = payload?.transcript_path ?? ''
  const transcript = await Bun.file(transcriptPath)
    .text()
    .catch(() => '')

  const result = decidePlanningWrite({ filePath, transcript })

  if (result !== undefined) deny(result.reason)
} catch (error) {
  deny(
    `planning-gate failed to classify this write: ${
      (error as Error).message
    }. Report this to the maintainer — it is a gate bug.`,
  )
}
