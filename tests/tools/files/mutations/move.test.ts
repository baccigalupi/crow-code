import { afterEach, beforeEach, describe, expect, it, spyOn } from 'bun:test'
import {
  mkdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import { resolve } from 'node:path'
import { moveFile } from '../../../../src/tools/files/mutations/move.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('moveFile', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/move`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/move`))

  it('moves a file, keeping its contents', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\ntwo\n')
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
      readFileSync(`${fixturesDirectory}/move/beta.txt`, 'utf8'),
    ).toBe('one\ntwo\n')
    expect(() => statSync(`${fixturesDirectory}/move/alpha.txt`))
      .toThrow()
  })

  it('creates missing parent directories of the destination', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
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
      readFileSync(`${fixturesDirectory}/move/one/two/beta.txt`, 'utf8'),
    ).toBe('one\n')
  })

  it('when the source is outside the allowed directories, fails without moving', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    const from = resolve(process.cwd(), '..', 'outside-move-source.txt')
    writeFileSync(from, 'one\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: { from, to: `${fixturesDirectory}/move/beta.txt` },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(readFileSync(from, 'utf8')).toBe('one\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Move file: path not allowed: ${from}`,
    )
    rmSync(from)
  })

  it('when the destination is outside the allowed directories, fails without moving', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    const to = resolve(process.cwd(), '..', 'outside-move-destination.txt')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: { from: `${fixturesDirectory}/move/alpha.txt`, to },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(
      readFileSync(`${fixturesDirectory}/move/alpha.txt`, 'utf8'),
    ).toBe('one\n')
    expect(() => statSync(to)).toThrow()
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Move file: path not allowed: ${to}`,
    )
  })

  it('when the destination exists, fails and leaves both files unchanged', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    writeFileSync(`${fixturesDirectory}/move/beta.txt`, 'two\n')
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

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
      readFileSync(`${fixturesDirectory}/move/alpha.txt`, 'utf8'),
    ).toBe('one\n')
    expect(
      readFileSync(`${fixturesDirectory}/move/beta.txt`, 'utf8'),
    ).toBe('two\n')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Move file: destination already exists: ${fixturesDirectory}/move/beta.txt`,
    )
  })

  it('when the source is missing, fails without creating the destination parent', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    const applicationData = mockApplicationData()
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/missing.txt`,
        to: `${fixturesDirectory}/move/one/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(() => statSync(`${fixturesDirectory}/move/one`)).toThrow()
    expect(loggerErrorSpy.mock.calls.length).toBeGreaterThan(0)
  })

  it('when the rename fails, fails with the error', async () => {
    mkdirSync(`${fixturesDirectory}/move`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/move/alpha.txt`, 'one\n')
    const applicationData = mockApplicationData()
    spyOn(applicationData.filesystem, 'rename').mockImplementation(() => {
      throw new Error('rename exploded')
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const move = moveFile({
      applicationData,
      operationArguments: {
        from: `${fixturesDirectory}/move/alpha.txt`,
        to: `${fixturesDirectory}/move/beta.txt`,
      },
    })
    await move.run()

    expect(move.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Move file: rename exploded',
    )
  })

  it('moves a directory with its contents', async () => {
    mkdirSync(`${fixturesDirectory}/move/alpha`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/move/alpha/one.txt`, 'one\n')
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
      readFileSync(`${fixturesDirectory}/move/beta/one.txt`, 'utf8'),
    ).toBe('one\n')
    expect(() => statSync(`${fixturesDirectory}/move/alpha`)).toThrow()
  })
})
