import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import {
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { deleteFile } from '../../../../src/tools/files/mutations/delete.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('deleteFile', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/delete`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/delete`))

  it('deletes a file', async () => {
    mkdirSync(`${fixturesDirectory}/delete`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/delete/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()

    const operation = deleteFile({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/delete/alpha.txt` },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete/alpha.txt`,
      deleted: true,
    })
    expect(() => statSync(`${fixturesDirectory}/delete/alpha.txt`))
      .toThrow()
  })

  it('deletes an empty directory', async () => {
    mkdirSync(`${fixturesDirectory}/delete/empty`, { recursive: true })
    const applicationData = mockApplicationData()

    const operation = deleteFile({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/delete/empty` },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete/empty`,
      deleted: true,
    })
    expect(() => statSync(`${fixturesDirectory}/delete/empty`)).toThrow()
  })

  it('when the directory is not empty, fails and leaves it untouched', async () => {
    mkdirSync(`${fixturesDirectory}/delete/full`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/delete/full/alpha.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteFile({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/delete/full` },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete/full`,
      deleted: false,
    })
    expect(
      readFileSync(`${fixturesDirectory}/delete/full/alpha.txt`, 'utf8'),
    ).toBe('one\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Delete file: ENOTEMPTY: directory not empty',
    )
  })

  it('when the path does not exist, fails', async () => {
    mkdirSync(`${fixturesDirectory}/delete`, { recursive: true })
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteFile({
      applicationData,
      operationArguments: { path: `${fixturesDirectory}/delete/missing.txt` },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete/missing.txt`,
      deleted: false,
    })
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Delete file: ENOENT: no such file or directory',
    )
  })

  it('when the path is outside the allowed directories, fails without deleting', async () => {
    const path = resolve(process.cwd(), '..', 'outside-delete-denied.txt')
    writeFileSync(path, 'one\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteFile({
      applicationData,
      operationArguments: { path },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(readFileSync(path, 'utf8')).toBe('one\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Delete file: path not allowed: ${path}`,
    )
    rmSync(path)
  })
})
