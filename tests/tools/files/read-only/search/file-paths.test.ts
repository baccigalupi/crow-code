import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { filePaths } from '../../../../../src/tools/files/read-only/search/file-paths.ts'
import {
  clearDirectory,
  createSearchFixtureNodeModules,
  fixturesDirectory,
  searchFixtureNodeModules,
} from '../../../../support/fixtures.ts'

describe('file-paths', () => {
  beforeEach(createSearchFixtureNodeModules)
  afterEach(async () => {
    await clearDirectory(searchFixtureNodeModules())
    await clearDirectory(join(fixturesDirectory, 'tools', 'search', '.dir'))
    await clearDirectory(
      join(fixturesDirectory, 'tools', 'search', '.hidden.md'),
    )
  })

  it('when no ignoredDirectories are given, includes every file', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ directory }).all()

    expect(paths).toHaveLength(4)
    expect(paths).toContain('alpha.txt')
    expect(paths).toContain('nested/beta.md')
    expect(paths).toContain('nested/blob.bin')
    expect(paths).toContain('node_modules/skipped.txt')
  })

  it('when ignoredDirectories names an absolute directory, skips only that directory', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({
      directory,
      ignoredDirectories: [join(directory, 'nested')],
    }).all()

    expect(paths).toHaveLength(2)
    expect(paths).toContain('alpha.txt')
    expect(paths).toContain('node_modules/skipped.txt')
  })

  it('when a filePattern glob is given, only matching paths are returned', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ directory, filePattern: '*.md' }).all()

    expect(paths).toEqual(['nested/beta.md'])
  })

  it('when a filePattern has a directory part, it matches the relative path', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({ directory, filePattern: 'nested/**' }).all()

    expect(paths).toEqual(['nested/beta.md', 'nested/blob.bin'])
  })

  it('when a filePattern is a glob, matches dotfiles', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')
    Deno.writeTextFileSync(join(directory, '.hidden.md'), 'hidden')

    const paths = await filePaths({ directory, filePattern: '*.md' }).all()

    expect(paths).toContain('.hidden.md')
    expect(paths).toContain('nested/beta.md')
  })

  it('when a filePattern is a glob, matches dot directories', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')
    Deno.mkdirSync(join(directory, '.dir'), { recursive: true })
    Deno.writeTextFileSync(join(directory, '.dir', 'inner.md'), 'inner')

    const paths = await filePaths({ directory, filePattern: '**/*.md' }).all()

    expect(paths).toContain('.dir/inner.md')
  })

  it('when an ignored name contains regex characters, does not skip similar names', async () => {
    const directory = join(fixturesDirectory, 'tools', 'search')

    const paths = await filePaths({
      directory,
      ignoredDirectories: [join(directory, 'n.sted')],
    }).all()

    expect(paths).toContain('nested/beta.md')
  })
})
