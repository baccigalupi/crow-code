import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { defaultRuntime, Runtime } from '../../src/application-data/runtime.ts'

describe('runtime', () => {
  it('returns the runtime arguments', () => {
    const runtime = new Runtime(Deno)

    const args = runtime.args()

    expect(args).toBe(Deno.args)
  })

  it('runs a command and decodes its output', async () => {
    const runtime = new Runtime(Deno)

    const output = await runtime.runCommand('git', { args: ['--version'] })

    expect(output.success).toBe(true)
    expect(output.code).toBe(0)
    expect(output.stdout).toContain('git version')
  })

  it('when the command fails, decodes its stderr', async () => {
    const runtime = new Runtime(Deno)

    const output = await runtime.runCommand('git', {
      args: ['rev-parse', '--verify', 'no-such-ref-crow'],
    })

    expect(output.success).toBe(false)
    expect(output.code).toBe(128)
    expect(output.stderr).toContain('fatal')
  })

  it('exits through the runtime', () => {
    const exit = spy()
    const runtime = new Runtime({ ...Deno, exit } as unknown as typeof Deno)

    runtime.exit(3)

    assertSpyCall(exit, 0, { args: [3] })
  })

  it('adds a signal listener through the runtime', () => {
    const addSignalListener = spy()
    const runtime = new Runtime(
      { ...Deno, addSignalListener } as unknown as typeof Deno,
    )
    const handler = () => {}

    runtime.addSignalListener('SIGINT', handler)

    assertSpyCall(addSignalListener, 0, { args: ['SIGINT', handler] })
  })

  it('removes a signal listener through the runtime', () => {
    const removeSignalListener = spy()
    const runtime = new Runtime(
      { ...Deno, removeSignalListener } as unknown as typeof Deno,
    )
    const handler = () => {}

    runtime.removeSignalListener('SIGTERM', handler)

    assertSpyCall(removeSignalListener, 0, { args: ['SIGTERM', handler] })
  })

  it('returns the process environment as a record', () => {
    const runtime = new Runtime(Deno)

    const env = runtime.env()

    expect(env.PATH).toBe(Deno.env.get('PATH'))
  })

  it('when no working directory is given, returns the process working directory', () => {
    const runtime = new Runtime(Deno)

    const cwd = runtime.cwd

    expect(cwd).toBe(Deno.cwd())
  })

  it('when a working directory is given, returns it', () => {
    const runtime = new Runtime(Deno, '/somewhere')

    const cwd = runtime.cwd

    expect(cwd).toBe('/somewhere')
  })

  it('when built by default, uses the Deno global', () => {
    const runtime = defaultRuntime()

    const args = runtime.args()

    expect(args).toBe(Deno.args)
  })
})
