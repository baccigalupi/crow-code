import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { writeFile } from '../../../../src/tools/files/mutations/write.ts'
import { denyAllPermissions } from '../../../support/deny-permissions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('writeFile', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'write')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'write')))

  it('creates a new file with the given content', async () => {
    const directory = join(fixturesDirectory, 'write')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\ntwo\n' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: true })
    expect(readFileSync(path, 'utf8')).toBe('one\ntwo\n')
  })

  it('overwrites an existing file entirely', async () => {
    const directory = join(fixturesDirectory, 'write')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'old content\n')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'new content\n' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: false })
    expect(readFileSync(path, 'utf8')).toBe('new content\n')
  })

  it('when the existence check is not allowed, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'write')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'denied.txt')
    const applicationData = mockApplicationData()
    spyOn(applicationData, 'readPathPermissions').mockImplementation(
      denyAllPermissions,
    )
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(() => statSync(path)).toThrow()
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Path exists: path not allowed: ${directory}`,
    )
  })

  it('when the path is outside the allowed directories, fails without writing', async () => {
    const path = resolve(process.cwd(), '..', 'outside-write-denied.txt')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, created: false })
    expect(() => statSync(path)).toThrow()
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
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
    expect(readFileSync(path, 'utf8')).toBe('one\n')
  })

  it('when the parent path is a file, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'write')
    mkdirSync(directory, { recursive: true })
    const parent = join(directory, 'parent')
    writeFileSync(parent, 'not a directory\n')
    const path = join(parent, 'alpha.txt')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, created: false })
    expect(readFileSync(parent, 'utf8')).toBe('not a directory\n')
    expect(loggerErrorSpy.mock.calls.length).toBeGreaterThan(0)
  })

  it('writing empty content succeeds', async () => {
    const directory = join(fixturesDirectory, 'write')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    const applicationData = mockApplicationData()

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: '' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, created: true })
    expect(readFileSync(path, 'utf8')).toBe('')
  })

  it('when the path exists as a directory, fails and leaves it unchanged', async () => {
    const directory = join(fixturesDirectory, 'write')
    const path = join(directory, 'alpha')
    mkdirSync(path, { recursive: true })
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = writeFile({
      applicationData,
      operationArguments: { path, content: 'one\n' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, created: false })
    expect(statSync(path).isDirectory()).toBe(true)
    expect(loggerErrorSpy.mock.calls.length).toBeGreaterThan(0)
  })
})
