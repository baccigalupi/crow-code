import { describe, expect, it } from 'bun:test'
import { tuiRendererConfig } from '../../../src/opentui/runner/tui-renderer-config.ts'

describe('tuiRendererConfig', () => {
  it('when given io, passes stdin and stdout through', () => {
    const stdin = {} as NodeJS.ReadStream
    const stdout = {} as NodeJS.WriteStream

    const config = tuiRendererConfig({ stdin, stdout })

    expect(config.stdin).toBe(stdin)
    expect(config.stdout).toBe(stdout)
  })

  it('when given io, disables ctrl-c and signal exits', () => {
    const io = {} as never

    const config = tuiRendererConfig(io)

    expect(config.exitOnCtrlC).toBe(false)
    expect(config.exitSignals).toEqual([])
  })
})
