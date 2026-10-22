import { describe, expect, it } from 'bun:test'

describe('worktree-path-gate', () => {
  it('when the path is absolute, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { path: '/Users/kane/elsewhere' },
    })

    const child = Bun.spawn(['.claude/hooks/worktree-path-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the payload has no path, prints nothing', async () => {
    const payload = JSON.stringify({ tool_input: {} })

    const child = Bun.spawn(['.claude/hooks/worktree-path-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const stdout = await new Response(child.stdout).text()

    expect(stdout).toBe('')
  })
})
