import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { returnsNext, spy, stub } from '@std/testing/mock'
import {
  PathPermissions,
  pathPermissions,
} from '../../src/tools/path-permissions.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { fixturesDirectory } from '../support/fixtures.ts'

describe('path-permissions', () => {
  it('when the path is inside an allowed directory, allows it', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const allowed = await permissions.allows(join(directory, 'git-diff.diff'))

    expect(allowed).toBe(true)
  })

  it('when the path is outside every allowed directory, refuses it', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const allowed = await permissions.allows(
      join(fixturesDirectory, 'devin-config.json'),
    )

    expect(allowed).toBe(false)
  })

  it('when no allowed directories are given, allows a path under the current working directory', async () => {
    const applicationData = mockApplicationData()
    const permissions = pathPermissions({ applicationData })

    const allowed = await permissions.allows('deno.json')

    expect(allowed).toBe(true)
  })

  it('when no allowed directories are given, refuses a path above the current working directory', async () => {
    const applicationData = mockApplicationData()
    const permissions = pathPermissions({ applicationData })

    const allowed = await permissions.allows(join('..', 'outside.txt'))

    expect(allowed).toBe(false)
  })

  it('when an allowed directory is relative, resolves it against the current working directory', async () => {
    const applicationData = mockApplicationData()
    const mockDenoRealPath = spy(
      returnsNext([Promise.resolve(join(Deno.cwd(), 'deno.json'))]),
    )
    using _realPath = stub(
      applicationData,
      'getRealPath',
      () => mockDenoRealPath,
    )
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: ['.'],
    })

    const allowed = await permissions.allows('deno.json')

    expect(allowed).toBe(true)
  })

  it('when an allowed directory does not exist, still allows paths named under it', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'missing-directory')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const allowed = await permissions.allows(join(directory, 'file.txt'))

    expect(allowed).toBe(true)
  })

  it('when several directories are given, allows a path under the second', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [join(fixturesDirectory, 'style-checks'), directory],
    })

    const allowed = await permissions.allows(
      join(directory, 'git-diff-files.txt'),
    )

    expect(allowed).toBe(true)
  })

  it('when allows is called twice for the same path, resolves symlinks once', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const mockDenoRealPath = spy(
      returnsNext([
        Promise.resolve(join(directory, 'git-diff.diff')),
      ]),
    )
    using _realPath = stub(
      applicationData,
      'getRealPath',
      () => mockDenoRealPath,
    )
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    await permissions.allows(join(directory, 'git-diff.diff'))
    await permissions.allows(join(directory, 'git-diff.diff'))

    expect(mockDenoRealPath.calls).toHaveLength(1)
  })

  it('when every path is allowed, allowsEvery returns true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const allowed = await permissions.allowsEvery([
      join(directory, 'git-diff.diff'),
      join(directory, 'git-diff-files.txt'),
    ])

    expect(allowed).toBe(true)
  })

  it('when one path is refused, allowsEvery returns false', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const allowed = await permissions.allowsEvery([
      join(directory, 'git-diff.diff'),
      join(fixturesDirectory, 'devin-config.json'),
    ])

    expect(allowed).toBe(false)
  })

  it('when some paths are allowed, filterPaths returns only the allowed paths', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const filtered = await permissions.filterPaths([
      join(directory, 'git-diff.diff'),
      join(fixturesDirectory, 'devin-config.json'),
      join(directory, 'git-diff-files.txt'),
    ])

    expect(filtered).toEqual([
      join(directory, 'git-diff.diff'),
      join(directory, 'git-diff-files.txt'),
    ])
  })

  it('when every path is refused, filterPaths returns an empty array', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const filtered = await permissions.filterPaths([
      join(fixturesDirectory, 'devin-config.json'),
    ])

    expect(filtered).toEqual([])
  })

  it('when called through pathPermissions, returns a PathPermissions', () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')

    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    expect(permissions).toBeInstanceOf(PathPermissions)
  })
})
