import { describe, it } from 'node:test'
import { expect } from '@std/expect'

describe('dependency-lookup-context', () => {
  it('when the prompt mentions an exotui API, injects routing context', async () => {
    const payload = JSON.stringify({
      prompt: 'how do I make a TextBox scroll in exotui?',
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/dependency-lookup-context.ts',
      ],
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

    expect(stdout).toContain('UserPromptSubmit')
    expect(stdout).toContain('exotui')
    expect(stdout).toContain('.deps/')
  })

  it('when the prompt mentions a Deno API, injects routing context', async () => {
    const payload = JSON.stringify({
      prompt: 'does Deno.readTextFile need permissions here?',
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/dependency-lookup-context.ts',
      ],
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

    expect(stdout).toContain('deno')
  })

  it('when the prompt mentions a @std import, injects routing context', async () => {
    const payload = JSON.stringify({
      prompt: 'should I use @std/fs walk or a manual loop?',
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/dependency-lookup-context.ts',
      ],
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

    expect(stdout).toContain('deno-std')
  })

  it('when the prompt is unrelated, prints nothing', async () => {
    const payload = JSON.stringify({
      prompt: 'write a migration for the providers table',
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/dependency-lookup-context.ts',
      ],
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

  it('when the payload has no prompt, prints nothing', async () => {
    const payload = JSON.stringify({ tool_name: 'exec', prompt: 42 })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/hooks/dependency-lookup-context.ts',
      ],
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
})
