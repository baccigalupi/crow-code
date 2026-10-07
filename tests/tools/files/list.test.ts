import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy } from '@std/testing/mock'
import { ListDirectory, listDirectory } from '../../../src/tools/files/list.ts'
import { pathPermissions } from '../../../src/tools/path-permissions.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'

describe('list', () => {
  it('when not recursive, lists the direct children sorted by path', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files')

    const listing = listDirectory({
      applicationData,
      operationArguments: { path },
    })
    await listing.run()

    expect(listing.success()).toBe(true)
    expect(listing.result()).toEqual({
      path,
      entries: [
        { path: 'alpha.txt', kind: 'file' },
        { path: 'escape', kind: 'symlink' },
        { path: 'nested', kind: 'directory' },
      ],
    })
  })

  it('when recursive, includes nested entries and does not follow symlinks', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files')

    const listing = listDirectory({
      applicationData,
      operationArguments: { path, recursive: true },
    })
    await listing.run()

    expect(listing.success()).toBe(true)
    expect(listing.result().entries).toEqual([
      { path: 'alpha.txt', kind: 'file' },
      { path: 'escape', kind: 'symlink' },
      { path: 'nested', kind: 'directory' },
      { path: 'nested/beta.md', kind: 'file' },
    ])
  })

  it('when the path is outside the allowed directories, returns no entries and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [join(fixturesDirectory, 'tools', 'git')],
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const listing = listDirectory({
      applicationData,
      operationArguments: { path, pathPermissions: permissions },
    })
    await listing.run()

    expect(listing.success()).toBe(false)
    expect(listing.result()).toEqual({ path, entries: [] })
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `List directory: path not allowed: ${path}`,
    )
  })

  it('when the directory does not exist, returns no entries and logs', async () => {
    const applicationData = mockApplicationData()
    const path = join(fixturesDirectory, 'tools', 'files', 'missing')
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const listing = listDirectory({
      applicationData,
      operationArguments: { path },
    })
    await listing.run()

    expect(listing.success()).toBe(false)
    expect(listing.result()).toEqual({ path, entries: [] })
    expect(loggerErrorSpy.calls[0].args[0]).toContain('List directory: ')
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'No such file or directory',
    )
  })

  it('when no path permissions are given, allows a path under the current working directory', async () => {
    const applicationData = mockApplicationData()
    const path = join('tests', 'support', 'fixtures', 'tools', 'files')

    const listing = listDirectory({
      applicationData,
      operationArguments: { path },
    })
    await listing.run()

    expect(listing.success()).toBe(true)
    expect(listing.result().entries[0]).toEqual({
      path: 'alpha.txt',
      kind: 'file',
    })
  })

  it('when called through listDirectory, returns a ListDirectory', () => {
    const applicationData = mockApplicationData()

    const listing = listDirectory({
      applicationData,
      operationArguments: { path: 'tests' },
    })

    expect(listing).toBeInstanceOf(ListDirectory)
  })
})
