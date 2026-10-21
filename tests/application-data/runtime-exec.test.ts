import { describe, expect, it } from 'bun:test'
import { runtimeExec } from '../../src/application-data/runtime-exec.ts'

describe('runtimeExec', () => {
  it('returns the code and output of a successful command', async () => {
    const options = { args: ['--version'] }

    const output = await runtimeExec('git', options)

    expect(output).toEqual({
      success: true,
      code: 0,
      stdout: expect.stringMatching(/^git version/),
      stderr: '',
    })
  })

  it('returns the code and stderr of a failed command', async () => {
    const options = { args: ['no-such-subcommand'] }

    const output = await runtimeExec('git', options)

    expect(output.success).toBe(false)
    expect(output.code).not.toBe(0)
    expect(output.stderr).toContain('no-such-subcommand')
  })
})
