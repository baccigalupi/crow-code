import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join, resolve } from '@std/path'
import {
  PathPermissions,
  pathPermissions,
} from '../../../src/application-data/allowed-paths/path-permissions.ts'
import { Runtime } from '../../../src/application-data/runtime.ts'
import { Environment } from '../../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../../src/application-data/filesystem.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { CrowConfig } from '../../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../../src/domain/config.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('path-permissions', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/path-permissions`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/path-permissions`))

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

  it('when an allowed directory is relative, resolves it against the runtime working directory', async () => {
    const applicationData = mockApplicationData()
    applicationData.runtime = new Runtime(
      Deno,
      join(fixturesDirectory, 'tools', 'git'),
    )
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: ['../search'],
    })

    const allowed = await permissions.allows(
      join(fixturesDirectory, 'tools', 'search', 'alpha.txt'),
    )

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
      envars: new Environment({
        runtimeEnvironment: { HOME: home },
        filesystem: defaultFilesystem(),
      }),
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

  it('when allows is called twice for the same path, keeps the first verdict', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/path-permissions/inside`, {
      recursive: true,
    })
    Deno.mkdirSync(`${fixturesDirectory}/path-permissions/outside`)
    Deno.symlinkSync(
      `${fixturesDirectory}/path-permissions/outside`,
      `${fixturesDirectory}/path-permissions/inside/escape`,
    )
    const applicationData = mockApplicationData()
    applicationData.runtime = new Runtime(
      Deno,
      `${fixturesDirectory}/path-permissions/inside`,
    )
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [],
    })
    await permissions.allows(
      `${fixturesDirectory}/path-permissions/inside/escape`,
    )
    Deno.removeSync(`${fixturesDirectory}/path-permissions/inside/escape`)

    const allowed = await permissions.allows(
      `${fixturesDirectory}/path-permissions/inside/escape`,
    )

    expect(allowed).toBe(false)
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
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: ['vendor'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
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
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: ['src/secret.txt'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
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
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: ['vendor'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
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
      envars: new Environment({
        runtimeEnvironment: { HOME: home },
        filesystem: defaultFilesystem(),
      }),
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: ['~/git'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
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
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: [join(directory, 'git')],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
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
    Deno.mkdirSync(`${fixturesDirectory}/path-permissions/ignored`, {
      recursive: true,
    })
    Deno.symlinkSync(
      `${fixturesDirectory}/path-permissions/ignored`,
      `${fixturesDirectory}/path-permissions/link`,
    )
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: [`${fixturesDirectory}/path-permissions/ignored`],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
    })
    const permissions = pathPermissions({
      applicationData,
      allowedDirectories: [`${fixturesDirectory}/path-permissions`],
    })

    const allowed = await permissions.allows(
      `${fixturesDirectory}/path-permissions/link`,
    )

    expect(allowed).toBe(false)
  })

  it('when asked for ignored paths, returns them resolved to absolute paths', () => {
    const applicationData = mockApplicationData({
      config: new CrowConfig('.', {
        ...defaultCrowConfig(),
        permissions: {
          ignore: ['/abs/dir', '/abs/../other'],
          additionalRead: [],
          additionalWrite: [],
          escalateRead: [],
          escalateWrite: [],
        },
      }),
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
