import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { multiEdit } from '../../../../src/tools/files/mutations/multi-edit.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('multiEdit', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'multi-edit')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'multi-edit')))

  it('applies edits across two files', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    writeFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'two', newString: 'TWO' },
          { path: beta, oldString: 'blue', newString: 'BLUE' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(true)
    expect(batch.result()).toEqual([
      { path: alpha, replacements: 1 },
      { path: beta, replacements: 1 },
    ])
    expect(readFileSync(alpha, 'utf8')).toBe('one\nTWO\n')
    expect(readFileSync(beta, 'utf8')).toBe('red\nBLUE\n')
  })

  it('when a later edit fails, restores earlier edits', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    writeFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'two', newString: 'TWO' },
          { path: beta, oldString: 'four', newString: 'FOUR' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(batch.result()).toEqual([])
    expect(readFileSync(alpha, 'utf8')).toBe('one\ntwo\n')
    expect(readFileSync(beta, 'utf8')).toBe('red\nblue\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Edit file: oldString not found in file',
    )
    expect(loggerErrorSpy.mock.calls[1][0]).toBe(
      'Multi edit: oldString not found in file',
    )
  })

  it('when an old string is ambiguous without replaceAll, fails and leaves the file', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    writeFileSync(alpha, 'two\ntwo\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [{ path: alpha, oldString: 'two', newString: 'TWO' }],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(readFileSync(alpha, 'utf8')).toBe('two\ntwo\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Edit file: oldString is not unique: found 2 occurrences',
    )
  })

  it('with replaceAll, replaces every occurrence', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    writeFileSync(alpha, 'two\ntwo\n')
    const applicationData = mockApplicationData()

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [{
          path: alpha,
          oldString: 'two',
          newString: 'TWO',
          replaceAll: true,
        }],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(true)
    expect(batch.result()).toEqual([{ path: alpha, replacements: 2 }])
    expect(readFileSync(alpha, 'utf8')).toBe('TWO\nTWO\n')
  })

  it('when a path is not allowed, fails before writing anything', async () => {
    const allowedDirectory = join(fixturesDirectory, 'multi-edit', 'allowed')
    mkdirSync(allowedDirectory, { recursive: true })
    const alpha = join(allowedDirectory, 'alpha.txt')
    const beta = resolve(process.cwd(), '..', 'outside-multi-edit-denied.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    writeFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'two', newString: 'TWO' },
          { path: beta, oldString: 'blue', newString: 'BLUE' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(readFileSync(alpha, 'utf8')).toBe('one\ntwo\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Multi edit: path not allowed: ${beta}`,
    )
    rmSync(beta)
  })

  it('when a file is missing, fails and leaves other files', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const missing = join(directory, 'missing.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    const applicationData = mockApplicationData()

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'two', newString: 'TWO' },
          { path: missing, oldString: 'x', newString: 'y' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(readFileSync(alpha, 'utf8')).toBe('one\ntwo\n')
    expect(batch.reason).toContain('ENOENT: no such file or directory')
  })

  it('when a write fails mid-batch, restores earlier files', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    writeFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    const write = applicationData.filesystem.writeTextFile.bind(
      applicationData.filesystem,
    )
    let betaWrites = 0
    spyOn(applicationData.filesystem, 'writeTextFile').mockImplementation(
      (path: string, data: string) => {
        if (String(path) === beta) betaWrites += 1
        if (String(path) === beta && betaWrites === 1) {
          return Promise.reject(new Error('beta boom'))
        }
        return write(path, data)
      },
    )

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'two', newString: 'TWO' },
          { path: beta, oldString: 'blue', newString: 'BLUE' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(batch.reason).toBe('beta boom')
    expect(readFileSync(alpha, 'utf8')).toBe('one\ntwo\n')
    expect(readFileSync(beta, 'utf8')).toBe('red\nblue\n')
  })

  it('when restoring a file fails, reports the file in the reason', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    writeFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    const write = applicationData.filesystem.writeTextFile.bind(
      applicationData.filesystem,
    )
    let alphaWrites = 0
    let betaWrites = 0
    spyOn(applicationData.filesystem, 'writeTextFile').mockImplementation(
      (path: string, data: string) => {
        if (String(path) === alpha) alphaWrites += 1
        if (String(path) === beta) betaWrites += 1
        if (String(path) === beta && betaWrites === 1) {
          return Promise.reject(new Error('beta boom'))
        }
        if (String(path) === alpha && alphaWrites > 1) {
          return Promise.reject(new Error('alpha boom'))
        }
        return write(path, data)
      },
    )

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'two', newString: 'TWO' },
          { path: beta, oldString: 'blue', newString: 'BLUE' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(batch.reason).toBe(
      `beta boom; failed to restore: ${alpha}`,
    )
  })

  it('when no edits are given, succeeds with no results', async () => {
    const batch = multiEdit({
      applicationData: mockApplicationData(),
      operationArguments: { edits: [] },
    })

    await batch.run()

    expect(batch.success()).toBe(true)
    expect(batch.result()).toEqual([])
  })

  it('applies several edits to one file sequentially', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    writeFileSync(alpha, 'one\ntwo\n')
    const applicationData = mockApplicationData()

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [
          { path: alpha, oldString: 'one', newString: '1' },
          { path: alpha, oldString: '1', newString: 'ONE' },
        ],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(true)
    expect(batch.result()).toEqual([
      { path: alpha, replacements: 1 },
      { path: alpha, replacements: 1 },
    ])
    expect(readFileSync(alpha, 'utf8')).toBe('ONE\ntwo\n')
  })
})
