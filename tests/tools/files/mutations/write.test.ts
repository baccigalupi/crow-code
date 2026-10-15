import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join, resolve } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import { writeFile } from '../../../../src/tools/files/mutations/write.ts'
import { denyAllPermissions } from '../../../support/deny-permissions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('writeFile', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write')))

  it('creates a new file with the given content', async () => {
    const directory = join(fixturesDirectory, 'write')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\ntwo\n' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: true })
    expect(Deno.readTextFileSync(path)).toBe('one\ntwo\n')
  })

  it('overwrites an existing file entirely', async () => {
    const directory = join(fixturesDirectory, 'write')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'old content\n')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'new content\n' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: false })
    expect(Deno.readTextFileSync(path)).toBe('new content\n')
  })

  it('when the existence check is not allowed, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'write')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'denied.txt')
    const applicationData = mockApplicationData()
    using _permissionsStub = stub(
      applicationData,
      'readPathPermissions',
      denyAllPermissions,
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(() => Deno.statSync(path)).toThrow()
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Path exists: path not allowed: ${directory}`,
    )
  })

  it('when the path is outside the allowed directories, fails without writing', async () => {
    const path = resolve(Deno.cwd(), '..', 'outside-write-denied.txt')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, created: false })
    expect(() => Deno.statSync(path)).toThrow()
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Write file: path not allowed: ${path}`,
    )
  })

  it('creates missing ancestor directories before writing', async () => {
    const directory = join(fixturesDirectory, 'write')
    const path = join(directory, 'missing-dir/nested/alpha.txt')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: true })
    expect(Deno.readTextFileSync(path)).toBe('one\n')
  })

  it('when the parent path is a file, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'write')
    Deno.mkdirSync(directory, { recursive: true })
    const parent = join(directory, 'parent')
    Deno.writeTextFileSync(parent, 'not a directory\n')
    const path = join(parent, 'alpha.txt')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, created: false })
    expect(Deno.readTextFileSync(parent)).toBe('not a directory\n')
    expect(loggerErrorSpy.calls.length).toBeGreaterThan(0)
  })

  it('writing empty content succeeds', async () => {
    const directory = join(fixturesDirectory, 'write')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: '' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: true })
    expect(Deno.readTextFileSync(path)).toBe('')
  })

  it('when the path exists as a directory, fails and leaves it unchanged', async () => {
    const directory = join(fixturesDirectory, 'write')
    const path = join(directory, 'alpha')
    Deno.mkdirSync(path, { recursive: true })
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, created: false })
    expect(Deno.statSync(path).isDirectory).toBe(true)
    expect(loggerErrorSpy.calls.length).toBeGreaterThan(0)
  })
})
