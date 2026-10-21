import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { makeDirectory } from '../../../../src/tools/files/mutations/mkdir.ts'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { denyAllPermissions } from '../../../support/deny-permissions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('makeDirectory', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/mkdir`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/mkdir`))

  it('creates a nested directory including missing ancestors', async () => {
    mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
    const applicationData = mockApplicationData()

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/mkdir/one/two/three`,
      },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(true)
    expect(mkdir.result()).toEqual({
      path: `${fixturesDirectory}/mkdir/one/two/three`,
      created: true,
    })
    expect(
      statSync(`${fixturesDirectory}/mkdir/one/two/three`).isDirectory(),
    ).toBe(true)
  })

  it('when the directory already exists, succeeds without claiming creation', async () => {
    mkdirSync(`${fixturesDirectory}/mkdir/existing`, { recursive: true })
    const applicationData = mockApplicationData()

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/mkdir/existing` },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(true)
    expect(mkdir.result()).toEqual({
      path: `${fixturesDirectory}/mkdir/existing`,
      created: false,
    })
    expect(statSync(`${fixturesDirectory}/mkdir/existing`).isDirectory()).toBe(
      true,
    )
  })

  it('when the path is outside the allowed directories, fails without creating', async () => {
    const path = resolve(process.cwd(), '..', 'outside-mkdir-denied')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(mkdir.result()).toEqual({ path, created: false })
    expect(() => statSync(path)).toThrow()
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Make directory: path not allowed: ${path}`,
    )
  })

  it('when the path is inside a configured ignored directory, fails without creating', async () => {
    mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        crowGlobalDirectory: '~/.crow',
        envFile: '~/.crow/.env',
        permissions: {
          ignore: [`${fixturesDirectory}/mkdir/ignored`],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/mkdir/ignored/child` },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(() => statSync(`${fixturesDirectory}/mkdir/ignored`)).toThrow()
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Make directory: path not allowed: ${fixturesDirectory}/mkdir/ignored/child`,
    )
  })

  it('when the existence check is not allowed, fails without creating', async () => {
    mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
    const applicationData = mockApplicationData()
    spyOn(applicationData, 'readPathPermissions').mockImplementation(
      denyAllPermissions,
    )
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/mkdir/denied` },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(() => statSync(`${fixturesDirectory}/mkdir/denied`)).toThrow()
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Path exists: path not allowed: ${fixturesDirectory}/mkdir/denied`,
    )
  })

  it('when the path exists as a file, fails and leaves the file unchanged', async () => {
    mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/mkdir/alpha.txt`, 'one\ntwo\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/mkdir/alpha.txt` },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(mkdir.result()).toEqual({
      path: `${fixturesDirectory}/mkdir/alpha.txt`,
      created: false,
    })
    expect(readFileSync(`${fixturesDirectory}/mkdir/alpha.txt`, 'utf8')).toBe(
      'one\ntwo\n',
    )
    expect(loggerErrorSpy.mock.calls.length).toBeGreaterThan(0)
  })
})
