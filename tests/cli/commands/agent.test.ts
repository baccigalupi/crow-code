import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Agent } from '../../../src/cli/commands/agent.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Agent', () => {
  it('when no arguments are passed, matches', () => {
    const applicationData = mockApplicationData({ args: [] })

    const agent = new Agent({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(agent.isMatch()).toBe(true)
  })

  it('when a command is passed, does not match', () => {
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
    })

    const agent = new Agent({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(agent.isMatch()).toBe(false)
  })

  it('when an option is passed, does not match', () => {
    const applicationData = mockApplicationData({ args: ['--unknown'] })

    const agent = new Agent({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(agent.isMatch()).toBe(false)
  })
})
