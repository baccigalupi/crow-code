import { describe, it } from 'node:test'
import { expect } from '@std/expect'

const config = Deno.readTextFileSync('tests/support/fixtures/devin-config.json')

describe('block-random-execs', () => {
  it('when command is a literal multiline git commit, prints nothing', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    Deno.mkdirSync(`${projectDirectory}/.devin`)
    Deno.writeTextFileSync(`${projectDirectory}/.devin/config.json`, config)

    const payload = JSON.stringify({
      tool_name: 'exec',
      tool_input: { command: 'git commit -m "subject\n\nbody"' },
    })

    const command = new Deno.Command('deno', {
      args: [
        'run',
        '--allow-env',
        '--allow-read',
        'agents/block-random-execs.ts',
      ],
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

  it('when command contains command substitution, prints a block decision', async () => {
    const projectDirectory = Deno.makeTempDirSync()
    Deno.mkdirSync(`${projectDirectory}/.devin`)
    Deno.writeTextFileSync(`${projectDirectory}/.devin/config.json`, config)

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
        'agents/block-random-execs.ts',
      ],
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
})
