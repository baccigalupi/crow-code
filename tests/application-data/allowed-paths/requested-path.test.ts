import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import {
  RequestedPath,
  requestedPath,
} from '../../../src/application-data/allowed-paths/requested-path.ts'
import { Runtime } from '../../../src/application-data/runtime.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockEnvironment } from '../../support/mock-environment.ts'
import { clearDirectory, fixturesDirectory } from '../../support/fixtures.ts'

describe('requested-path', () => {
  beforeEach(() => clearDirectory(`${fixturesDirectory}/requested-path`))
  afterEach(() => clearDirectory(`${fixturesDirectory}/requested-path`))

  it('when the path is a child of an allowed directory, isAllowed is true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, 'git-diff.diff'),
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when the path is the parent of the allowed directory, isAllowed is false', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, '..'),
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(false)
  })

  it('when the path is the allowed directory itself, isAllowed is true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: directory,
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when the path climbs out through a sibling, isAllowed is false', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, '..', 'devin-config.json'),
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(false)
  })

  it('when a child is named with leading dots, isAllowed is true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, '..hidden'),
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when the path is relative, resolves it against the runtime working directory', async () => {
    const runtime = new Runtime(
      Deno,
      mockEnvironment({}),
      join(fixturesDirectory, 'tools'),
    )
    const requested = requestedPath({
      path: 'git/git-diff.diff',
      allowedDirectories: [join(fixturesDirectory, 'tools', 'git')],
      ignoredPaths: [],
      runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when the path points outside the allowed directory through a symlink, isAllowed is false', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/requested-path/inside`, {
      recursive: true,
    })
    Deno.mkdirSync(`${fixturesDirectory}/requested-path/outside`)
    Deno.writeTextFileSync(
      `${fixturesDirectory}/requested-path/outside/secret.txt`,
      'one\n',
    )
    Deno.symlinkSync(
      `${fixturesDirectory}/requested-path/outside`,
      `${fixturesDirectory}/requested-path/inside/escape`,
    )
    const applicationData = mockApplicationData()
    const requested = requestedPath({
      path: `${fixturesDirectory}/requested-path/inside/escape/secret.txt`,
      allowedDirectories: [`${fixturesDirectory}/requested-path/inside`],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(false)
  })

  it('when the path does not exist under an allowed directory, isAllowed is true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, 'missing.txt'),
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when the path is inside an ignored path, isAllowed is false', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools')
    const requested = requestedPath({
      path: join(directory, 'git', 'git-diff.diff'),
      allowedDirectories: [directory],
      ignoredPaths: [join(directory, 'git')],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(false)
  })

  it('when the real path is inside an ignored path, isAllowed is false', async () => {
    Deno.mkdirSync(`${fixturesDirectory}/requested-path/ignored`, {
      recursive: true,
    })
    Deno.symlinkSync(
      `${fixturesDirectory}/requested-path/ignored`,
      `${fixturesDirectory}/requested-path/link`,
    )
    const applicationData = mockApplicationData()
    const requested = requestedPath({
      path: `${fixturesDirectory}/requested-path/link`,
      allowedDirectories: [`${fixturesDirectory}/requested-path`],
      ignoredPaths: [`${fixturesDirectory}/requested-path/ignored`],
      runtime: applicationData.runtime,
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(false)
  })

  it('when called through requestedPath, returns a RequestedPath', () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')

    const requested = requestedPath({
      path: join(directory, 'git-diff.diff'),
      allowedDirectories: [directory],
      ignoredPaths: [],
      runtime: applicationData.runtime,
    })

    expect(requested).toBeInstanceOf(RequestedPath)
  })
})
