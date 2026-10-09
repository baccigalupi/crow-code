import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { stub } from '@std/testing/mock'
import { command } from '../../../src/cli/commands/command.ts'
import { Install } from '../../../src/cli/commands/install.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Install', () => {
  it('when the command is install, matches', () => {
    const applicationData = mockApplicationData({ args: ['install'] })

    const install = command(Install, applicationData)

    expect(install.isMatch()).toBe(true)
  })

  it('when the command is something else, does not match', () => {
    const applicationData = mockApplicationData({ args: ['add-provider'] })

    const install = command(Install, applicationData)

    expect(install.isMatch()).toBe(false)
  })

  it('when no arguments are passed, does not match', () => {
    const applicationData = mockApplicationData({ args: [] })

    const install = command(Install, applicationData)

    expect(install.isMatch()).toBe(false)
  })

  it('creates and runs the install runner', async () => {
    const install = command(Install, mockApplicationData())
    const runner = install.runner()
    using runStub = stub(runner, 'run', async () => {})
    using runnerStub = stub(install, 'runner', () => runner)

    await install.run()

    expect([runnerStub.calls.length, runStub.calls.length]).toEqual([1, 1])
  })
})
