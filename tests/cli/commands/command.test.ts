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
        return Promise.resolve(this)
      }
    }
    const applicationData = mockApplicationData({ args: ['first'] })

    const first = new FirstCommand({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

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
    const applicationData = mockApplicationData({ args: ['--goal=ship'] })

    const goal = new GoalCommand({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

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
    const failing = new FailingCommand({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

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
    const applicationData = mockApplicationData({ args: [], consoleError })
    const failing = new SilentFailure({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await failing.run()
    failing.reportFailure()

    expect(consoleError.mock.calls[0].arguments[0]).toBe(
      'Error: no widgets for silent failure',
    )
  })

  it('when a command succeeds, its exit code is 0', async () => {
    class Quiet extends Command {
      isMatch() {
        return true
      }

      run() {
        return Promise.resolve(this)
      }
    }
    const applicationData = mockApplicationData()
    const quiet = new Quiet({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await quiet.run()

    expect(quiet.exitCode()).toBe(0)
  })

  it('when a command fails, its exit code is 1', async () => {
    class Loud extends Command {
      isMatch() {
        return true
      }

      run() {
        this.fail('no widgets')
        return Promise.resolve(this)
      }
    }
    const applicationData = mockApplicationData()
    const loud = new Loud({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    })

    await loud.run()

    expect(loud.exitCode()).toBe(1)
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

    await new Echo({
      applicationData,
      operationArguments: applicationData.parsedArguments,
    }).run()

    expect(consoleLog.mock.calls[0].arguments[0]).toBe('echo')
  })
})
