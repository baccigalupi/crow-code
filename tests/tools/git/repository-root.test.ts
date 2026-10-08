import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitRepositoryRoot } from '../../../src/tools/git/repository-root.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'

describe('gitRepositoryRoot', () => {
  it('returns the worktree root from git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy, stdout: '/some/repo\n' }),
    })

    const root = gitRepositoryRoot({ applicationData })
    await root.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['rev-parse', '--show-toplevel'] }],
    })
    expect(root.result()).toBe('/some/repo')
  })

  it('when git prints nothing, falls back to the working directory', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout: '   \n' }),
    })

    const root = gitRepositoryRoot({ applicationData })
    await root.run()

    expect(root.result()).toBe(Deno.cwd())
  })

  it('when git fails, falls back to the working directory', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
    })

    const root = gitRepositoryRoot({ applicationData })
    await root.run()

    expect(root.result()).toBe(Deno.cwd())
  })

  it('when git cannot be executed, falls back to the working directory', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })

    const root = gitRepositoryRoot({ applicationData })
    await root.run()

    expect(root.result()).toBe(Deno.cwd())
  })
})
