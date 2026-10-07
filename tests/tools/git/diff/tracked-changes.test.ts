import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitTrackedChanges } from '../../../../src/tools/git/diff/tracked-changes.ts'
import { loadTextFixture } from '../../../support/fixtures.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../../support/mock-deno-command.ts'

describe('gitTrackedChanges', () => {
  it('when no filter is present, returns the full diff', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff.diff')
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout, commandSpy }),
    })

    const diff = gitTrackedChanges({ applicationData })
    await diff.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff', 'HEAD'] }],
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
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })

    const diff = gitTrackedChanges({
      applicationData,
      operationArguments: {
        filter: ['src/a.ts', 'tests/a.test.ts'],
      },
    })
    await diff.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['diff', 'HEAD', '--', 'src/a.ts', 'tests/a.test.ts'] },
      ],
    })
  })

  it('when git cannot be executed, returns an empty diff', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const diff = gitTrackedChanges({ applicationData })
    await diff.run()

    expect(diff.success()).toBe(false)
    expect(diff.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git tracked changes: No such file or directory (os error 2): git',
    )
  })
})
