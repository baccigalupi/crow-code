import { describe, expect, it, spyOn } from 'bun:test'
import { defaultRuntime, Runtime } from '../../src/application-data/runtime.ts'

describe('runtime', () => {
  it('returns the runtime arguments', () => {
    const runtime = new Runtime(process)

    const args = runtime.args()

    expect(args).toEqual(process.argv.slice(2))
  })

  it('runs a command and decodes its output', async () => {
    const runtime = new Runtime(process)

    const output = await runtime.runCommand('git', { args: ['--version'] })

    expect(output.success).toBe(true)
    expect(output.code).toBe(0)
    expect(output.stdout).toContain('git version')
  })

  it('when the command fails, decodes its stderr', async () => {
    const runtime = new Runtime(process)

    const output = await runtime.runCommand('git', {
      args: ['rev-parse', '--verify', 'no-such-ref-crow'],
    })

    expect(output.success).toBe(false)
    expect(output.code).toBe(128)
    expect(output.stderr).toContain('fatal')
  })

  it('exits through the process', () => {
    const exit = spyOn(process, 'exit').mockImplementation(() =>
      undefined as never
    )
    const runtime = new Runtime(process)

    runtime.exit(3)

    expect(exit).toHaveBeenNthCalledWith(1, 3)
    exit.mockRestore()
  })

  it('adds a signal listener through the process', () => {
    const on = spyOn(process, 'on').mockImplementation(() => process)
    const runtime = new Runtime(process)
    const handler = () => {}

    runtime.addSignalListener('SIGINT', handler)

    expect(on).toHaveBeenNthCalledWith(1, 'SIGINT', handler)
    on.mockRestore()
  })

  it('removes a signal listener through the process', () => {
    const off = spyOn(process, 'off').mockImplementation(() => process)
    const runtime = new Runtime(process)
    const handler = () => {}

    runtime.removeSignalListener('SIGTERM', handler)

    expect(off).toHaveBeenNthCalledWith(1, 'SIGTERM', handler)
    off.mockRestore()
  })

  it('returns the process environment as a record', () => {
    const runtime = new Runtime(process)

    const env = runtime.env()

    expect(env.PATH).toBe(process.env.PATH)
  })

  it('when no working directory is given, returns the process working directory', () => {
    const runtime = new Runtime(process)

    const cwd = runtime.cwd

    expect(cwd).toBe(process.cwd())
  })

  it('when a working directory is given, returns it', () => {
    const runtime = new Runtime(process, '/somewhere')

    const cwd = runtime.cwd

    expect(cwd).toBe('/somewhere')
  })

  it('when built by default, uses the process', () => {
    const runtime = defaultRuntime()

    const args = runtime.args()

    expect(args).toEqual(process.argv.slice(2))
    expect(runtime.cwd).toBe(process.cwd())
  })
})
