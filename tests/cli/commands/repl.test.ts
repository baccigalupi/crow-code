import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { Repl } from '../../../src/cli/commands/repl.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Repl', () => {
  it('when no arguments are passed, matches', () => {
    const applicationData = mockApplicationData({ args: [] })

    const repl = new Repl({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(repl.isMatch()).toBe(true)
  })

  it('when a command is passed, does not match', () => {
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
    })

    const repl = new Repl({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(repl.isMatch()).toBe(false)
  })

  it('when an option is passed, does not match', () => {
    const applicationData = mockApplicationData({ args: ['--unknown'] })

    const repl = new Repl({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    expect(repl.isMatch()).toBe(false)
  })
})
