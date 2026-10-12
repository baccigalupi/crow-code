import { describe, it, mock } from 'node:test'
import { expect } from '@std/expect'
import { Command, command } from '../../../src/cli/commands/command.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('Command', () => {
  it('when constructed, exposes the parsed commands to subclasses', () => {
    class FirstCommand extends Command {
      isMatch() {
        return this.commands[0] === 'first'
      }

      run() {
        return Promise.resolve(this)
      }
    }

    const first = command(
      FirstCommand,
      mockApplicationData({ args: ['first'] }),
    )

    expect(first.isMatch()).toBe(true)
  })

  it('when constructed, exposes the parsed options to subclasses', () => {
    class GoalCommand extends Command {
      isMatch() {
        return this.options.goal === 'ship'
      }

      run() {
        return Promise.resolve(this)
      }
    }

    const goal = command(
      GoalCommand,
      mockApplicationData({ args: ['--goal=ship'] }),
    )

    expect(goal.isMatch()).toBe(true)
  })

  it('when a command fails, reports the reason for the command word on stderr', async () => {
    const consoleError = mock.fn()
    class FailingCommand extends Command {
      isMatch() {
        return this.commands[0] === 'first'
      }

      run() {
        this.fail('no widgets')
        return Promise.resolve(this)
      }
    }
    const applicationData = mockApplicationData({
      args: ['first', 'arg'],
      consoleError,
    })
    const failing = command(FailingCommand, applicationData)

    await failing.run()
    failing.reportFailure()

    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: no widgets for first',
    )
  })

  it('when a command fails without a command word, names the command in words', async () => {
    const consoleError = mock.fn()
    class SilentFailure extends Command {
      isMatch() {
        return true
      }

      run() {
        this.fail('no widgets')
        return Promise.resolve(this)
      }
    }
    const failing = command(
      SilentFailure,
      mockApplicationData({ args: [], consoleError }),
    )

    await failing.run()
    failing.reportFailure()

    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: no widgets for silent failure',
    )
  })

  it('when constructed, exposes the application data to subclasses', async () => {
    const consoleLog = mock.fn()
    class Echo extends Command {
      isMatch() {
        return true
      }

      run() {
        this.applicationData.consoleLog()('echo')
        return Promise.resolve(this)
      }
    }
    const applicationData = mockApplicationData({ consoleLog })

    await command(Echo, applicationData).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('echo')
  })
})
