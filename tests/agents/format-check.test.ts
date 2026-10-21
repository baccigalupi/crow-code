import { describe, expect, it } from 'bun:test'

describe('agents/format-check', () => {
  it('reports a file that violates the style', async () => {
    const command = ['agents/format-check', '--ignore-path', '/dev/null']
    command.push('tests/support/fixtures/format-check/violating')

    const child = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' })
    const output = await new Response(child.stdout).text()

    expect(await child.exited).toBe(1)
    expect(output + (await new Response(child.stderr).text())).toContain(
      'violating.ts',
    )
  })

  it('passes a file that follows the style', async () => {
    const command = [
      'agents/format-check',
      'tests/support/fixtures/format-check/conforming',
    ]

    const child = Bun.spawn(command, { stdout: 'pipe', stderr: 'pipe' })
    const output = await new Response(child.stdout).text()

    expect(await child.exited).toBe(0)
    expect(output + (await new Response(child.stderr).text())).toContain(
      'All matched files use Prettier code style!',
    )
  })

  it('repo is formatted', async () => {
    const command = ['agents/format-check']

    const child = Bun.spawn(command)

    expect(await child.exited).toBe(0)
  })
})
