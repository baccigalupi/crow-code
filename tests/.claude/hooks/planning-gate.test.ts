import { describe, expect, it } from 'bun:test'

describe('planning-gate', () => {
  it('when a plan file is written without planning loaded, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { file_path: '/Users/kane/.claude/plans/alp.12-thing.md' },
      transcript_path:
        'tests/support/fixtures/hooks/transcript-without-planning.jsonl',
    })

    const child = Bun.spawn(['.claude/hooks/planning-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the file is not a plan file, prints nothing', async () => {
    const payload = JSON.stringify({
      tool_input: { file_path: 'src/tui/install/steps/done.ts' },
      transcript_path:
        'tests/support/fixtures/hooks/transcript-without-planning.jsonl',
    })

    const child = Bun.spawn(['.claude/hooks/planning-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const stdout = await new Response(child.stdout).text()

    expect(stdout).toBe('')
  })
})
