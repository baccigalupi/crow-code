import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { assertSpyCall, spy } from '@std/testing/mock'
import { ApplicationData } from '../../../src/application-data.ts'
import { gitCommit } from '../../../src/tools/git/commit.ts'
import { pathPermissions } from '../../../src/application-data/path-permissions.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'

describe('gitCommit', () => {
  it('commits with the requested message', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout: 'committed', commandSpy }),
    })
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'Add login' },
    })

    await commit.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['commit', '-m', 'Add login'] }],
    })
    expect(commit.success()).toBe(true)
    expect(commit.result()).toBe('committed')
  })

  it('when paths are given, commits only those paths', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout: 'committed', commandSpy }),
    })
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'msg', paths: ['src/a.ts', 'src/b.ts'] },
    })

    await commit.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['commit', '-m', 'msg', '--', 'src/a.ts', 'src/b.ts'] },
      ],
    })
    expect(commit.success()).toBe(true)
    expect(commit.result()).toBe('committed')
  })

  it('when git fails, reports failure', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ success: false, stderr: 'commit failed' }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'Add login' },
    })

    await commit.run()

    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe('Git commit: commit failed')
  })

  it('when a path is outside the repository, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
      gitPathPermissions: pathPermissions({
        applicationData: new ApplicationData(),
        allowedDirectories: [join(fixturesDirectory, 'tools', 'git')],
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'msg', paths: ['src/a.ts'] },
    })

    await commit.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git commit: path not allowed: src/a.ts',
    )
  })

  it('when a path uses git pathspec magic, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'msg', paths: [':/'] },
    })

    await commit.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git commit: path not allowed: :/',
    )
  })
})
