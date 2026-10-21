import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { walk } from '../../../../src/tools/files/read-only/walk.ts'
import { clearDirectory, fixturesDirectory } from '../../../support/fixtures.ts'

describe('walk', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'walk')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'walk')))

  it('when directories and symlinks are excluded at depth 1, lists only the files in the root', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files')

    const walked = await walk(directory, {
      maxDepth: 1,
      includeDirs: false,
      includeSymlinks: false,
    })

    expect(walked).toHaveLength(1)
    expect(walked[0].name).toBe('alpha.txt')
  })

  it('when no options are given, lists nested entries right after their directory', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files')

    const walked = await walk(directory)

    expect(walked).toHaveLength(4)
    expect(walked[0].name).toBe('alpha.txt')
    expect(walked[1].name).toBe('escape')
    expect(walked[2].name).toBe('nested')
    expect(walked[3].name).toBe('beta.md')
    expect(walked[3].path).toBe(join(directory, 'nested', 'beta.md'))
  })

  it('when maxDepth is 1, lists children without descending', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files')

    const walked = await walk(directory, { maxDepth: 1 })

    expect(walked).toHaveLength(3)
    expect(walked[2].name).toBe('nested')
  })

  it('when an entry is a symlink, reports it as a symlink', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files')

    const walked = await walk(directory, { maxDepth: 1 })

    expect(walked[1]).toEqual({
      path: join(directory, 'escape'),
      name: 'escape',
      isFile: false,
      isDirectory: false,
      isSymlink: true,
    })
  })

  it('when symlinks and directories are excluded, lists only files, including nested ones', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files')

    const walked = await walk(directory, {
      includeSymlinks: false,
      includeDirs: false,
    })

    expect(walked).toHaveLength(2)
    expect(walked[0].name).toBe('alpha.txt')
    expect(walked[1].name).toBe('beta.md')
  })

  it('when a directory matches an ignore pattern, leaves it and its contents out', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files')

    const walked = await walk(directory, { ignore: [/\/nested$/] })

    expect(walked).toHaveLength(2)
    expect(walked[1].name).toBe('escape')
  })

  it('when a directory holds several entries, yields them sorted by name', async () => {
    const directory = join(fixturesDirectory, 'walk', 'sorted')
    mkdirSync(directory, { recursive: true })
    writeFileSync(join(directory, 'c.txt'), 'c')
    writeFileSync(join(directory, 'b.txt'), 'b')
    writeFileSync(join(directory, 'a.txt'), 'a')

    const walked = await walk(directory)

    expect(walked[0].name).toBe('a.txt')
    expect(walked[1].name).toBe('b.txt')
    expect(walked[2].name).toBe('c.txt')
  })

  it('when the root is missing, rejects with the operating system error', async () => {
    const directory = join(fixturesDirectory, 'tools', 'files', 'missing')

    const walking = walk(directory)

    await expect(walking).rejects.toThrow('no such file or directory')
  })
})
