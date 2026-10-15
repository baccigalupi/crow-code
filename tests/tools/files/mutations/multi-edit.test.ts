import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join, resolve } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import { multiEdit } from '../../../../src/tools/files/mutations/multi-edit.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('multiEdit', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'multi-edit')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'multi-edit')))

  it('applies edits across two files', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
    Deno.writeTextFileSync(beta, 'red\nblue\n')
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
    expect(Deno.readTextFileSync(alpha)).toBe('one\nTWO\n')
    expect(Deno.readTextFileSync(beta)).toBe('red\nBLUE\n')
  })

  it('when a later edit fails, restores earlier edits', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
    Deno.writeTextFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

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
    expect(Deno.readTextFileSync(alpha)).toBe('one\ntwo\n')
    expect(Deno.readTextFileSync(beta)).toBe('red\nblue\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Edit file: oldString not found in file',
    )
    expect(loggerErrorSpy.calls[1].args[0]).toBe(
      'Multi edit: oldString not found in file',
    )
  })

  it('when an old string is ambiguous without replaceAll, fails and leaves the file', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(alpha, 'two\ntwo\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const batch = multiEdit({
      applicationData,
      operationArguments: {
        edits: [{ path: alpha, oldString: 'two', newString: 'TWO' }],
      },
    })
    await batch.run()

    expect(batch.success()).toBe(false)
    expect(Deno.readTextFileSync(alpha)).toBe('two\ntwo\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Edit file: oldString is not unique: found 2 occurrences',
    )
  })

  it('with replaceAll, replaces every occurrence', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(alpha, 'two\ntwo\n')
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
    expect(Deno.readTextFileSync(alpha)).toBe('TWO\nTWO\n')
  })

  it('when a path is not allowed, fails before writing anything', async () => {
    const allowedDirectory = join(fixturesDirectory, 'multi-edit', 'allowed')
    Deno.mkdirSync(allowedDirectory, { recursive: true })
    const alpha = join(allowedDirectory, 'alpha.txt')
    const beta = resolve(Deno.cwd(), '..', 'outside-multi-edit-denied.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
    Deno.writeTextFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

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
    expect(Deno.readTextFileSync(alpha)).toBe('one\ntwo\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Multi edit: path not allowed: ${beta}`,
    )
    Deno.removeSync(beta)
  })

  it('when a file is missing, fails and leaves other files', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const missing = join(directory, 'missing.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
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
    expect(Deno.readTextFileSync(alpha)).toBe('one\ntwo\n')
    expect(batch.reason).toContain('No such file or directory')
  })

  it('when a write fails mid-batch, restores earlier files', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
    Deno.writeTextFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    const write = Deno.writeTextFile
    let betaWrites = 0
    using _writeStub = stub(
      Deno,
      'writeTextFile',
      (path, data) => {
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
    expect(Deno.readTextFileSync(alpha)).toBe('one\ntwo\n')
    expect(Deno.readTextFileSync(beta)).toBe('red\nblue\n')
  })

  it('when restoring a file fails, reports the file in the reason', async () => {
    const directory = join(fixturesDirectory, 'multi-edit')
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    const beta = join(directory, 'beta.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
    Deno.writeTextFileSync(beta, 'red\nblue\n')
    const applicationData = mockApplicationData()
    const write = Deno.writeTextFile
    let alphaWrites = 0
    let betaWrites = 0
    using _writeStub = stub(
      Deno,
      'writeTextFile',
      (path, data) => {
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
    Deno.mkdirSync(directory, { recursive: true })
    const alpha = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(alpha, 'one\ntwo\n')
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
    expect(Deno.readTextFileSync(alpha)).toBe('ONE\ntwo\n')
  })
})
