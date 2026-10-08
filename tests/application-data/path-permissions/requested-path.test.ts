import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { assertSpyCall, returnsNext, spy, stub } from '@std/testing/mock'
import {
  RequestedPath,
  requestedPath,
} from '../../../src/application-data/path-permissions/requested-path.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'

describe('requested-path', () => {
  it('when the path is a child of an allowed directory, isAllowed is true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, 'git-diff.diff'),
      allowedDirectories: [directory],
      getRealPath: applicationData.getRealPath(),
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
      getRealPath: applicationData.getRealPath(),
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
      getRealPath: applicationData.getRealPath(),
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
      getRealPath: applicationData.getRealPath(),
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
      getRealPath: applicationData.getRealPath(),
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when the path is relative, resolves it against the current working directory before following symlinks', async () => {
    const applicationData = mockApplicationData()
    const fakeRealPath = spy(
      returnsNext([Promise.resolve(join(Deno.cwd(), 'deno.json'))]),
    )
    using _realPath = stub(applicationData, 'getRealPath', () => fakeRealPath)
    const requested = requestedPath({
      path: 'deno.json',
      allowedDirectories: [Deno.cwd()],
      getRealPath: applicationData.getRealPath(),
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
    assertSpyCall(fakeRealPath, 0, {
      args: [join(Deno.cwd(), 'deno.json')],
    })
  })

  it('when the path points outside the allowed directory through a symlink, isAllowed is false', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const outside = join(fixturesDirectory, 'devin-config.json')
    const fakeRealPath = spy(returnsNext([Promise.resolve(outside)]))
    using _realPath = stub(applicationData, 'getRealPath', () => fakeRealPath)
    const requested = requestedPath({
      path: join(directory, 'escape', 'git-diff.diff'),
      allowedDirectories: [directory],
      getRealPath: applicationData.getRealPath(),
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(false)
    expect(fakeRealPath.calls).toHaveLength(1)
  })

  it('when the path does not exist under an allowed directory, isAllowed is true', async () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')
    const requested = requestedPath({
      path: join(directory, 'missing.txt'),
      allowedDirectories: [directory],
      getRealPath: applicationData.getRealPath(),
    })

    const allowed = await requested.isAllowed()

    expect(allowed).toBe(true)
  })

  it('when called through requestedPath, returns a RequestedPath', () => {
    const applicationData = mockApplicationData()
    const directory = join(fixturesDirectory, 'tools', 'git')

    const requested = requestedPath({
      path: join(directory, 'git-diff.diff'),
      allowedDirectories: [directory],
      getRealPath: applicationData.getRealPath(),
    })

    expect(requested).toBeInstanceOf(RequestedPath)
  })
})
