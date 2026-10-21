import { describe, expect, it, mock, spyOn } from 'bun:test'
import { gitRecentSubjects } from '../../../../../src/tools/git/read-only/log/recent-subjects.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitRecentSubjects', () => {
  it('when no count is given, returns the last ten commit subjects', async () => {
    const stdout = 'Add login\nFix tests\n'
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ stdout, commandSpy }),
    })

    const subjects = gitRecentSubjects({ applicationData })
    await subjects.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['log', '--format=%s', '-n', '10'],
    })
    expect(subjects.result()).toEqual(['Add login', 'Fix tests'])
  })

  it('when a count is given, limits the log to that many subjects', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })

    const subjects = gitRecentSubjects({
      applicationData,
      operationArguments: { count: 3 },
    })
    await subjects.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['log', '--format=%s', '-n', '3'],
    })
  })

  it('when git cannot be executed, returns an empty list', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')

    const subjects = gitRecentSubjects({ applicationData })
    await subjects.run()

    expect(subjects.success()).toBe(false)
    expect(subjects.result()).toEqual([])
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git recent subjects: No such file or directory (os error 2): git',
    )
  })
})
