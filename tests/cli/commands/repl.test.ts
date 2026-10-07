import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { stub } from '@std/testing/mock'
import { command } from '../../../src/cli/commands/command.ts'
import { Repl } from '../../../src/cli/commands/repl.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Repl', () => {
  it('when no arguments are passed, matches', () => {
    const applicationData = mockApplicationData({ args: [] })

    const repl = command(Repl, applicationData)

    expect(repl.isMatch()).toBe(true)
  })

  it('when a command is passed, does not match', () => {
    const applicationData = mockApplicationData({
      args: ['create-model-catalog'],
    })

    const repl = command(Repl, applicationData)

    expect(repl.isMatch()).toBe(false)
  })

  it('when an option is passed, does not match', () => {
    const applicationData = mockApplicationData({ args: ['--unknown'] })

    const repl = command(Repl, applicationData)

    expect(repl.isMatch()).toBe(false)
  })

  it('creates and runs the repl runner', async () => {
    const repl = command(Repl, mockApplicationData())
    const runner = repl.runner()
    using runStub = stub(runner, 'run', async () => {})
    using runnerStub = stub(repl, 'runner', () => runner)

    await repl.run()

    expect([runnerStub.calls.length, runStub.calls.length]).toEqual([1, 1])
  })
})
