import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { spy, stub } from '@std/testing/mock'
import { pathPermissions } from '../../../../src/application-data/allowed-paths/path-permissions.ts'
import { moveFile } from '../../../../src/tools/files/mutations/move.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('moveFile', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/move`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/move`))

  it('moves a file, keeping its contents', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\ntwo\n')
    const applicationData = mockApplicationData()

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha.txt`,
        to: `${fixturesDirectory}/move/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(true)
    expect(move.result()).toEqual({
      from: `${fixturesDirectory}/move/alpha.txt`,
      to: `${fixturesDirectory}/move/beta.txt`,
    })
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/beta.txt`),
    ).toBe('one\ntwo\n')
    expect(() => Deno.statSync(`${fixturesDirectory}/move/alpha.txt`))
      .toThrow()
  })

  it('creates missing parent directories of the destination', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha.txt`,
        to: `${fixturesDirectory}/move/one/two/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(true)
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/one/two/beta.txt`),
    ).toBe('one\n')
  })

  it('when the source is outside the allowed directories, fails without moving', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()
    using _permissionsStub = stub(
      applicationData,
      'writePathPermissions',
      () =>
        pathPermissions({
          getRealPath: applicationData.getRealPath(),
          envars: applicationData.envars(),
          allowedDirectories: [`${fixturesDirectory}/move/inside`],
        }),
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha.txt`,
        to: `${fixturesDirectory}/move/inside/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/alpha.txt`),
    ).toBe('one\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Move file: path not allowed: ${fixturesDirectory}/move/alpha.txt`,
    )
  })

  it('when the destination is outside the allowed directories, fails without moving', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move/inside`, { recursive: true })
    Deno.writeTextFileSync(
      `${fixturesDirectory}/move/inside/alpha.txt`,
      'one\n',
    )
    const applicationData = mockApplicationData()
    using _permissionsStub = stub(
      applicationData,
      'writePathPermissions',
      () =>
        pathPermissions({
          getRealPath: applicationData.getRealPath(),
          envars: applicationData.envars(),
          allowedDirectories: [`${fixturesDirectory}/move/inside`],
        }),
    )
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/inside/alpha.txt`,
        to: `${fixturesDirectory}/move/outside/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/inside/alpha.txt`),
    ).toBe('one\n')
    expect(() => Deno.statSync(`${fixturesDirectory}/move/outside`)).toThrow()
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Move file: path not allowed: ${fixturesDirectory}/move/outside/beta.txt`,
    )
  })

  it('when the destination exists, fails and leaves both files unchanged', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    Deno.writeTextFileSync(`${fixturesDirectory}/move/beta.txt`, 'two\n')
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha.txt`,
        to: `${fixturesDirectory}/move/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/alpha.txt`),
    ).toBe('one\n')
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/beta.txt`),
    ).toBe('two\n')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Move file: destination already exists: ${fixturesDirectory}/move/beta.txt`,
    )
  })

  it('when the source is missing, fails without creating the destination parent', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    const applicationData = mockApplicationData()
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/missing.txt`,
        to: `${fixturesDirectory}/move/one/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(() => Deno.statSync(`${fixturesDirectory}/move/one`)).toThrow()
    expect(loggerErrorSpy.calls.length).toBeGreaterThan(0)
  })

  it('when the rename fails, fails with the error', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()
    using _renameStub = stub(Deno, 'rename', () => {
      throw new Error('rename exploded')
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha.txt`,
        to: `${fixturesDirectory}/move/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Move file: rename exploded',
    )
  })

  it('moves a directory with its contents', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/move/alpha`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/move/alpha/one.txt`, 'one\n')
    const applicationData = mockApplicationData()

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha`,
        to: `${fixturesDirectory}/move/beta`,
      },
    })
    await move.run()

    expect(move.success()).toBe(true)
    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/move/beta/one.txt`),
    ).toBe('one\n')
    expect(() => Deno.statSync(`${fixturesDirectory}/move/alpha`)).toThrow()
  })
})
