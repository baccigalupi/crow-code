import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { recoveryPending } from '../../../agents/hooks/recovery-state.ts'
import { clearDirectory } from '../../support/fixtures.ts'

describe('block-random-execs', () => {
  it('when command is a literal multiline git commit, prints nothing', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_name: 'exec',
      tool_input: { command: 'git commit -m "subject\n\nbody"' },
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/block-random-execs.ts',
      ],
      env: { DEVIN_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toBe('')
  })

  it('when command contains command substitution, prints a block decision', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_name: 'exec',
      tool_input: {
        command: `git commit -m "$(cat <<'EOF'\nbody\nEOF\n)"`,
      },
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/block-random-execs.ts',
      ],
      env: { DEVIN_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toContain('"decision":"block"')
  })

  it('when a denied payload carries ids, records a recovery marker', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs-recovery'
    const payload = JSON.stringify({
      session_id: 'one',
      prompt_id: 'first',
      tool_name: 'exec',
      tool_input: { command: 'echo hello' },
    })

    const command = new Deno.Command('./agents/hooks/block-random-execs.ts', {
      env: { DEVIN_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    await process.output()
    const exists = await recoveryPending(projectDirectory, 'one', 'first')
    await clearDirectory(`${projectDirectory}/.devin/state`)

    expect(exists).toBe(true)
  })

  it('when a recognized guess is blocked, the reason names the approved script', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/block-random-execs'
    const payload = JSON.stringify({
      tool_name: 'exec',
      tool_input: { command: 'deno test tests/foo.test.ts' },
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/block-random-execs.ts',
      ],
      env: { DEVIN_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toContain('"decision":"block"')
    expect(stdout).toContain('dev/test')
  })
})
