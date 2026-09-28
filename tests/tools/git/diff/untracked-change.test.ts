import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitUntrackedChange } from '../../../../src/tools/git/diff/untracked-change.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../../support/mock-deno-command.ts'

describe('gitUntrackedChange', () => {
  it('when git diff exits with code 1, returns the diff for the given path', async () => {
    const stdout =
      `diff --git a/src/new-file.ts b/src/new-file.ts\nnew file mode 100644\nindex 0000000..9daeafb\n--- /dev/null\n+++ b/src/new-file.ts\n@@ -0,0 +1 @@\n+hello\n`
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout,
        success: false,
        code: 1,
      }),
    })

    const changes = gitUntrackedChange({
      applicationData,
      commandArguments: { path: 'src/new-file.ts' },
    })
    await changes.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['diff', '--no-index', '/dev/null', 'src/new-file.ts'] },
      ],
    })
    expect(changes.success()).toBe(true)
    expect(changes.result()).toContain('+++ b/src/new-file.ts')
  })

  it('when git cannot be executed, returns an empty diff', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const changes = gitUntrackedChange({
      applicationData,
      commandArguments: { path: 'src/new-file.ts' },
    })
    await changes.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['diff', '--no-index', '/dev/null', 'src/new-file.ts'] },
      ],
    })
    expect(changes.success()).toBe(false)
    expect(changes.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: No such file or directory (os error 2): git',
    )
  })

  it('when git exits with a non-1 error code, returns an empty diff', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const changes = gitUntrackedChange({
      applicationData,
      commandArguments: { path: 'src/new-file.ts' },
    })
    await changes.run()

    expect(changes.success()).toBe(false)
    expect(changes.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: fatal: not a git repository',
    )
  })
})
