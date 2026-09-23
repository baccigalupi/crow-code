import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { recordRecovery } from '../../agents/hooks/recovery-state.ts'

describe('stop-after-blocked-tool', () => {
  it('when a recovery marker exists, prints a block decision', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    await recordRecovery(projectDirectory, 'one', 'first')

    const payload = JSON.stringify({
      session_id: 'one',
      prompt_id: 'first',
    })

    const command = new Deno.Command('./agents/stop-after-blocked-tool.ts', {
      env: { DEVIN_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    const encoder = new TextEncoder()
    await writer.write(encoder.encode(payload))
    await writer.close()
    const output = await process.output()

    Deno.removeSync(projectDirectory, { recursive: true })

    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toContain('"decision":"block"')
  })

  it('when no marker exists, prints nothing', async () => {
    const projectDirectory = Deno.makeTempDirSync()

    const payload = JSON.stringify({
      session_id: 'one',
      prompt_id: 'first',
    })

    const command = new Deno.Command('./agents/stop-after-blocked-tool.ts', {
      env: { DEVIN_PROJECT_DIR: projectDirectory },
      stdin: 'piped',
      stdout: 'piped',
      stderr: 'piped',
    })
    const process = command.spawn()
    const writer = process.stdin.getWriter()
    const encoder = new TextEncoder()
    await writer.write(encoder.encode(payload))
    await writer.close()
    const output = await process.output()

    Deno.removeSync(projectDirectory, { recursive: true })

    const stdout = new TextDecoder().decode(output.stdout)

    expect(stdout).toBe('')
  })

  it('when reading hooks config, a Stop entry runs the script', () => {
    const hooks = JSON.parse(Deno.readTextFileSync('.devin/hooks.v1.json'))

    const entries = hooks.Stop.flatMap((
      entry: { hooks: { command: string }[] },
    ) => entry.hooks.map((hook) => hook.command))

    expect(
      entries.some((command: string) =>
        command.includes('agents/stop-after-blocked-tool.ts')
      ),
    ).toBe(true)
  })
})
