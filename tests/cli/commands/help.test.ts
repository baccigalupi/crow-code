import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { command } from '../../../src/cli/commands/command.ts'
import { Help } from '../../../src/cli/commands/help.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Help', () => {
  it('when any arguments are passed, matches', () => {
    const applicationData = mockApplicationData({ args: ['unknown'] })

    const help = command(Help, applicationData)

    expect(help.isMatch()).toBe(true)
  })

  it('when run, writes the usage text', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['--help'],
      consoleLog,
    })
    const help = command(Help, applicationData)

    await help.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
    expect(consoleLog.mock.calls[0].arguments[0]).toContain('add-provider')
  })
})
