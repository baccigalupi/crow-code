import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { editFile } from '../../../../src/tools/files/mutations/edit.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('editFile', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'edit')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'edit')))

  it('replaces a unique occurrence and reports one replacement', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, replacements: 1 })
    expect(readFileSync(path, 'utf8')).toBe('one\nTWO\nthree\n')
  })

  it('when the old string is absent, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'four', newString: 'FOUR' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(readFileSync(path, 'utf8')).toBe('one\ntwo\nthree\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Edit file: oldString not found in file',
    )
  })

  it('when the old string is ambiguous without replaceAll, fails with the count', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'two\ntwo\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(readFileSync(path, 'utf8')).toBe('two\ntwo\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Edit file: oldString is not unique: found 2 occurrences',
    )
  })

  it('with replaceAll, replaces every occurrence', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'two\ntwo\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: {
        path,
        oldString: 'two',
        newString: 'TWO',
        replaceAll: true,
      },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, replacements: 2 })
    expect(readFileSync(path, 'utf8')).toBe('TWO\nTWO\n')
  })

  it('when the path is outside the allowed directories, fails without writing', async () => {
    const path = resolve(process.cwd(), '..', 'outside-edit-denied.txt')
    writeFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(readFileSync(path, 'utf8')).toBe('one\ntwo\nthree\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Edit file: path not allowed: ${path}`,
    )
    rmSync(path)
  })

  it('when the file does not exist, fails and logs', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'missing.txt')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(loggerErrorSpy.mock.calls[0][0]).toContain(
      'Edit file: ENOENT: no such file or directory',
    )
  })

  it('when oldString equals newString, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'two' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(readFileSync(path, 'utf8')).toBe('one\ntwo\nthree\n')
  })

  it('when oldString is empty, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    writeFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: '', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(readFileSync(path, 'utf8')).toBe('one\ntwo\nthree\n')
  })
})
