import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import { pathExists } from '../../../../src/tools/files/read-only/exists.ts'
import { pathPermissions } from '../../../../src/application-data/allowed-paths/path-permissions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { fixturesDirectory } from '../../../support/fixtures.ts'

describe('pathExists', () => {
  it('when the path is a file, reports it exists', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')

    const exists = pathExists({ applicationData, operationArguments: { path } })
    await exists.run()

    expect(exists.success()).toBe(true)
    expect(exists.result()).toEqual({ path, exists: true })
  })

  it('when the path is a directory, reports it exists', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files')

    const exists = pathExists({ applicationData, operationArguments: { path } })
    await exists.run()

    expect(exists.success()).toBe(true)
    expect(exists.result()).toEqual({ path, exists: true })
  })

  it('when the path is missing, succeeds and reports it does not exist', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'missing.txt')

    const exists = pathExists({ applicationData, operationArguments: { path } })
    await exists.run()

    expect(exists.success()).toBe(true)
    expect(exists.result()).toEqual({ path, exists: false })
  })

  it('when the path is outside the allowed directories, fails', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'alpha.txt')
    using _permissionsStub = stub(
      applicationData,
      'readPathPermissions',
      () =>
        pathPermissions({
          getRealPath: applicationData.getRealPath(),
          envars: applicationData.envars(),
          allowedDirectories: [join(fixturesDirectory, 'elsewhere')],
        }),
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const exists = pathExists({ applicationData, operationArguments: { path } })
    await exists.run()

    expect(exists.success()).toBe(false)
    expect(exists.result()).toEqual({ path, exists: false })
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Path exists: path not allowed: ${path}`,
    )
  })
})
