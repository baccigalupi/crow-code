import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy } from '@std/testing/mock'
import { gitDiffFiles } from '../../../../src/tools/git/diff/files.ts'
import { loadTextFixture } from '../../../../tests/support/fixtures.ts'
import { mockApplicationData } from '../../../../tests/support/mock-application-data.ts'
import { mockDenoCommand } from '../../../../tests/support/mock-deno-command.ts'

describe('gitDiffFiles', () => {
  it('when filter is null, returns all files in the current uncommitted diff', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff-files.txt')
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout }),
    })

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(true)
    expect(gitDiff.result()).toEqual([
      'src/tools/git/diff/files.ts',
      'tests/support/fixtures.ts',
      'tests/support/fixtures/model-info/catalog/providers/models-dev-api.json',
      'tests/support/fixtures/model-info/catalog/providers/nous-models.json',
      'tests/support/fixtures/model-info/catalog/providers/ollama-models.json',
      'tests/support/fixtures/model-info/catalog/providers/openrouter-models.json',
      'tests/tools/git/diff/files.test.ts',
      'tests/support/fixtures/tools/',
    ])
  })

  it('when git cannot be executed, returns an empty array', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: No such file or directory (os error 2): git',
    )
  })

  it('when git exits non-zero, returns an empty array', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: fatal: not a git repository',
    )
  })
})
