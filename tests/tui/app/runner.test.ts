import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { runReplTui } from '../../../src/tui/app/runner.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockTerminal } from '../../support/mock-terminal.ts'

describe('runReplTui', () => {
  it('when ctrl-c is written to stdin, status resolves completed', async () => {
    const terminal = mockTerminal({})
    const runner = runReplTui(mockApplicationData(), terminal.io)

    const pending = runner.status()
    await new Promise((resolve) => setTimeout(resolve, 0))
    terminal.stdin.write('\x03')

    expect(await pending).toBe('completed')
  })
})
