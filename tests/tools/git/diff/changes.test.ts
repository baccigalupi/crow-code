import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitChanges } from '../../../../src/tools/git/diff/changes.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../../support/mock-deno-command.ts'

describe('gitChanges', () => {
  it('when tracked and untracked files changed, returns both diffs and succeeds', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
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

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff', 'HEAD'] }],
    })
    assertSpyCall(commandSpy, 1, {
      args: ['git', { args: ['status', '--porcelain', '-uall'] }],
    })
    assertSpyCall(commandSpy, 2, {
      args: ['git', { args: ['diff', '--no-index', '/dev/null', 'src/b.ts'] }],
    })
    expect(changes.success()).toBe(true)
    expect(changes.result().length).toBe(2)
    expect(changes.result()[0].path).toBe('src/a.ts')
    expect(changes.result()[1].path).toBe('src/b.ts')
  })

  it('when a filter is given, scopes both children', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        stdout: [
          'diff --git a/src/a.ts b/src/a.ts\n--- a/src/a.ts\n+++ b/src/a.ts\n@@ -1 +1 @@\n-old\n+new\n',
          '?? src/other.ts\n',
        ],
      }),
    })
    const changes = gitChanges({
      applicationData,
      taskArguments: { filter: ['src/a.ts'] },
    })

    await changes.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff', 'HEAD', '--', 'src/a.ts'] }],
    })
    assertSpyCall(commandSpy, 1, {
      args: ['git', { args: ['status', '--porcelain', '-uall'] }],
    })
    expect(commandSpy.calls.length).toBe(2)
    expect(changes.success()).toBe(true)
    expect(changes.result().length).toBe(1)
    expect(changes.result()[0].path).toBe('src/a.ts')
  })

  it('when the tracked diff fails, fails', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        stdout: [new Error('diff failed'), ''],
      }),
    })
    const changes = gitChanges({ applicationData })

    await changes.run()

    expect(changes.success()).toBe(false)
  })

  it('when the status command fails, fails but keeps the tracked diff', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
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
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    const changes = gitChanges({ applicationData })

    await changes.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff', 'HEAD'] }],
    })
  })
})
