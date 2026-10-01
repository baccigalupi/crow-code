import { describe, it } from 'node:test'
import { expect } from '@std/expect'

describe('stop-after-blocked-tool', () => {
  it('when a recovery marker exists, prints a block decision', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/stop-after-blocked-tool/marker-exists'
    const payload = JSON.stringify({
      session_id: 'one',
      prompt_id: 'first',
    })

    const command = new Deno.Command(
      './agents/hooks/stop-after-blocked-tool.ts',
      {
        env: { DEVIN_PROJECT_DIR: projectDirectory },
        stdin: 'piped',
        stdout: 'piped',
        stderr: 'piped',
      },
    )
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toContain('"decision":"block"')
  })

  it('when no marker exists, prints nothing', async () => {
    const projectDirectory =
      'tests/support/fixtures/hook-project/stop-after-blocked-tool/no-marker'
    const payload = JSON.stringify({
      session_id: 'one',
      prompt_id: 'first',
    })

    const command = new Deno.Command(
      './agents/hooks/stop-after-blocked-tool.ts',
      {
        env: { DEVIN_PROJECT_DIR: projectDirectory },
        stdin: 'piped',
        stdout: 'piped',
        stderr: 'piped',
      },
    )
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    await writer.write(new TextEncoder().encode(payload))
    await writer.close()
    const output = await process.output()
    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toBe('')
  })

  it('when reading hooks config, a Stop entry runs the script', () => {
    const hooks = JSON.parse(Deno.readTextFileSync('.devin/hooks.v1.json'))

    const command = hooks.Stop[0].hooks[0].command

    expect(command).toBe(
      '"$DEVIN_PROJECT_DIR/agents/hooks/stop-after-blocked-tool.ts"',
    )
  })
})
