#!/usr/bin/env -S deno run --allow-run --allow-read --allow-env
// Stop-hook gate: before the session is allowed to end, run the blocking
// style-check over whatever's actually changed. agents/style-check --changed
// already no-ops when nothing qualifies, so this is cheap to run unconditionally.
//
// stop_hook_active guards against relooping on our own block — Claude Code
// sets it true on the retry triggered by a previous `decision: "block"`.

const raw = await new Response(Deno.stdin.readable).text()

let stopHookActive = false
try {
  stopHookActive = JSON.parse(raw)?.stop_hook_active === true
} catch {
  // Malformed payload: fall through to running the check anyway.
}

if (stopHookActive) {
  Deno.exit(0)
}

const command = new Deno.Command('agents/style-check', {
  args: ['--changed'],
  stdout: 'piped',
  stderr: 'piped',
})
const result = await command.output()

if (result.success) {
  Deno.exit(0)
}

const output = new TextDecoder().decode(result.stdout) +
  new TextDecoder().decode(result.stderr)

const reason =
  `Changed files failed agents/style-check. Fix every violation before finishing.

${output}

Re-read AGENTS.md's TDD and Gates sections.`

Deno.stdout.writeSync(
  new TextEncoder().encode(JSON.stringify({ decision: 'block', reason })),
)
