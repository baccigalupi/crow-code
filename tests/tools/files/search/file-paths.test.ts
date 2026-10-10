import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { filePaths } from '../../../../src/tools/files/search/file-paths.ts'
import {
  clearDirectory,
  createSearchFixtureNodeModules,
  fixturesDirectory,
  searchFixtureNodeModules,
} from '../../../support/fixtures.ts'

describe('file-paths', () => {
  beforeEach(createSearchFixtureNodeModules)
  afterEach(() => clearDirectory(searchFixtureNodeModules()))

  it('when no ignoredDirectories are given, skips node_modules', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ root }).all()

    expect(paths).toHaveLength(3)
    expect(paths).toContain('alpha.txt')
    expect(paths).toContain('nested/beta.md')
    expect(paths).toContain('nested/blob.bin')
  })

  it('when ignoredDirectories is empty, includes node_modules', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ root, ignoredDirectories: [] }).all()

    expect(paths).toHaveLength(4)
    expect(paths).toContain('node_modules/skipped.txt')
  })

  it('when ignoredDirectories names a directory, skips only that directory', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ root, ignoredDirectories: ['nested'] })
      .all()

    expect(paths).toHaveLength(2)
    expect(paths).toContain('alpha.txt')
    expect(paths).toContain('node_modules/skipped.txt')
  })

  it('when a filePattern glob is given, only matching paths are returned', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ root, filePattern: '*.md' }).all()

    expect(paths).toEqual(['nested/beta.md'])
  })

  it('when a filePattern has a directory part, it matches the relative path', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ root, filePattern: 'nested/**' }).all()

    expect(paths).toEqual(['nested/blob.bin', 'nested/beta.md'])
  })

  it('when an ignored name contains regex characters, does not skip similar names', async () => {
    const root = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ root, ignoredDirectories: ['n.sted'] })
      .all()

    expect(paths).toContain('nested/beta.md')
  })
})
