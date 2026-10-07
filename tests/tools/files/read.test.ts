import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy } from '@std/testing/mock'
import { ReadFile, readFile } from '../../../src/tools/files/read.ts'
import { pathPermissions } from '../../../src/tools/path-permissions.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'

describe('readFile', () => {
  it('when no range is given, returns the whole file', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')

    const file = readFile({ applicationData, taskArguments: { path } })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, text: 'one\ntwo\nthree\n' })
  })

  it('when an offset is given, returns from that line to the end', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')

    const file = readFile({
      applicationData,
      taskArguments: { path, offset: 2 },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, text: 'two\nthree\n' })
  })

  it('when an offset and limit are given, returns only those lines', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')

    const file = readFile({
      applicationData,
      taskArguments: { path, offset: 2, limit: 1 },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, text: 'two' })
  })

  it('when the path is outside the allowed directories, returns empty text and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'git', 'git-diff.diff')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [join(fixturesDirectory, 'tools', 'files')],
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = readFile({
      applicationData,
      taskArguments: { path },
      pathPermissions: permissions,
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, text: '' })
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `File error: path not allowed: ${path}`,
    )
  })

  it('when the file does not exist, returns empty text and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'missing.txt')
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = readFile({ applicationData, taskArguments: { path } })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, text: '' })
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'File error: No such file or directory',
    )
  })

  it('when no path permissions are given, allows a path under the current working directory', async () => {
    const applicationData = mockApplicationData()
    const path = join(
      'tests',
      'support',
      'fixtures',
      'tools',
      'files',
      'alpha.txt',
    )

    const file = readFile({ applicationData, taskArguments: { path } })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result().text).toBe('one\ntwo\nthree\n')
  })

  it('when called through readFile, returns a ReadFile', () => {
    const applicationData = mockApplicationData()

    const file = readFile({
      applicationData,
      taskArguments: { path: 'alpha.txt' },
    })

    expect(file).toBeInstanceOf(ReadFile)
  })
})
