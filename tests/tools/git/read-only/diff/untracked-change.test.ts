import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { gitUntrackedChange } from '../../../../../src/tools/git/read-only/diff/untracked-change.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitUntrackedChange', () => {
  it('when git diff exits with code 1, returns the diff for the given path', async () => {
    const stdout = `diff --git a/src/new-file.ts b/src/new-file.ts\nnew file mode 100644\nindex 0000000..9daeafb\n--- /dev/null\n+++ b/src/new-file.ts\n@@ -0,0 +1 @@\n+hello\n`
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout,
        success: false,
        code: 1,
      }),
    })

    const changes = gitUntrackedChange({
      applicationData,
      operationArguments: { path: 'src/new-file.ts' },
    })
    await changes.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', '--no-index', '/dev/null', 'src/new-file.ts'],
    })
    expect(changes.success()).toBe(true)
    expect(changes.result().path).toBe('src/new-file.ts')
    expect(changes.result().diff).toMatch(
      /^diff --git a\/src\/new-file\.ts b\/src\/new-file\.ts\n/,
    )
    expect(changes.result().diff).toContain('--- /dev/null')
    expect(changes.result().diff).toContain('+++ b/src/new-file.ts')
    expect(changes.result().diff).toContain('+hello')
  })

  it('when git cannot be executed, returns an empty diff', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const changes = gitUntrackedChange({
      applicationData,
      operationArguments: { path: 'src/new-file.ts' },
    })
    await changes.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', '--no-index', '/dev/null', 'src/new-file.ts'],
    })
    expect(changes.success()).toBe(false)
    expect(changes.result()).toEqual({ path: '', diff: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git untracked change: No such file or directory (os error 2): git',
    )
  })

  it('when git exits with a non-1 error code, returns an empty diff', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const changes = gitUntrackedChange({
      applicationData,
      operationArguments: { path: 'src/new-file.ts' },
    })
    await changes.run()

    expect(changes.success()).toBe(false)
    expect(changes.result()).toEqual({ path: '', diff: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git untracked change: fatal: not a git repository',
    )
  })

  it('when the path is outside the repository, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-git-untracked-change.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const changes = gitUntrackedChange({
      applicationData,
      operationArguments: { path },
    })
    await changes.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(changes.success()).toBe(false)
    expect(changes.result()).toEqual({ path: '', diff: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git untracked change: path not allowed: ${path}`,
    )
  })
})
