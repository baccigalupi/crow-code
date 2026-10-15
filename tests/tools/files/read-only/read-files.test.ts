import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import { readFiles } from '../../../../src/tools/files/read-only/read-files.ts'
import { pathPermissions } from '../../../../src/application-data/allowed-paths/path-permissions.ts'
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
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [alphaPath, missingPath] },
    })
    await files.run()

    expect(files.success()).toBe(true)
    expect(files.result()).toEqual([
      { path: alphaPath, text: 'one\ntwo\nthree\n' },
    ])
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'Read file: No such file or directory',
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
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [missingPath, anotherMissingPath] },
    })
    await files.run()

    expect(files.success()).toBe(false)
    expect(files.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'Read file: No such file or directory',
    )
    expect(loggerErrorSpy.calls[1].args[0]).toContain(
      'Read file: No such file or directory',
    )
    expect(loggerErrorSpy.calls[2].args[0]).toBe(
      'Read files: failed to read all 2 paths',
    )
  })

  it('when a path is not allowed, logs the failure and omits that path', async () => {
    const applicationData = mockApplicationData()
    const alphaPath = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')
    const gitFixturePath = join(
      fixturesDirectory,
      'tools',
      'git',
      'git-diff.diff',
    )
    using _permissionsStub = stub(
      applicationData,
      'readPathPermissions',
      () =>
        pathPermissions({
          getRealPath: applicationData.getRealPath(),
          envars: applicationData.envars(),
          allowedDirectories: [join(fixturesDirectory, 'tools', 'files')],
        }),
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const files = readFiles({
      applicationData,
      operationArguments: { paths: [alphaPath, gitFixturePath] },
    })
    await files.run()

    expect(files.success()).toBe(true)
    expect(files.result()).toEqual([
      { path: alphaPath, text: 'one\ntwo\nthree\n' },
    ])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Read file: path not allowed: ${gitFixturePath}`,
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
