import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { resolve } from '@std/path'
import { spy } from '@std/testing/mock'
import { deleteFile } from '../../../../src/tools/files/mutations/delete.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('deleteFile', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/delete`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/delete`))

  it('deletes a file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/delete`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/delete/alpha.txt`, 'one\n')
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
    expect(() => Deno.statSync(`${fixturesDirectory}/delete/alpha.txt`))
      .toThrow()
  })

  it('deletes an empty directory', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/delete/empty`, { recursive: true })
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
    expect(() => Deno.statSync(`${fixturesDirectory}/delete/empty`)).toThrow()
  })

  it('when the directory is not empty, fails and leaves it untouched', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/delete/full`, { recursive: true })
    Deno.writeTextFileSync(
      `${fixturesDirectory}/delete/full/alpha.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

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
      Deno.readTextFileSync(`${fixturesDirectory}/delete/full/alpha.txt`),
    ).toBe('one\n')
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'Delete file: Directory not empty',
    )
  })

  it('when the path does not exist, fails', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/delete`, { recursive: true })
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

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
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'Delete file: No such file or directory',
    )
  })

  it('when the path is outside the allowed directories, fails without deleting', async () => {
    const path = resolve(Deno.cwd(), '..', 'outside-delete-denied.txt')
    Deno.writeTextFileSync(path, 'one\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const operation = deleteFile({
      applicationData,
      operationArguments: { path },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(Deno.readTextFileSync(path)).toBe('one\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Delete file: path not allowed: ${path}`,
    )
    Deno.removeSync(path)
  })
})
