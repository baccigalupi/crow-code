import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitCommit } from '../../../src/tools/git/commit.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'

describe('gitCommit', () => {
  it('commits with the requested message', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout: 'committed', commandSpy }),
    })
    const commit = gitCommit({
      applicationData,
      taskArguments: { message: 'Add login' },
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
      taskArguments: { message: 'msg', paths: ['src/a.ts', 'src/b.ts'] },
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
      taskArguments: { message: 'Add login' },
    })

    await commit.run()

    expect(commit.success()).toBe(false)
    expect(commit.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe('Git error: commit failed')
  })
})
