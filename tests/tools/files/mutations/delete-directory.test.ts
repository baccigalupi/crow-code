import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import {
  chmodSync,
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { CrowConfig } from '../../../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../../../src/domain/config.ts'
import { deleteDirectory } from '../../../../src/tools/files/mutations/delete-directory.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('deleteDirectory', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/delete-directory`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/delete-directory`))

  it('deletes a non-empty directory', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory/full/one`, {
      recursive: true,
    })
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/one/alpha.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData()

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/full`,
      },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete-directory/full`,
      deleted: true,
      kept: [],
    })
    expect(() =>
      statSync(`${fixturesDirectory}/delete-directory/full`),
    ).toThrow()
  })

  it('when the path is a file, fails and leaves it untouched', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/delete-directory/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/alpha.txt`,
      },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete-directory/alpha.txt`,
      deleted: false,
      kept: [],
    })
    expect(
      readFileSync(`${fixturesDirectory}/delete-directory/alpha.txt`, 'utf8'),
    ).toBe('one\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Delete directory: not a directory: ${fixturesDirectory}/delete-directory/alpha.txt`,
    )
  })

  it('when the path is an allowed root, fails and deletes nothing', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory/full`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/alpha.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData({
      cwd: `${fixturesDirectory}/delete-directory/full`,
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/full`,
      },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(
      readFileSync(
        `${fixturesDirectory}/delete-directory/full/alpha.txt`,
        'utf8',
      ),
    ).toBe('one\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Delete directory: protected path: ${fixturesDirectory}/delete-directory/full`,
    )
  })

  it('when the path does not exist, fails', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory`, { recursive: true })
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/missing`,
      },
    })
    await operation.run()

    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete-directory/missing`,
      deleted: false,
      kept: [],
    })
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Delete directory: ENOENT: no such file or directory',
    )
  })

  it('when the path is outside the allowed directories, fails without deleting', async () => {
    const path = resolve(process.cwd(), '..', 'outside-delete-directory-denied')
    mkdirSync(path, { recursive: true })
    writeFileSync(`${path}/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteDirectory({
      applicationData,
      operationArguments: { path },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(readFileSync(`${path}/alpha.txt`, 'utf8')).toBe('one\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Delete directory: path not allowed: ${path}`,
    )
    rmSync(path, { recursive: true })
  })

  it('when the directory holds a symlink to an outside directory, deletes the link but not its target', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory-target`, {
      recursive: true,
    })
    writeFileSync(
      `${fixturesDirectory}/delete-directory-target/keep.txt`,
      'one\n',
    )
    mkdirSync(`${fixturesDirectory}/delete-directory/full`, { recursive: true })
    symlinkSync(
      `${fixturesDirectory}/delete-directory-target`,
      `${fixturesDirectory}/delete-directory/full/link`,
    )
    const applicationData = mockApplicationData()

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/full`,
      },
    })
    await operation.run()

    expect(operation.success()).toBe(true)
    expect(
      readFileSync(
        `${fixturesDirectory}/delete-directory-target/keep.txt`,
        'utf8',
      ),
    ).toBe('one\n')
    clearDirectory(`${fixturesDirectory}/delete-directory-target`)
  })

  it('when the directory contains an ignored path, deletes everything else and keeps it', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory/full/one/ignored`, {
      recursive: true,
    })
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/one/ignored/alpha.txt`,
      'one\n',
    )
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/one/beta.txt`,
      'one\n',
    )
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/gamma.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: [`${fixturesDirectory}/delete-directory/full/one/ignored`],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/full`,
      },
    })
    await operation.run()

    expect(operation.success()).toBe(false)
    expect(
      readFileSync(
        `${fixturesDirectory}/delete-directory/full/one/ignored/alpha.txt`,
        'utf8',
      ),
    ).toBe('one\n')
    expect(() =>
      statSync(`${fixturesDirectory}/delete-directory/full/one/beta.txt`),
    ).toThrow()
    expect(() =>
      statSync(`${fixturesDirectory}/delete-directory/full/gamma.txt`),
    ).toThrow()
    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete-directory/full`,
      deleted: false,
      kept: [`${fixturesDirectory}/delete-directory/full/one/ignored`],
    })
    expect(loggerErrorSpy).toHaveBeenCalledTimes(3)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Delete directory: path not allowed: ${fixturesDirectory}/delete-directory/full/one/ignored`,
    )
    expect(loggerErrorSpy.mock.calls[1][0]).toBe(
      `Delete directory: failed to delete: ${fixturesDirectory}/delete-directory/full/one/ignored`,
    )
    expect(loggerErrorSpy.mock.calls[2][0]).toBe(
      `Delete directory: failed to delete: ${fixturesDirectory}/delete-directory/full/one/ignored`,
    )
  })

  it('when an ignored path inside does not exist, deletes the whole directory', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory/full/one`, {
      recursive: true,
    })
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/alpha.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: [`${fixturesDirectory}/delete-directory/full/missing`],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/full`,
      },
    })
    await operation.run()

    expect(operation.result()).toEqual({
      path: `${fixturesDirectory}/delete-directory/full`,
      deleted: true,
      kept: [],
    })
    expect(() =>
      statSync(`${fixturesDirectory}/delete-directory/full`),
    ).toThrow()
  })

  it('when a subdirectory cannot be removed, deletes the rest and reports it', async () => {
    mkdirSync(`${fixturesDirectory}/delete-directory/full/alpha`, {
      recursive: true,
    })
    mkdirSync(`${fixturesDirectory}/delete-directory/full/zeta`)
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/alpha/inner.txt`,
      'one\n',
    )
    writeFileSync(
      `${fixturesDirectory}/delete-directory/full/beta.txt`,
      'one\n',
    )
    chmodSync(`${fixturesDirectory}/delete-directory/full/alpha`, 0o555)
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: [`${fixturesDirectory}/delete-directory/full/zeta`],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
          allowedLocalScripts: [],
        },
      }),
    })

    const operation = deleteDirectory({
      applicationData,
      operationArguments: {
        path: `${fixturesDirectory}/delete-directory/full`,
      },
    })
    await operation.run()

    expect(() =>
      statSync(`${fixturesDirectory}/delete-directory/full/beta.txt`),
    ).toThrow()
    expect(
      readFileSync(
        `${fixturesDirectory}/delete-directory/full/alpha/inner.txt`,
        'utf8',
      ),
    ).toBe('one\n')
    expect(operation.result().kept).toEqual([
      `${fixturesDirectory}/delete-directory/full/alpha`,
      `${fixturesDirectory}/delete-directory/full/zeta`,
    ])
    chmodSync(`${fixturesDirectory}/delete-directory/full/alpha`, 0o755)
  })
})
