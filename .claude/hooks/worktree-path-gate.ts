#!/usr/bin/env -S deno run
// Terminal decision for EnterWorktree's `path` argument. permissions.allow
// grants the bare "EnterWorktree" tool name with no argument constraint, so
// without this hook any path — absolute, `~`-relative, or traversal — is
// auto-approved. Mirrors claude-command-gate.ts's allow/deny shape, scoped to
// just this one argument. Decision logic lives in worktree-path-decision.ts
// so it can be unit-tested directly without spawning this script.
//
// `name`-based worktree creation (no `path` key) is out of scope — the tool
// always creates under .claude/worktrees/ itself and validates `name`'s
// character set on its own.
import { decideWorktreePath } from './worktree-path-decision.ts'

const raw = await new Response(Deno.stdin.readable).text()

try {
  const payload = JSON.parse(raw)
  const targetPath: string = payload?.tool_input?.path ?? ''

  if (targetPath === '') {
    Deno.exit(0)
  }

  const { decision, reason } = decideWorktreePath(targetPath)
  const text = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: decision,
      permissionDecisionReason: reason,
    },
  })
  Deno.stdout.writeSync(new TextEncoder().encode(text))
} catch (error) {
  const text = JSON.stringify({
    hookSpecificOutput: {
      hookEventName: 'PreToolUse',
      permissionDecision: 'deny',
      permissionDecisionReason:
        `worktree-path-gate failed to classify this path: ${
          (error as Error).message
        }. Report this to the maintainer — it is a gate bug, not a bad path.`,
    },
  })
  Deno.stdout.writeSync(new TextEncoder().encode(text))
}
