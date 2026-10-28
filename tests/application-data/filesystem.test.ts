import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import {
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
} from 'node:fs'
import {
  defaultFilesystem,
  Filesystem,
} from '../../src/application-data/filesystem.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('filesystem', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/filesystem`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/filesystem`))

  it('reads a text file', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem()

    const text = await filesystem.readTextFile(
      `${fixturesDirectory}/filesystem/alpha.txt`,
    )

    expect(text).toBe('one\n')
  })

  it('writes a text file', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    const filesystem = new Filesystem()

    await filesystem.writeTextFile(
      `${fixturesDirectory}/filesystem/alpha.txt`,
      'two',
    )

    expect(
      readFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'utf8'),
    ).toBe('two')
  })

  it('reads a file as bytes', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    writeFileSync(
      `${fixturesDirectory}/filesystem/alpha.bin`,
      new Uint8Array([1, 2, 3]),
    )
    const filesystem = new Filesystem()

    const bytes = await filesystem.readBytes(
      `${fixturesDirectory}/filesystem/alpha.bin`,
    )

    expect(bytes).toEqual(new Uint8Array([1, 2, 3]))
  })

  it('makes a directory with its missing parents', async () => {
    const filesystem = new Filesystem()

    await filesystem.mkdirWithParents(`${fixturesDirectory}/filesystem/one/two`)

    expect(
      statSync(`${fixturesDirectory}/filesystem/one/two`).isDirectory(),
    ).toBe(true)
  })

  it('renames a file', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem()

    await filesystem.rename(
      `${fixturesDirectory}/filesystem/alpha.txt`,
      `${fixturesDirectory}/filesystem/beta.txt`,
    )

    expect(
      readFileSync(`${fixturesDirectory}/filesystem/beta.txt`, 'utf8'),
    ).toBe('one\n')
    expect(() =>
      statSync(`${fixturesDirectory}/filesystem/alpha.txt`),
    ).toThrow()
  })

  it('removes a file', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem()

    await filesystem.remove(`${fixturesDirectory}/filesystem/alpha.txt`)

    expect(() =>
      statSync(`${fixturesDirectory}/filesystem/alpha.txt`),
    ).toThrow()
  })

  it('removes a directory tree', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem/tree/one`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/tree/one/alpha.txt`, 'one\n')
    const filesystem = new Filesystem()

    await filesystem.removeTree(`${fixturesDirectory}/filesystem/tree`)

    expect(() => statSync(`${fixturesDirectory}/filesystem/tree`)).toThrow()
  })

  it('when the path is a file, isDirectory is false', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = new Filesystem()

    const directory = await filesystem.isDirectory(
      `${fixturesDirectory}/filesystem/alpha.txt`,
    )

    expect(directory).toBe(false)
  })

  it('when the path is a directory, isDirectory is true', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    const filesystem = new Filesystem()

    const directory = await filesystem.isDirectory(
      `${fixturesDirectory}/filesystem`,
    )

    expect(directory).toBe(true)
  })

  it('lists the child paths of a directory', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem/alpha`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/beta.txt`, 'one\n')
    const filesystem = new Filesystem()

    const entries = await filesystem.directoryEntries(
      `${fixturesDirectory}/filesystem`,
    )

    expect(entries).toEqual([
      `${fixturesDirectory}/filesystem/alpha`,
      `${fixturesDirectory}/filesystem/beta.txt`,
    ])
  })

  it('when the path exists, assertExists resolves', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    const filesystem = new Filesystem()

    const assertion = filesystem.assertExists(`${fixturesDirectory}/filesystem`)

    await expect(assertion).resolves.toBeUndefined()
  })

  it('when the path is missing, assertExists rejects', async () => {
    const filesystem = new Filesystem()

    const assertion = filesystem.assertExists(
      `${fixturesDirectory}/filesystem/missing`,
    )

    await expect(assertion).rejects.toThrow()
  })

  it('resolves the real path', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem/one`, { recursive: true })
    const filesystem = new Filesystem()

    const realPath = await filesystem.realPath(
      `${fixturesDirectory}/filesystem/one/..`,
    )

    expect(realPath).toBe(realpathSync(`${fixturesDirectory}/filesystem`))
  })

  it('when the error is a missing file, isNotFound is true', async () => {
    const filesystem = new Filesystem()
    const error = await filesystem
      .readTextFile(`${fixturesDirectory}/filesystem/missing`)
      .catch((caught) => caught)

    const notFound = filesystem.isNotFound(error)

    expect(notFound).toBe(true)
  })

  it('when the error is not a missing file, isNotFound is false', () => {
    const filesystem = new Filesystem()

    const notFound = filesystem.isNotFound(new SyntaxError('bad json'))

    expect(notFound).toBe(false)
  })

  it('when built by default, reads through the node filesystem', async () => {
    mkdirSync(`${fixturesDirectory}/filesystem`, { recursive: true })
    writeFileSync(`${fixturesDirectory}/filesystem/alpha.txt`, 'one\n')
    const filesystem = defaultFilesystem()

    const text = await filesystem.readTextFile(
      `${fixturesDirectory}/filesystem/alpha.txt`,
    )

    expect(text).toBe('one\n')
  })
})
