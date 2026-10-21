import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { gitCommit } from '../../../../src/tools/git/mutations/commit.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockCommand } from '../../../support/mock-command.ts'

describe('gitCommit', () => {
  it('commits with the requested message', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'committed', commandSpy }),
    })
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'Add login' },
    })

    await commit.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['commit', '-m', 'Add login'],
    })
    expect(commit.success()).toBe(true)
    expect(commit.result()).toBe('committed')
  })

  it('when paths are given, commits only those paths', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: 'committed', commandSpy }),
    })
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'msg', paths: ['src/a.ts', 'src/b.ts'] },
    })

    await commit.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['commit', '-m', 'msg', '--', 'src/a.ts', 'src/b.ts'],
    })
    expect(commit.success()).toBe(true)
    expect(commit.result()).toBe('committed')
  })

  it('when git fails, reports failure', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ success: false, stderr: 'commit failed' }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'Add login' },
    })

    await commit.run()

    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe('Git commit: commit failed')
  })

  it('when a path is outside the repository, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-git-commit.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'msg', paths: [path] },
    })

    await commit.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git commit: path not allowed: ${path}`,
    )
  })

  it('when a path uses git pathspec magic, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const commit = gitCommit({
      applicationData,
      operationArguments: { message: 'msg', paths: [':/'] },
    })

    await commit.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git commit: path not allowed: :/',
    )
  })
})
