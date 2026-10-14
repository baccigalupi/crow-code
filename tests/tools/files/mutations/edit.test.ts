import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy, stub } from '@std/testing/mock'
import { editFile } from '../../../../src/tools/files/mutations/edit.ts'
import { pathPermissions } from '../../../../src/application-data/path-permissions.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('editFile', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'edit')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'edit')))

  it('replaces a unique occurrence and reports one replacement', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(true)
    expect(file.result()).toEqual({ path, replacements: 1 })
    expect(Deno.readTextFileSync(path)).toBe('one\nTWO\nthree\n')
  })

  it('when the old string is absent, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'four', newString: 'FOUR' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(Deno.readTextFileSync(path)).toBe('one\ntwo\nthree\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Edit file: oldString not found in file',
    )
  })

  it('when the old string is ambiguous without replaceAll, fails with the count', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'two\ntwo\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(Deno.readTextFileSync(path)).toBe('two\ntwo\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Edit file: oldString is not unique: found 2 occurrences',
    )
  })

  it('with replaceAll, replaces every occurrence', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'two\ntwo\n')
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
    expect(Deno.readTextFileSync(path)).toBe('TWO\nTWO\n')
  })

  it('when the path is outside the allowed directories, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()
    using _permissionsStub = stub(
      applicationData,
      'writePathPermissions',
      () =>
        pathPermissions({
          getRealPath: applicationData.getRealPath(),
          envars: applicationData.envars(),
          allowedDirectories: [join(fixturesDirectory, 'tools')],
        }),
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(Deno.readTextFileSync(path)).toBe('one\ntwo\nthree\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Edit file: path not allowed: ${path}`,
    )
  })

  it('when the file does not exist, fails and logs', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'missing.txt')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'Edit file: No such file or directory',
    )
  })

  it('when oldString equals newString, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: 'two', newString: 'two' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(Deno.readTextFileSync(path)).toBe('one\ntwo\nthree\n')
  })

  it('when oldString is empty, fails without writing', async () => {
    const directory = join(fixturesDirectory, 'edit')
    Deno.mkdirSync(directory, { recursive: true })
    const path = join(directory, 'alpha.txt')
    Deno.writeTextFileSync(path, 'one\ntwo\nthree\n')
    const applicationData = mockApplicationData()

    const file = editFile({
      applicationData,
      operationArguments: { path, oldString: '', newString: 'TWO' },
    })
    await file.run()

    expect(file.success()).toBe(false)
    expect(file.result()).toEqual({ path, replacements: 0 })
    expect(Deno.readTextFileSync(path)).toBe('one\ntwo\nthree\n')
  })
})
