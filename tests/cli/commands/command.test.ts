import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { Command } from '../../../src/cli/commands/command.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Command', () => {
  it('when constructed, exposes the parsed commands to subclasses', () => {
    class FirstCommand extends Command {
      isMatch() {
        return this.commands[0] === 'first'
      }

      run() {
        return Promise.resolve()
      }
    }

    const command = new FirstCommand(mockApplicationData({ args: ['first'] }))

    expect(command.isMatch()).toBe(true)
  })

  it('when constructed, exposes the parsed options to subclasses', () => {
    class GoalCommand extends Command {
      isMatch() {
        return this.options.goal === 'ship'
      }

      run() {
        return Promise.resolve()
      }
    }

    const command = new GoalCommand(
      mockApplicationData({ args: ['--goal=ship'] }),
    )

    expect(command.isMatch()).toBe(true)
  })

  it('when constructed, exposes the application data to subclasses', async () => {
    const consoleLog = mock.fn()
    class EchoDirectory extends Command {
      isMatch() {
        return true
      }

      run() {
        this.applicationData.consoleLog()(this.applicationData.crowDirectory())
        return Promise.resolve()
      }
    }
    const applicationData = mockApplicationData({
      crowDirectory: '/tmp/crow',
      consoleLog,
    })

    await new EchoDirectory(applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('/tmp/crow')
  })
})
