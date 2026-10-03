import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { Version } from '../../../src/cli/commands/version.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Version', () => {
  it('when --version is passed, matches', () => {
    const applicationData = mockApplicationData({ args: ['--version'] })

    const command = new Version(applicationData)

    expect(command.isMatch()).toBe(true)
  })

  it('when -V is passed, matches', () => {
    const applicationData = mockApplicationData({ args: ['-V'] })

    const command = new Version(applicationData)

    expect(command.isMatch()).toBe(true)
  })

  it('when no version option is passed, does not match', () => {
    const applicationData = mockApplicationData({ args: [] })

    const command = new Version(applicationData)

    expect(command.isMatch()).toBe(false)
  })

  it('when run, writes the project version', async () => {
    const consoleLog = mock.fn()
    const applicationData = mockApplicationData({
      args: ['--version'],
      consoleLog,
    })
    const command = new Version(applicationData)

    await command.run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('crow 0.0.1')
  })
})
