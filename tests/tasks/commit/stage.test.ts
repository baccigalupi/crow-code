import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { assertSpyCall, spy } from '@std/testing/mock'
import { ApplicationData } from '../../../src/application-data.ts'
import { stageAndCommit } from '../../../src/tasks/commit/stage.ts'
import { pathPermissions } from '../../../src/application-data/path-permissions.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'

describe('stageAndCommit', () => {
  it('when add and commit succeed, returns true and runs both', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: ['', ''],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['add', '--', 'src/a.ts'] }],
    })
    assertSpyCall(commandSpy, 1, {
      args: [
        'git',
        { args: ['commit', '-m', 'Subject\n\nBody.', '--', 'src/a.ts'] },
      ],
    })
    expect(staged.success()).toBe(true)
  })

  it('when files are omitted, adds all changes and commits', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: ['', ''],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { message: 'Subject\n\nBody.' },
    }).run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['add', '--all'] }],
    })
    assertSpyCall(commandSpy, 1, {
      args: ['git', { args: ['commit', '-m', 'Subject\n\nBody.'] }],
    })
    expect(staged.success()).toBe(true)
  })

  it('when add fails, returns false without committing', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: [new Error('add failed')],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy.calls.length).toBe(1)
    expect(staged.success()).toBe(false)
  })

  it('when commit fails, returns false', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: ['', new Error('commit failed')],
      }),
    })

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy.calls.length).toBe(2)
    expect(staged.success()).toBe(false)
  })

  it('when a file is outside the repository, fails before staging', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
      gitPathPermissions: pathPermissions({
        applicationData: new ApplicationData(),
        allowedDirectories: [join(fixturesDirectory, 'tools', 'git')],
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const staged = await stageAndCommit({
      applicationData,
      operationArguments: { files: ['src/a.ts'], message: 'Subject\n\nBody.' },
    }).run()

    expect(commandSpy.calls.length).toBe(0)
    expect(staged.success()).toBe(false)
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git add: path not allowed: src/a.ts',
    )
  })
})
