import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { Help } from '../../../src/cli/commands/help.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Help', () => {
  it('when any arguments are passed, matches', () => {
    const applicationData = mockApplicationData({ args: ['unknown'] })

    const command = new Help(applicationData)

    expect(command.isMatch()).toBe(true)
  })

  it('when run, writes the usage text', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['--help'],
      consoleLog,
    })
    const command = new Help(applicationData)

    await command.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toContain(
      'Usage: crow <command>',
    )
    expect(consoleLog.mock.calls[0].arguments[0]).toContain('add-provider')
  })
})
