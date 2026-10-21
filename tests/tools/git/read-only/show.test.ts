import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { gitShow } from '../../../../src/tools/git/read-only/show.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockCommand } from '../../../support/mock-command.ts'

describe('gitShow', () => {
  it('returns the contents of the file at the given revision', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'const a = 1\nconst b = 2\n',
        commandSpy,
      }),
    })

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123', path: 'src/a.ts' },
    })
    await show.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['show', 'abc123:src/a.ts'],
    })
    expect(show.result()).toEqual({
      path: 'src/a.ts',
      text: 'const a = 1\nconst b = 2\n',
    })
  })

  it('when no rev is given, shows the file at HEAD', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const show = gitShow({
      applicationData,
      operationArguments: { path: 'src/a.ts' },
    })
    await show.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['show', 'HEAD:src/a.ts'],
    })
  })

  it('when no path is given, returns the diff of each file in the commit', async () => {
    const stdout = [
      'commit abc123abc123abc123abc123abc123abc123abcd',
      'Author: Ada <a@b.c>',
      'Date:   Tue Nov 14 22:13:20 2023 +0000',
      '',
      '    Add login',
      '',
      'diff --git a/src/a.ts b/src/a.ts',
      'index 1111111..2222222 100644',
      '--- a/src/a.ts',
      '+++ b/src/a.ts',
      '@@ -1 +1,2 @@',
      ' const a = 1',
      '+const b = 2',
      'diff --git a/src/b.ts b/src/b.ts',
      'index 3333333..4444444 100644',
      '--- a/src/b.ts',
      '+++ b/src/b.ts',
      '@@ -1 +1 @@',
      '-const c = 3',
      '+const c = 4',
      '',
    ].join('\n')
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout, commandSpy }),
    })

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123' },
    })
    await show.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['show', 'abc123'],
    })
    const diffs = show.result()
    expect(diffs).toEqual([
      {
        path: 'src/a.ts',
        diff: [
          'diff --git a/src/a.ts b/src/a.ts',
          'index 1111111..2222222 100644',
          '--- a/src/a.ts',
          '+++ b/src/a.ts',
          '@@ -1 +1,2 @@',
          ' const a = 1',
          '+const b = 2',
          '',
        ].join('\n'),
      },
      {
        path: 'src/b.ts',
        diff: [
          'diff --git a/src/b.ts b/src/b.ts',
          'index 3333333..4444444 100644',
          '--- a/src/b.ts',
          '+++ b/src/b.ts',
          '@@ -1 +1 @@',
          '-const c = 3',
          '+const c = 4',
          '',
        ].join('\n'),
      },
    ])
  })

  it('when the path is outside the allowed directories, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-git-show.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123', path },
    })
    await show.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(show.success()).toBe(false)
    expect(show.result()).toEqual({ path, text: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git show: path not allowed: ${path}`,
    )
  })

  it('when the path uses git pathspec magic, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123', path: ':/src/a.ts' },
    })
    await show.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(show.success()).toBe(false)
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git show: path not allowed: :/src/a.ts',
    )
  })

  it('when git fails to show the commit, returns an empty diff list', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: 'fatal: bad revision abc123',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123' },
    })
    await show.run()

    expect(show.success()).toBe(false)
    expect(show.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git show: fatal: bad revision abc123',
    )
  })

  it('when git cannot be executed, returns empty file contents', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123', path: 'src/a.ts' },
    })
    await show.run()

    expect(show.success()).toBe(false)
    expect(show.result()).toEqual({ path: 'src/a.ts', text: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git show: No such file or directory (os error 2): git',
    )
  })

  it('when git exits with an error, returns empty file contents', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 128,
        stderr: "fatal: path 'src/a.ts' does not exist in 'abc123'",
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const show = gitShow({
      applicationData,
      operationArguments: { rev: 'abc123', path: 'src/a.ts' },
    })
    await show.run()

    expect(show.success()).toBe(false)
    expect(show.result()).toEqual({ path: 'src/a.ts', text: '' })
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      "Git show: fatal: path 'src/a.ts' does not exist in 'abc123'",
    )
  })
})
