import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join, resolve } from '@std/path'
import { returnsNext, spy, stub } from '@std/testing/mock'
import {
  PathPermissions,
  pathPermissions,
} from '../../../src/application-data/allowed-paths/path-permissions.ts'
import { mockEnvironment } from '../../support/mock-environment.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { configWithIgnore } from '../../support/mock-crow-config.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'

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
      resolve(Deno.cwd(), '..', 'outside.txt'),
    )

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

  it('when an allowed directory starts with tilde, expands it from home', async () => {
    const home = join(fixturesDirectory, 'tools')
    const applicationData = mockApplicationData({
      envars: mockEnvironment({ HOME: home }),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: ['~/git'],
    })

    const allowed = await permissions.allows(join(home, 'git', 'git-diff.diff'))

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
      resolve(Deno.cwd(), '..', 'outside.txt'),
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
      resolve(Deno.cwd(), '..', 'outside.txt'),
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
      resolve(Deno.cwd(), '..', 'outside.txt'),
    ])

    expect(filtered).toEqual([])
  })

  it('when some paths are refused, forbiddenPaths returns only the refused paths', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const forbidden = await permissions.forbiddenPaths([
      join(directory, 'git-diff.diff'),
      resolve(Deno.cwd(), '..', 'outside.txt'),
      join(directory, 'git-diff-files.txt'),
    ])

    expect(forbidden).toEqual([resolve(Deno.cwd(), '..', 'outside.txt')])
  })

  it('when every path is allowed, forbiddenPaths returns an empty array', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const forbidden = await permissions.forbiddenPaths([
      join(directory, 'git-diff.diff'),
    ])

    expect(forbidden).toEqual([])
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

  it('when the path is inside an ignored directory, refuses it', async () => {
    const applicationData = mockApplicationData({
      config: configWithIgnore(['vendor']),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [Deno.cwd()],
    })

    const allowed = await permissions.allows('vendor/x.js')

    expect(allowed).toBe(false)
  })

  it('when the path is an ignored file, refuses it', async () => {
    const applicationData = mockApplicationData({
      config: configWithIgnore(['src/secret.txt']),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [Deno.cwd()],
    })

    const allowed = await permissions.allows('src/secret.txt')

    expect(allowed).toBe(false)
  })

  it('when a path shares only the name of an ignored directory deeper down, allows it', async () => {
    const applicationData = mockApplicationData({
      config: configWithIgnore(['vendor']),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [Deno.cwd()],
    })

    const allowed = await permissions.allows('src/vendor/x.js')

    expect(allowed).toBe(true)
  })

  it('when an ignored path starts with tilde, expands it from home', async () => {
    const home = join(fixturesDirectory, 'tools')
    const applicationData = mockApplicationData({
      envars: mockEnvironment({ HOME: home }),
      config: configWithIgnore(['~/git']),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [home],
    })

    const allowed = await permissions.allows(join(home, 'git', 'git-diff.diff'))

    expect(allowed).toBe(false)
  })

  it('when an ignored path is nested in an allowed directory, refuses inside it and allows beside it', async () => {
    const directory = join(fixturesDirectory, 'tools')
    const applicationData = mockApplicationData({
      config: configWithIgnore([join(directory, 'git')]),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const inside = await permissions.allows(join(directory, 'git', 'a'))
    const beside = await permissions.allows(join(directory, 'other', 'a'))

    expect(inside).toBe(false)
    expect(beside).toBe(true)
  })

  it('when a symlink resolves into an ignored path, refuses it', async () => {
    const directory = join(fixturesDirectory, 'tools')
    const ignored = join(directory, 'git')
    const applicationData = mockApplicationData({
      config: configWithIgnore([ignored]),
    })
    const realPath = spy(returnsNext([Promise.resolve(join(ignored, 'a'))]))
    using _realPath = stub(applicationData, 'getRealPath', () => realPath)
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [directory],
    })

    const allowed = await permissions.allows(join(directory, 'link'))

    expect(allowed).toBe(false)
  })

  it('when asked for ignored paths, returns them resolved to absolute paths', () => {
    const applicationData = mockApplicationData({
      config: configWithIgnore(['/abs/dir', '/abs/../other']),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [Deno.cwd()],
    })

    const ignored = permissions.ignoredPaths()

    expect(ignored).toEqual([
      '/abs/dir',
      '/other',
      join(Deno.cwd(), '.git'),
    ])
  })
})
