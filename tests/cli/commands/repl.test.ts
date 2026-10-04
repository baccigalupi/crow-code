import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { stub } from '@std/testing/mock'
import { Repl } from '../../../src/cli/commands/repl.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Repl', () => {
  it('when no arguments are passed, matches', () => {
    const applicationData = mockApplicationData({ args: [] })

    const command = new Repl(applicationData)

    expect(command.isMatch()).toBe(true)
  })

  it('when a command is passed, does not match', () => {
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
    })

    const command = new Repl(applicationData)

    expect(command.isMatch()).toBe(false)
  })

  it('when an option is passed, does not match', () => {
    const applicationData = mockApplicationData({ args: ['--unknown'] })

    const command = new Repl(applicationData)

    expect(command.isMatch()).toBe(false)
  })

  it('creates and runs the repl runner', async () => {
    const command = new Repl(mockApplicationData())
    const runner = command.runner()
    using runStub = stub(runner, 'run', async () => {})
    using runnerStub = stub(command, 'runner', () => runner)

    await command.run()

    expect([runnerStub.calls.length, runStub.calls.length]).toEqual([1, 1])
  })
})
