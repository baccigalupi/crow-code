import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { assertSpyCall, spy } from '@std/testing/mock'
import { ApplicationData } from '../../../../src/application-data.ts'
import { gitBlame } from '../../../../src/tools/git/read-only/blame.ts'
import { pathPermissions } from '../../../../src/application-data/path-permissions.ts'
import { fixturesDirectory } from '../../../support/fixtures.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../../support/mock-deno-command.ts'

describe('gitBlame', () => {
  it('returns structured blame data for each line of the file', async () => {
    const stdout = [
      'abc123abc123abc123abc123abc123abc123abcd 1 1 1',
      'author Ada',
      'author-mail <a@b.c>',
      'author-time 1700000000',
      'author-tz +0000',
      'committer Ada',
      'committer-mail <a@b.c>',
      'committer-time 1700000000',
      'committer-tz +0000',
      'summary Add login',
      'filename src/a.ts',
      '\tconst a = 1',
      '^def456def456def456def456def456def456def4 2 2 1',
      'author Grace',
      'author-mail <a@b.c>',
      'author-time 1700000060',
      'author-tz +0000',
      'committer Grace',
      'committer-mail <a@b.c>',
      'committer-time 1700000060',
      'committer-tz +0000',
      'summary Fix tests',
      'filename src/a.ts',
      '\tconst b = 2',
      '',
    ].join('\n')
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout, commandSpy }),
    })

    const blame = gitBlame({
      applicationData,
      operationArguments: { path: 'src/a.ts' },
    })
    await blame.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['blame', '--line-porcelain', '--', 'src/a.ts'] },
      ],
    })
    expect(blame.result()).toEqual([
      {
        line: 1,
        sha: 'abc123abc123abc123abc123abc123abc123abcd',
        author: 'Ada',
        date: '2023-11-14T22:13:20.000Z',
        summary: 'Add login',
        content: 'const a = 1',
      },
      {
        line: 2,
        sha: 'def456def456def456def456def456def456def4',
        author: 'Grace',
        date: '2023-11-14T22:14:20.000Z',
        summary: 'Fix tests',
        content: 'const b = 2',
      },
    ])
  })

  it('when start and end are given, limits the blame to that line range', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })

    const blame = gitBlame({
      applicationData,
      operationArguments: { path: 'src/a.ts', start: 10, end: 20 },
    })
    await blame.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        {
          args: ['blame', '--line-porcelain', '-L', '10,20', '--', 'src/a.ts'],
        },
      ],
    })
  })

  it('when only start is given, blames from that line to the end of file', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })

    const blame = gitBlame({
      applicationData,
      operationArguments: { path: 'src/a.ts', start: 10 },
    })
    await blame.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['blame', '--line-porcelain', '-L', '10,', '--', 'src/a.ts'] },
      ],
    })
  })

  it('when a rev is given, blames the file at that revision', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })

    const blame = gitBlame({
      applicationData,
      operationArguments: { path: 'src/a.ts', rev: 'abc123' },
    })
    await blame.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        {
          args: ['blame', '--line-porcelain', 'abc123', '--', 'src/a.ts'],
        },
      ],
    })
  })

  it('when the path is outside the repository, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
      gitPathPermissions: pathPermissions({
        applicationData: new ApplicationData(),
        allowedDirectories: [join(fixturesDirectory, 'tools', 'git')],
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const blame = gitBlame({
      applicationData,
      operationArguments: { path: 'src/a.ts' },
    })
    await blame.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(blame.success()).toBe(false)
    expect(blame.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git blame: path not allowed: src/a.ts',
    )
  })

  it('when git cannot be executed, returns an empty list', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const blame = gitBlame({
      applicationData,
      operationArguments: { path: 'src/a.ts' },
    })
    await blame.run()

    expect(blame.success()).toBe(false)
    expect(blame.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git blame: No such file or directory (os error 2): git',
    )
  })
})
