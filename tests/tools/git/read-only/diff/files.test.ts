import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { gitDiffFiles } from '../../../../../src/tools/git/read-only/diff/files.ts'
import { loadTextFixture } from '../../../../../tests/support/fixtures.ts'
import { mockApplicationData } from '../../../../../tests/support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitDiffFiles', () => {
  it('when filter is null, returns all files in the current uncommitted diff', async () => {
    const stdout = await loadTextFixture('tools/git/git-diff-files.txt')
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout }),
    })

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(true)
    expect(gitDiff.result()).toEqual([
      { path: 'src/tools/git/diff/files.ts', changeType: ' M' },
      { path: 'tests/support/fixtures.ts', changeType: ' M' },
      {
        path: 'tests/support/fixtures/model-discovery/populate/providers/nous-models.json',
        changeType: 'R ',
      },
      {
        path: 'tests/support/fixtures/model-discovery/populate/providers/ollama-models.json',
        changeType: 'R ',
      },
      {
        path: 'tests/support/fixtures/model-discovery/populate/providers/openrouter-models.json',
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
      command: mockCommand({ stdout }),
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
      command: mockCommand({ stdout }),
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
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git diff files: No such file or directory (os error 2): git',
    )
  })

  it('when git exits non-zero, returns an empty array', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stderr: 'fatal: not a git repository',
        success: false,
        code: 128,
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const gitDiff = gitDiffFiles({ applicationData })
    await gitDiff.run()

    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git diff files: fatal: not a git repository',
    )
  })

  it('when a filter path is outside the repository, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-git-diff-files.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const gitDiff = gitDiffFiles({
      applicationData,
      operationArguments: { filter: [path] },
    })
    await gitDiff.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(gitDiff.success()).toBe(false)
    expect(gitDiff.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git diff files: path not allowed: ${path}`,
    )
  })
})
