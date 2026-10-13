import { describe, it } from 'node:test'
import { expect } from '@std/expect'

describe('claude-command-gate', () => {
  it('when the command is an approved dev script, allows it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({ tool_input: { command: 'dev/test' } })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when the command is a read-only inspector absent from .devin/config.json, allows it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'grep -rn "foo" src' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has a pipe character inside quotes, allows it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'grep -E "foo|bar" src/types.ts' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has a pipe character inside single quotes, allows it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: "grep -F 'foo|bar' src/types.ts" },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has an escaped quote inside double quotes, allows it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'grep -E "foo\\"bar" src/types.ts' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when a read-only inspector has a live, unquoted backtick, denies it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'cat `whoami`' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when a read-only inspector has a live, unquoted command substitution, denies it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'cat $(whoami)' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the payload is malformed JSON, denies it and reports a gate bug', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = 'not json'

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'failed to classify',
    )
  })

  it('when a read-only inspector has a live, unquoted pipe, denies it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'cat src/types.ts | rm -rf /' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when the command is a literal multiline git commit, allows it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'git commit -m "subject\n\nbody"' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('allow')
  })

  it('when the command is bare deno, denies it and names the substitute', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'deno test tests/foo.test.ts' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'dev/test',
    )
  })

  it('when the command is cd, denies it and points at EnterWorktree, not a workdir parameter', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'cd .worktrees/foo && dev/test' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'EnterWorktree',
    )
  })

  it('when git push is attempted, denies it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'git push origin main' },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })

  it('when dev/test is backgrounded, denies it to protect the shared coverage directory', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_input: { command: 'dev/test', run_in_background: true },
    })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
    expect(result.hookSpecificOutput.permissionDecisionReason).toContain(
      'coverage',
    )
  })

  it('when the command is empty, denies it', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({ tool_input: { command: '' } })

    const command = new Deno.Command('.claude/hooks/claude-command-gate.ts', {
      env: { CLAUDE_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const result = JSON.parse(new TextDecoder().decode(output.stdout))

    expect(result.hookSpecificOutput.permissionDecision).toBe('deny')
  })
})
