import { describe, expect, it } from 'bun:test'

describe('claude-command-gate', () => {
  it('when the command is an approved dev script, allows it', async () => {
    const payload = JSON.stringify({ tool_input: { command: 'dev/test' } })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when CLAUDE_PROJECT_DIR has no allowlist, still allows an approved dev script', async () => {
    const payload = JSON.stringify({ tool_input: { command: 'dev/test' } })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      env: {
        ...process.env,
        CLAUDE_PROJECT_DIR: 'tests/support/fixtures/missing-project',
      },
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when the command is a read-only inspector absent from .devin/config.json, allows it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'grep -rn "foo" src' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has a pipe character inside quotes, allows it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'grep -E "foo|bar" src/types.ts' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has a pipe character inside single quotes, allows it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: "grep -F 'foo|bar' src/types.ts" },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has an escaped quote inside double quotes, allows it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'grep -E "foo\\"bar" src/types.ts' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has a live, unquoted backtick, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'cat `whoami`' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when a read-only inspector has a live, unquoted command substitution, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'cat $(whoami)' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the payload is malformed JSON, denies it and reports a gate bug', async () => {
    const payload = 'not json'

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'failed to classify',
    )
  })

  it('when a read-only inspector has a live, unquoted pipe, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'cat src/types.ts | rm -rf /' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the command is a literal multiline git commit, allows it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'git commit -m "subject\n\nbody"' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when the command is bare deno, denies it and names the substitute', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'deno test tests/foo.test.ts' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'dev/test',
    )
  })

  it('when the command is cd, denies it and points at EnterWorktree, not a workdir parameter', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'cd .worktrees/foo && dev/test' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'EnterWorktree',
    )
  })

  it('when git push is attempted, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'git push origin main' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when dev/test is backgrounded, denies it to protect the shared coverage directory', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'dev/test', run_in_background: true },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'coverage',
    )
  })

  it('when the command is bare bun test, denies it and names dev/test', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'bun test tests/foo.test.ts' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toBe(
      'Blocked: run `dev/test` instead. Run the approved command now, do not retry variants, and do not end your turn.',
    )
  })

  it('when the command is bun run, denies it and names dev/test', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'bun run lint' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toBe(
      'Blocked: run `dev/test` instead. Run the approved command now, do not retry variants, and do not end your turn.',
    )
  })

  it('when the command is deno doc, denies it', async () => {
    const payload = JSON.stringify({
      tool_input: { command: 'deno doc src/cli.ts' },
    })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the command is bun install, allows it', async () => {
    const payload = JSON.stringify({ tool_input: { command: 'bun install' } })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when the command is empty, denies it', async () => {
    const payload = JSON.stringify({ tool_input: { command: '' } })

    const child = Bun.spawn(['.claude/hooks/claude-command-gate.ts'], {
      stdin: new Response(payload),
      stdout: 'pipe',
    })
    const result = JSON.parse(await new Response(child.stdout).text())

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })
})
