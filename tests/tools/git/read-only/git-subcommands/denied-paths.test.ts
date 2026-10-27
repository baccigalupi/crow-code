import { describe, expect, it } from 'bun:test'
import { CrowConfig } from '../../../../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../../../../src/domain/config.ts'
import { GitDeniedPaths } from '../../../../../src/tools/git/read-only/git-subcommands/denied-paths.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'

describe('GitDeniedPaths', () => {
  it('when every path is allowed, has no reason', async () => {
    const applicationData = mockApplicationData({ cwd: '/work' })
    const denied = new GitDeniedPaths({
      permissions: applicationData.gitPathPermissions(),
      paths: ['src/a.ts'],
    })

    const reason = await denied.reason()

    expect(reason).toBe('')
  })

  it('when there are no paths, has no reason', async () => {
    const applicationData = mockApplicationData({ cwd: '/work' })
    const denied = new GitDeniedPaths({
      permissions: applicationData.gitPathPermissions(),
      paths: [],
    })

    const reason = await denied.reason()

    expect(reason).toBe('')
  })

  it('when paths are forbidden, names every one', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: '/work',
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })
    const denied = new GitDeniedPaths({
      permissions: applicationData.gitPathPermissions(),
      paths: ['allowed.txt', 'denied.txt', '../x'],
    })

    const reason = await denied.reason()

    expect(reason).toBe('path not allowed: denied.txt, ../x')
  })

  it('when a path is a pathspec magic, denies it without checking permissions', async () => {
    const applicationData = mockApplicationData({ cwd: '/work' })
    const denied = new GitDeniedPaths({
      permissions: applicationData.gitPathPermissions(),
      paths: [':(top)x', 'src/a.ts'],
    })

    const reason = await denied.reason()

    expect(reason).toBe('path not allowed: :(top)x')
  })
})
