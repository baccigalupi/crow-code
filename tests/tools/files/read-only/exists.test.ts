import { describe, expect, it, spyOn } from 'bun:test'
import { join, resolve } from 'node:path'
import { pathExists } from '../../../../src/tools/files/read-only/exists.ts'
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
    const path = resolve(process.cwd(), '..', 'outside-exists-check.txt')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const exists = pathExists({ applicationData, operationArguments: { path } })
    await exists.run()

    expect(exists.success()).toBe(false)
    expect(exists.result()).toEqual({ path, exists: false })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Path exists: path not allowed: ${path}`,
    )
  })
})
