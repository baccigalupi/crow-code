import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Install } from '../../../src/cli/commands/install.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Install', () => {
  it('when the command is install, matches', () => {
    const applicationData = mockApplicationData({ args: ['install'] })

    const install = new Install({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(install.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['add-provider'] })

    const install = new Install({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(install.isMatch()).toBe(false)
  })

  it('when no arguments are passed, does not match', () => {
    const applicationData = mockApplicationData({ args: [] })

    const install = new Install({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(install.isMatch()).toBe(false)
  })
})
