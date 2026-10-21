import { describe, expect, it } from 'bun:test'
import { runAgentTui } from '../../../src/tui/agent/runner.ts'
import { ChatSession } from '../../../src/tui/agent/interactions/state/chat-session.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockTerminal } from '../../support/mock-terminal.ts'

describe('runAgentTui', () => {
  it('when ctrl-c is written to stdin, status resolves completed', async () => {
    const terminal = mockTerminal({})
    const runner = runAgentTui(mockApplicationData(), terminal.io)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')

    expect(await pending).toBe('completed')
  })

  it('when given chat state, typed keys edit that state', async () => {
    const terminal = mockTerminal({})
    const chatState = new ChatSession(80)
    const runner = runAgentTui(mockApplicationData(), terminal.io, chatState)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('x')
    terminal.stdin.write('\x03')
    await pending

    expect(chatState.buffer.peek().text).toBe('x')
  })
})
