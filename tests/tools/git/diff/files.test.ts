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
      { path: 'src/tools/git/diff/files.ts', changeType: ' M' },
      { path: 'tests/support/fixtures.ts', changeType: ' M' },
      {
        path:
          'tests/support/fixtures/model-discovery/populate/providers/nous-models.json',
        changeType: 'R ',
      },
      {
        path:
          'tests/support/fixtures/model-discovery/populate/providers/ollama-models.json',
        changeType: 'R ',
      },
      {
        path:
          'tests/support/fixtures/model-discovery/populate/providers/openrouter-models.json',
        changeType: 'R ',
      },
      { path: 'tests/tools/git/diff/files.test.ts', changeType: ' M' },
      {
        path: 'tests/support/fixtures/tools/git/git-diff-files.txt',
        changeType: '??',
      },
    ])
  })

  it('when filter is provided, returns only files in the filter', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff-files.txt')
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout }),
    })

    const gitDiff = gitDiffFiles({
      applicationData,
      operationArguments: {
        filter: [
          'src/tools/git/diff/files.ts',
          'tests/tools/git/diff/files.test.ts',
        ],
      },
    })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(true)
    expect(gitDiff.result()).toEqual([
      { path: 'src/tools/git/diff/files.ts', changeType: ' M' },
      { path: 'tests/tools/git/diff/files.test.ts', changeType: ' M' },
    ])
  })

  it('when filter is provided and no files match, returns an empty array', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff-files.txt')
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout }),
    })

    const gitDiff = gitDiffFiles({
      applicationData,
      operationArguments: {
        filter: ['nonexistent/file.ts'],
      },
    })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(true)
    expect(gitDiff.result()).toEqual([])
  })

  it('when git cannot be executed, returns an empty array', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git diff files: No such file or directory (os error 2): git',
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
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git diff files: fatal: not a git repository',
    )
  })
})
