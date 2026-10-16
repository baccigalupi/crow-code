import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { resolve } from '@std/path'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitLogHistory } from '../../../../../src/tools/git/read-only/log/history.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitLogHistory', () => {
  it('when no arguments are given, returns the last twenty history entries', async () => {
    const stdout = [
      'abc123\x1fAda\x1f2026-10-01T10:00:00+00:00\x1fAdd login',
      'def456\x1fGrace\x1f2026-10-02T11:00:00+00:00\x1fFix tests',
    ].join('\n') + '\n'
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout, commandSpy }),
    })

    const history = gitLogHistory({ applicationData })
    await history.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['log', '--format=%H%x1f%an%x1f%aI%x1f%s', '-n', '20'] },
      ],
    })
    expect(history.result()).toEqual([
      {
        sha: 'abc123',
        author: 'Ada',
        date: '2026-10-01T10:00:00+00:00',
        subject: 'Add login',
      },
      {
        sha: 'def456',
        author: 'Grace',
        date: '2026-10-02T11:00:00+00:00',
        subject: 'Fix tests',
      },
    ])
  })

  it('when a count is given, limits the history to that many entries', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const history = gitLogHistory({
      applicationData,
      operationArguments: { count: 5 },
    })
    await history.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        { args: ['log', '--format=%H%x1f%an%x1f%aI%x1f%s', '-n', '5'] },
      ],
    })
  })

  it('when a filter is present, limits the history to those paths', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const history = gitLogHistory({
      applicationData,
      operationArguments: {
        filter: ['src/a.ts', 'tests/a.test.ts'],
      },
    })
    await history.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        {
          args: [
            'log',
            '--format=%H%x1f%an%x1f%aI%x1f%s',
            '-n',
            '20',
            '--',
            'src/a.ts',
            'tests/a.test.ts',
          ],
        },
      ],
    })
  })

  it('when a filter path is outside the repository, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(Deno.cwd(), '..', 'outside-git-log-history.ts')
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const history = gitLogHistory({
      applicationData,
      operationArguments: { filter: [path] },
    })
    await history.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(history.success()).toBe(false)
    expect(history.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Git log history: path not allowed: ${path}`,
    )
  })

  it('when git cannot be executed, returns an empty list', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const history = gitLogHistory({ applicationData })
    await history.run()

    expect(history.success()).toBe(false)
    expect(history.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git log history: No such file or directory (os error 2): git',
    )
  })
})
