import { describe, expect, it } from 'bun:test'

describe('agents/check-coverage', () => {
  it('when a file is fully covered, passes', async () => {
    const command = [
      'agents/check-coverage',
      'tests/support/fixtures/check-coverage/full.info',
    ]

    const child = Bun.spawn(command)

    expect(await child.exited).toBe(0)
  })

  it('when a file has no BRF line, fails naming it', async () => {
    const command = [
      'agents/check-coverage',
      'tests/support/fixtures/check-coverage/missing-branches.info',
    ]

    const child = Bun.spawn(command, { stdout: 'pipe' })
    const stdout = await new Response(child.stdout).text()

    expect(await child.exited).toBe(1)
    expect(stdout).toContain('FAIL: src/b.ts has no branch data')
  })

  it('when a tests/ file has no BRF line, ignores it', async () => {
    const command = [
      'agents/check-coverage',
      'tests/support/fixtures/check-coverage/test-file-missing-branches.info',
    ]

    const child = Bun.spawn(command)

    expect(await child.exited).toBe(0)
  })

  it('when branches are under 95 percent, fails naming the file', async () => {
    const command = [
      'agents/check-coverage',
      'tests/support/fixtures/check-coverage/low-branches.info',
    ]

    const child = Bun.spawn(command, { stdout: 'pipe' })
    const stdout = await new Response(child.stdout).text()

    expect(await child.exited).toBe(1)
    expect(stdout).toContain('FAIL: src/a.ts branches coverage 75% < 95%')
  })
})
