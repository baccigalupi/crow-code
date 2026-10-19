import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import {
  defaultFilesystem,
  Filesystem,
} from '../../src/application-data/filesystem.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('filesystem', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/filesystem`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/filesystem`))

  it('reads a text file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem(Deno)

    const text = await filesystem.readTextFile(
      `${fixturesDirectory}/filesystem/alpha.txt`,
    )

    expect(text).toBe('one\n')
  })

  it('writes a text file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    const filesystem = new Filesystem(Deno)

    await filesystem.writeTextFile(
      `${fixturesDirectory}/filesystem/alpha.txt`,
      'two',
    )

    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/filesystem/alpha.txt`),
    ).toBe('two')
  })

  it('makes a directory with its missing parents', async () => {
    const filesystem = new Filesystem(Deno)

    await filesystem.mkdirWithParents(`${fixturesDirectory}/filesystem/one/two`)

    expect(
      Deno.statSync(`${fixturesDirectory}/filesystem/one/two`).isDirectory,
    ).toBe(true)
  })

  it('renames a file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem(Deno)

    await filesystem.rename(
      `${fixturesDirectory}/filesystem/alpha.txt`,
      `${fixturesDirectory}/filesystem/beta.txt`,
    )

    expect(
      Deno.readTextFileSync(`${fixturesDirectory}/filesystem/beta.txt`),
    ).toBe('one\n')
    expect(() => Deno.statSync(`${fixturesDirectory}/filesystem/alpha.txt`))
      .toThrow()
  })

  it('removes a file', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem(Deno)

    await filesystem.remove(`${fixturesDirectory}/filesystem/alpha.txt`)

    expect(() => Deno.statSync(`${fixturesDirectory}/filesystem/alpha.txt`))
      .toThrow()
  })

  it('when the path exists, assertExists resolves', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    const filesystem = new Filesystem(Deno)

    const assertion = filesystem.assertExists(`${fixturesDirectory}/filesystem`)

    await expect(assertion).resolves.toBeUndefined()
  })

  it('when the path is missing, assertExists rejects', async () => {
    const filesystem = new Filesystem(Deno)

    const assertion = filesystem.assertExists(
      `${fixturesDirectory}/filesystem/missing`,
    )

    await expect(assertion).rejects.toThrow()
  })

  it('resolves the real path', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem/one`, { recursive: true })
    const filesystem = new Filesystem(Deno)

    const realPath = await filesystem.realPath(
      `${fixturesDirectory}/filesystem/one/..`,
    )

    expect(realPath).toBe(Deno.realPathSync(`${fixturesDirectory}/filesystem`))
  })

  it('when the error is a missing file, isNotFound is true', () => {
    const filesystem = new Filesystem(Deno)

    const notFound = filesystem.isNotFound(new Deno.errors.NotFound('missing'))

    expect(notFound).toBe(true)
  })

  it('when the error is not a missing file, isNotFound is false', () => {
    const filesystem = new Filesystem(Deno)

    const notFound = filesystem.isNotFound(new SyntaxError('bad json'))

    expect(notFound).toBe(false)
  })

  it('when built by default, uses the Deno global', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    Deno.writeTextFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = defaultFilesystem()

    const text = await filesystem.readTextFile(
      `${fixturesDirectory}/filesystem/alpha.txt`,
    )

    expect(text).toBe('one\n')
  })
})
