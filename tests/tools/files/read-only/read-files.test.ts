import { describe, expect, it, spyOn } from 'bun:test'
import { join, resolve } from 'node:path'
import { readFiles } from '../../../../src/tools/files/read-only/read-files.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { fixturesDirectory } from '../../../support/fixtures.ts'

describe('readFiles', () => {
  it('when given multiple paths, returns the content of each file', async () => {
    const applicationData = mockApplicationData()
    const alphaPath = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')
    const betaPath = join(
      fixturesDirectory,
      'tools',
      'files',
      'nested',
      'beta.md',
    )

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [alphaPath, betaPath] },
    })
    await files.run()

    expect(files.success()).toBe(true)
    expect(files.result()).toEqual([
      { path: alphaPath, text: 'one\ntwo\nthree\n' },
      { path: betaPath, text: '# Beta\n\ntwo of them\n' },
    ])
  })

  it('when one read fails, logs the failure and omits that path', async () => {
    const applicationData = mockApplicationData()
    const alphaPath = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')
    const missingPath = join(fixturesDirectory, 'tools', 'files', 'missing.txt')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [alphaPath, missingPath] },
    })
    await files.run()

    expect(files.success()).toBe(true)
    expect(files.result()).toEqual([
      { path: alphaPath, text: 'one\ntwo\nthree\n' },
    ])
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Read file: ENOENT: no such file or directory',
    )
  })

  it('when every read fails, logs each failure and fails the batch', async () => {
    const applicationData = mockApplicationData()
    const missingPath = join(fixturesDirectory, 'tools', 'files', 'missing.txt')
    const anotherMissingPath = join(
      fixturesDirectory,
      'tools',
      'files',
      'also-missing.txt',
    )
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [missingPath, anotherMissingPath] },
    })
    await files.run()

    expect(files.success()).toBe(false)
    expect(files.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Read file: ENOENT: no such file or directory',
    )
    expect(loggerErrorSpy.mock.calls[1][0]).toContain(
      'Read file: ENOENT: no such file or directory',
    )
    expect(loggerErrorSpy.mock.calls[2][0]).toBe(
      'Read files: failed to read all 2 paths',
    )
  })

  it('when a path is not allowed, logs the failure and omits that path', async () => {
    const applicationData = mockApplicationData()
    const alphaPath = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')
    const outsidePath = resolve(process.cwd(), '..', 'outside.txt')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [alphaPath, outsidePath] },
    })
    await files.run()

    expect(files.success()).toBe(true)
    expect(files.result()).toEqual([
      { path: alphaPath, text: 'one\ntwo\nthree\n' },
    ])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Read file: path not allowed: ${outsidePath}`,
    )
  })

  it('when no paths are given, returns an empty result', async () => {
    const applicationData = mockApplicationData()

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [] },
    })
    await files.run()

    expect(files.success()).toBe(true)
    expect(files.result()).toEqual([])
  })
})
