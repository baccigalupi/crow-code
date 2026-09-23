import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { Help } from '../../../src/cli/commands/help.ts'

describe('Help', () => {
  it('when run, writes the usage text', () => {
    const consoleLog = mock.fn()
    const help = new Help(consoleLog)

    help.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
  })
})
