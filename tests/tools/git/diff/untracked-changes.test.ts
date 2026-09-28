import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitUntrackedChanges } from '../../../../src/tools/git/diff/untracked-changes.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../../support/mock-deno-command.ts'

describe('gitUntrackedChanges', () => {
  it('when there are untracked files, returns a diff for each one', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: [
          ' M src/tracked.ts\n?? src/a.ts\n?? src/b.ts\n',
          'diff --git a/src/a.ts b/src/a.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/a.ts\n@@ -0,0 +1 @@\n+alpha\n',
          'diff --git a/src/b.ts b/src/b.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/b.ts\n@@ -0,0 +1 @@\n+beta\n',
        ],
      }),
    })

    const changes = gitUntrackedChanges({ applicationData })
    await changes.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['status', '--porcelain', '-uall'] }],
    })
    assertSpyCall(commandSpy, 1, {
      args: ['git', { args: ['diff', '--no-index', '/dev/null', 'src/a.ts'] }],
    })
    assertSpyCall(commandSpy, 2, {
      args: ['git', { args: ['diff', '--no-index', '/dev/null', 'src/b.ts'] }],
    })
    expect(changes.success()).toBe(true)
    expect(changes.result().length).toBe(2)
    expect(changes.result()[0].path).toBe('src/a.ts')
    expect(changes.result()[0].diff).toContain('+alpha')
    expect(changes.result()[1].path).toBe('src/b.ts')
    expect(changes.result()[1].diff).toContain('+beta')
  })

  it('when one file diff fails, fails but keeps the diffs that worked', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        stdout: [
          '?? src/a.ts\n?? src/b.ts\n',
          'diff --git a/src/a.ts b/src/a.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/a.ts\n@@ -0,0 +1 @@\n+alpha\n',
          new Error('No such file or directory (os error 2): git'),
        ],
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const changes = gitUntrackedChanges({ applicationData })
    await changes.run()

    expect(changes.success()).toBe(false)
    expect(changes.result().length).toBe(1)
    expect(changes.result()[0].path).toBe('src/a.ts')
    expect(changes.result()[0].diff).toContain('+alpha')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: No such file or directory (os error 2): git',
    )
  })

  it('when git status fails, does not diff any files and returns an empty array', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const changes = gitUntrackedChanges({ applicationData })
    await changes.run()

    expect(commandSpy.calls.length).toBe(1)
    expect(changes.success()).toBe(false)
    expect(changes.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: fatal: not a git repository',
    )
  })
})
