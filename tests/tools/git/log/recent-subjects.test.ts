import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitRecentSubjects } from '../../../../src/tools/git/log/recent-subjects.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../../support/mock-deno-command.ts'

describe('gitRecentSubjects', () => {
  it('when no count is given, returns the last ten commit subjects', async () => {
    const stdout = 'Add login\nFix tests\n'
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ stdout, commandSpy }),
    })

    const subjects = gitRecentSubjects({ applicationData })
    await subjects.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['log', '--format=%s', '-n', '10'] }],
    })
    expect(subjects.result()).toEqual(['Add login', 'Fix tests'])
  })

  it('when a count is given, limits the log to that many subjects', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })

    const subjects = gitRecentSubjects({
      applicationData,
      commandArguments: { count: 3 },
    })
    await subjects.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['log', '--format=%s', '-n', '3'] }],
    })
  })

  it('when git cannot be executed, returns an empty list', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const subjects = gitRecentSubjects({ applicationData })
    await subjects.run()

    expect(subjects.success()).toBe(false)
    expect(subjects.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: No such file or directory (os error 2): git',
    )
  })
})
