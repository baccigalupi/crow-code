import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { resolve } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import { makeDirectory } from '../../../../src/tools/files/mutations/mkdir.ts'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { denyAllPermissions } from '../../../support/deny-permissions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('makeDirectory', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/mkdir`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/mkdir`))

  it('creates a nested directory including missing ancestors', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
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
      Deno.statSync(`${fixturesDirectory}/mkdir/one/two/three`).isDirectory,
    ).toBe(true)
  })

  it('when the directory already exists, succeeds without claiming creation', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/mkdir/existing`, { recursive: true })
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
    expect(
      Deno.statSync(`${fixturesDirectory}/mkdir/existing`).isDirectory,
    ).toBe(true)
  })

  it('when the path is outside the allowed directories, fails without creating', async () => {
    const path = resolve(Deno.cwd(), '..', 'outside-mkdir-denied')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(mkdir.result()).toEqual({ path, created: false })
    expect(() => Deno.statSync(path)).toThrow()
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Make directory: path not allowed: ${path}`,
    )
  })

  it('when the path is inside a configured ignored directory, fails without creating', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
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
        },
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/mkdir/ignored/child` },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(() => Deno.statSync(`${fixturesDirectory}/mkdir/ignored`)).toThrow()
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Make directory: path not allowed: ${fixturesDirectory}/mkdir/ignored/child`,
    )
  })

  it('when the existence check is not allowed, fails without creating', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
    const applicationData = mockApplicationData()
    using _permissionsStub = stub(
      applicationData,
      'readPathPermissions',
      denyAllPermissions,
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const mkdir = makeDirectory({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/mkdir/denied` },
    })
    await mkdir.run()

    expect(mkdir.success()).toBe(false)
    expect(() => Deno.statSync(`${fixturesDirectory}/mkdir/denied`)).toThrow()
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Path exists: path not allowed: ${fixturesDirectory}/mkdir/denied`,
    )
  })

  it('when the path exists as a file, fails and leaves the file unchanged', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/mkdir`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/mkdir/alpha.txt`, 'one\ntwo\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

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
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/mkdir/alpha.txt`),
    ).toBe('one\ntwo\n')
    expect(loggerErrorSpy.calls.length).toBeGreaterThan(0)
  })
})
