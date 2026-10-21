import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { gitTrackedChanges } from '../../../../../src/tools/git/read-only/diff/tracked-changes.ts'
import { loadTextFixture } from '../../../../support/fixtures.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitTrackedChanges', () => {
  it('when no filter is present, returns the full diff', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff.diff')
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout, commandSpy }),
    })

    const diff = gitTrackedChanges({ applicationData })
    await diff.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', 'HEAD'],
    })
    expect(diff.result().length).toBe(3)
    expect(diff.result()[0].path).toBe('src/tools/git/diff/files.ts')
    expect(diff.result()[0].diff).toMatch(
      /^diff --git a\/src\/tools\/git\/diff\/files\.ts b\/src\/tools\/git\/diff\/files\.ts\n/,
    )
    expect(diff.result()[0].diff).toContain(
      '-      return this.parser.parse(this.responseText)\n+      return new FileDiffParser(this.responseText).parse()\n',
    )
  })

  it('when a filter is present, limits the diff to those files', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const diff = gitTrackedChanges({
      applicationData,
      operationArguments: {
        filter: ['src/a.ts', 'tests/a.test.ts'],
      },
    })
    await diff.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['diff', 'HEAD', '--', 'src/a.ts', 'tests/a.test.ts'],
    })
  })

  it('when git cannot be executed, returns an empty diff', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const diff = gitTrackedChanges({ applicationData })
    await diff.run()

    expect(diff.success()).toBe(false)
    expect(diff.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git tracked changes: No such file or directory (os error 2): git',
    )
  })

  it('when a filter path is outside the repository, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-git-tracked-changes.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const diff = gitTrackedChanges({
      applicationData,
      operationArguments: { filter: [path] },
    })
    await diff.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(diff.success()).toBe(false)
    expect(diff.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git tracked changes: path not allowed: ${path}`,
    )
  })
})
