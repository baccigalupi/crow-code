import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { stageAndCommit } from '../../../src/tasks/commit/stage.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockCommand } from '../../support/mock-command.ts'

describe('stageAndCommit', () => {
  it('when add and commit succeed, returns true and runs both', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout: ['', ''],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy).toHaveBeenNthCalledWith(
      1,
      'git',
      expect.objectContaining({ args: ['add', '--', 'src/a.ts'] }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      2,
      'git',
      expect.objectContaining({
        args: ['commit', '-m', 'Subject\n\nBody.', '--', 'src/a.ts'],
      }),
    )
    expect(staged.success()).toBe(true)
  })

  it('when files are omitted, adds all changes and commits', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout: ['', ''],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy).toHaveBeenNthCalledWith(
      1,
      'git',
      expect.objectContaining({ args: ['add', '--all'] }),
    )
    expect(commandSpy).toHaveBeenNthCalledWith(
      2,
      'git',
      expect.objectContaining({ args: ['commit', '-m', 'Subject\n\nBody.'] }),
    )
    expect(staged.success()).toBe(true)
  })

  it('when add fails, returns false without committing', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout: [new Error('add failed')],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy.mock.calls.length).toBe(1)
    expect(staged.success()).toBe(false)
  })

  it('when commit fails, returns false', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout: ['', new Error('commit failed')],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy.mock.calls.length).toBe(2)
    expect(staged.success()).toBe(false)
  })

  it('when a file is outside the repository, fails before staging', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-stage-commit.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: [path], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(staged.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git add: path not allowed: ${path}`,
    )
  })
})
