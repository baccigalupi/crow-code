import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { gitPathPermissions } from '../../src/application-data/git-path-permissions.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'

describe('gitPathPermissions', () => {
  it('bounds paths by the repository root', async () => {
    const applicationData = mockApplicationData()

    const permissions = gitPathPermissions({
      getRealPath: applicationData.getRealPath(),
      repositoryRoot: Deno.cwd(),
    })

    expect(await permissions.allows('src/tools/exec-cli.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })

  it('accepts a promised repository root', async () => {
    const applicationData = mockApplicationData()

    const permissions = gitPathPermissions({
      getRealPath: applicationData.getRealPath(),
      repositoryRoot: Promise.resolve(Deno.cwd()),
    })

    expect(await permissions.allows('src/tools/exec-cli.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })
})
