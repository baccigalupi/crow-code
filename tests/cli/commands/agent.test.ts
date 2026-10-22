import { describe, expect, it, mock } from 'bun:test'
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

  it('when run, logs that the agent TUI is coming soon', async () => {
    const consoleLog = mock()
    const applicationData = mockApplicationData({ args: [], consoleLog })
    const agent = new Agent({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await agent.run()

    expect(consoleLog.mock.calls[0][0]).toBe('Agent TUI app ... coming soon')
  })

  it('when run, exits with code 0', async () => {
    const applicationData = mockApplicationData({ args: [] })
    const agent = new Agent({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await agent.run()

    expect(agent.exitCode()).toBe(0)
  })
})
