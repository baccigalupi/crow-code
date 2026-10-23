import { describe, expect, it } from 'bun:test'
import { tuiRendererConfig } from '../../../src/tui/runner/tui-renderer-config.ts'
import { mockStdin, mockStdout } from '../../support/mock-streams.ts'

describe('tuiRendererConfig', () => {
  it('when given io, passes stdin and stdout through', () => {
    const stdin = mockStdin()
    const stdout = mockStdout()

    const config = tuiRendererConfig({ stdin, stdout })

    expect(config.stdin).toBe(stdin)
    expect(config.stdout).toBe(stdout)
  })

  it('when given io, disables ctrl-c and signal exits', () => {
    const io = {}

    const config = tuiRendererConfig(io)

    expect(config.exitOnCtrlC).toBe(false)
    expect(config.exitSignals).toEqual([])
  })
})
