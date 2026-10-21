import { describe, expect, it, mock, spyOn } from 'bun:test'
import { createTuiRunner } from '../../src/tui/tui-runner.ts'
import { Agent } from '../../src/tui/agent/views/agent.tsx'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockTerminal } from '../support/mock-terminal.ts'

describe('tui-runner', () => {
  it('when ctrl-c is written to stdin, status resolves completed', async () => {
    const terminal = mockTerminal({})
    const runner = createTuiRunner(mockApplicationData(), terminal.io, Agent)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')

    expect(await pending).toBe('completed')
  })

  it('when stdin cannot set raw mode, status resolves interrupted since Ink requires it for user input', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const runner = createTuiRunner(mockApplicationData(), terminal.io, Agent)

    const status = await runner.status()

    expect(status).toBe('interrupted')
  })

  it('when the app runs to completion, its signal listeners are removed', async () => {
    const terminal = mockTerminal({})
    const applicationData = mockApplicationData()
    const runner = createTuiRunner(applicationData, terminal.io, Agent)
    const remove = spyOn(applicationData.runtime, 'removeSignalListener')

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')
    await pending

    expect(remove.mock.calls[0][0]).toEqual('SIGINT')
    expect(remove.mock.calls[1][0]).toEqual('SIGTERM')
  })

  it('when interrupted, unmounts and resolves interrupted', async () => {
    const terminal = mockTerminal({})
    const runner = createTuiRunner(mockApplicationData(), terminal.io, Agent)

    const status = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    runner.interrupt()

    expect(await status).toBe('interrupted')
  })

  it('when the app fails, writes the error to stderr and resolves interrupted', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const runner = createTuiRunner(mockApplicationData(), terminal.io, Agent)
    const write = spyOn(terminal.stderr, 'write')

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(String(write.mock.calls[0][0])).toContain(
      'setRawMode is not a function',
    )
  })

  it('when no stderr is provided, writes the error through the console error', async () => {
    const terminal = mockTerminal({ rawMode: false })
    const consoleError = mock()
    const applicationData = mockApplicationData({ consoleError })
    const runner = createTuiRunner(
      applicationData,
      {
        stdin: terminal.io.stdin,
        stdout: terminal.io.stdout,
      },
      Agent,
    )

    const status = await runner.status()

    expect(status).toBe('interrupted')
    expect(String(consoleError.mock.calls[0][0])).toContain(
      'setRawMode is not a function',
    )
  })
})
