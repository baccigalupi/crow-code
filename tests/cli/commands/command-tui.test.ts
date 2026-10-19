import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { CommandTui } from '../../../src/cli/commands/command-tui.ts'
import type { RunTui } from '../../../src/cli/types.ts'
import type { ReplStatus } from '../../../src/tui/types.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('CommandTui', () => {
  it('when run, starts the tui with the application data and waits for its status', async () => {
    const status = spy(() => Promise.resolve('completed' as ReplStatus))
    const runTui = spy(() => ({ status }))
    class FakeTui extends CommandTui {
      protected runTui: RunTui = runTui

      isMatch() {
        return true
      }
    }
    const applicationData = mockApplicationData()
    const tui = new FakeTui({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await tui.run()

    expect(runTui.calls[0].args).toEqual([applicationData])
    expect(status.calls.length).toBe(1)
  })

  it('when the tui completes, exits 0', async () => {
    class CompletedTui extends CommandTui {
      protected runTui: RunTui = () => ({
        status: () => Promise.resolve('completed'),
      })

      isMatch() {
        return true
      }
    }
    const applicationData = mockApplicationData()
    const tui = new CompletedTui({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await tui.run()

    expect([tui.success(), tui.exitCode()]).toEqual([true, 0])
  })

  it('when the tui is interrupted, exits 1 without failing', async () => {
    class InterruptedTui extends CommandTui {
      protected runTui: RunTui = () => ({
        status: () => Promise.resolve('interrupted'),
      })

      isMatch() {
        return true
      }
    }
    const applicationData = mockApplicationData()
    const tui = new InterruptedTui({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await tui.run()

    expect([tui.success(), tui.exitCode()]).toEqual([true, 1])
  })
})
