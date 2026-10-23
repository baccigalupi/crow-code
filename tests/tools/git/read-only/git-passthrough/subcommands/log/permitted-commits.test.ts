import { describe, expect, it } from 'bun:test'
import { CrowConfig } from '../../../../../../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../../../../../../src/domain/config.ts'
import { PermittedCommits } from '../../../../../../../src/tools/git/read-only/git-passthrough/subcommands/log/permitted-commits.ts'
import { mockApplicationData } from '../../../../../../support/mock-application-data.ts'

describe('PermittedCommits', () => {
  it('when there are no commits, returns []', async () => {
    const applicationData = mockApplicationData({ cwd: '/work' })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([])
  })

  it('when a commit has no files, stat or patch, returns it without adding them', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: '/work',
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
        },
      ],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
      },
    ])
  })

  it('when files include a forbidden path, removes that file', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: '/work',
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          files: [
            { status: 'M', path: 'allowed.txt' },
            { status: 'A', path: 'denied.txt' },
          ],
        },
      ],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        files: [{ status: 'M', path: 'allowed.txt' }],
      },
    ])
  })

  it('when stat paths include a forbidden path, removes that path and keeps the summary', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: '/work',
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          stat: {
            summary: { changed: 2, insertions: 2, deletions: 1 },
            paths: [
              { path: 'allowed.txt', changes: '2 +-' },
              { path: 'denied.txt', changes: '1 +' },
            ],
          },
        },
      ],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        stat: {
          summary: { changed: 2, insertions: 2, deletions: 1 },
          paths: [{ path: 'allowed.txt', changes: '2 +-' }],
        },
      },
    ])
  })

  it('when the patch touches a forbidden path, removes that hunk', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: '/work',
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          patch:
            'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two\ndiff --git a/denied.txt b/denied.txt\n@@ -1 +1 @@\n-secret\n+secrets',
        },
      ],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        patch:
          'diff --git a/allowed.txt b/allowed.txt\n@@ -1 +1 @@\n-one\n+two',
      },
    ])
  })

  it('when one commit has a stat and another a patch, filters each its own way', async () => {
    const defaults = defaultCrowConfig()
    const applicationData = mockApplicationData({
      cwd: '/work',
      config: new CrowConfig('.', {
        ...defaults,
        permissions: { ...defaults.permissions, ignore: ['denied.txt'] },
      }),
    })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          stat: {
            summary: { changed: 1, insertions: 1, deletions: 0 },
            paths: [{ path: 'denied.txt', changes: '1 +' }],
          },
        },
        {
          sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
          author: 'Grace',
          date: '2026-10-01T10:00:00+00:00',
          subject: 'Add login',
          patch: 'diff --git a/denied.txt b/denied.txt\n@@ -0,0 +1 @@\n+secret',
        },
      ],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        stat: {
          summary: { changed: 1, insertions: 1, deletions: 0 },
          paths: [],
        },
      },
      {
        sha: 'ffd175847ab5c34abf8e3a66c4bab26b9ef87939',
        author: 'Grace',
        date: '2026-10-01T10:00:00+00:00',
        subject: 'Add login',
        patch: '',
      },
    ])
  })

  it('when nothing is forbidden, returns the commits unchanged', async () => {
    const applicationData = mockApplicationData({ cwd: '/work' })
    const permitted = new PermittedCommits({
      permissions: applicationData.gitPathPermissions(),
      commits: [
        {
          sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
          author: 'Ada',
          date: '2026-10-02T11:00:00+00:00',
          subject: 'Fix tests',
          files: [{ path: 'allowed.txt' }],
        },
      ],
    })

    const commits = await permitted.permitted()

    expect(commits).toEqual([
      {
        sha: '7f2203f286226e6c29da25b8edb35b13a7efa7c6',
        author: 'Ada',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
        files: [{ path: 'allowed.txt' }],
      },
    ])
  })
})
