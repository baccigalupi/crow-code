import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitRepositoryRoot } from '../../../src/application-data/allowed-paths/repository-root.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockCommand } from '../../support/mock-command.ts'

describe('gitRepositoryRoot', () => {
  it('returns the worktree root from git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy, stdout: '/some/repo\n' }),
      cwd: '/working/directory',
    })

    const root = gitRepositoryRoot({
      runtime: applicationData.runtime,
      logger: applicationData.logger(),
    })
    await root.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['rev-parse', '--show-toplevel'] }],
    })
    expect(root.success()).toBe(true)
    expect(root.result()).toBe('/some/repo')
  })

  it('when git prints nothing, falls back to the working directory', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout: '   \n' }),
      cwd: '/working/directory',
    })

    const root = gitRepositoryRoot({
      runtime: applicationData.runtime,
      logger: applicationData.logger(),
    })
    await root.run()

    expect(root.result()).toBe('/working/directory')
  })

  it('when git fails, falls back to the working directory', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
      cwd: '/working/directory',
    })

    const root = gitRepositoryRoot({
      runtime: applicationData.runtime,
      logger: applicationData.logger(),
    })
    await root.run()

    expect(root.success()).toBe(false)
    expect(root.reason).toBe('fatal: not a git repository')
    expect(root.result()).toBe('/working/directory')
  })

  it('when git cannot be executed, falls back to the working directory', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
      cwd: '/working/directory',
    })

    const root = gitRepositoryRoot({
      runtime: applicationData.runtime,
      logger: applicationData.logger(),
    })
    await root.run()

    expect(root.result()).toBe('/working/directory')
  })
})
