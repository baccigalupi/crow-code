import { describe, expect, it, mock } from 'bun:test'
import { gitChanges } from '../../../../../src/tools/git/read-only/diff/changes.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitChanges', () => {
  it('when tracked and untracked files changed, returns both diffs and succeeds', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '?? src/b.ts\n',
          'diff --git a/src/b.ts b/src/b.ts\nnew file mode 100644\n--- /dev/null\n+++ b/src/b.ts\n@@ -0,0 +1 @@\n+beta\n',
        ],
      }),
    })
    const changes = gitChanges({ applicationData })

    await changes.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', 'HEAD'],
    })
    expect(commandSpy).toHaveBeenNthCalledWith(2, 'git', {
      args: ['status', '--porcelain', '-uall'],
    })
    expect(commandSpy).toHaveBeenNthCalledWith(3, 'git', {
      args: ['diff', '--no-index', '/dev/null', 'src/b.ts'],
    })
    expect(changes.success()).toBe(true)
    expect(changes.result().length).toBe(2)
    expect(changes.result()[0].path).toBe('src/a.ts')
    expect(changes.result()[1].path).toBe('src/b.ts')
  })

  it('when a filter is given, scopes both children', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '?? src/other.ts\n',
        ],
      }),
    })
    const changes = gitChanges({
      applicationData,
      operationArguments: { filter: ['src/a.ts'] },
    })

    await changes.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', 'HEAD', '--', 'src/a.ts'],
    })
    expect(commandSpy).toHaveBeenNthCalledWith(2, 'git', {
      args: ['status', '--porcelain', '-uall'],
    })
    expect(commandSpy.mock.calls.length).toBe(2)
    expect(changes.success()).toBe(true)
    expect(changes.result().length).toBe(1)
    expect(changes.result()[0].path).toBe('src/a.ts')
  })

  it('when the tracked diff fails, fails', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: [new Error('diff failed'), ''],
      }),
    })
    const changes = gitChanges({ applicationData })

    await changes.run()

    expect(changes.success()).toBe(false)
  })

  it('when the status command fails, fails but keeps the tracked diff', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          new Error('status failed'),
        ],
      }),
    })
    const changes = gitChanges({ applicationData })

    await changes.run()

    expect(changes.success()).toBe(false)
    expect(changes.result().length).toBe(1)
    expect(changes.result()[0].path).toBe('src/a.ts')
  })

  it('when only applicationData is given, diffs HEAD without a filter', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const changes = gitChanges({ applicationData })

    await changes.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', 'HEAD'],
    })
  })

  it('when a filter path is outside the repository, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const changes = gitChanges({
      applicationData,
      operationArguments: { filter: ['../outside.ts'] },
    })

    await changes.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(changes.success()).toBe(false)
  })
})
