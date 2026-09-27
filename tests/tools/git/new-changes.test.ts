import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitNewChanges } from '../../../src/tools/git/new-changes.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'

describe('gitNewChanges', () => {
  it('when git cannot be executed, returns an empty list', {
    skip: true,
  }, async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({
        commandSpy,
        outputError: 'No such file or directory (os error 2): git',
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger, 'error')

    const changes = gitNewChanges({ applicationData })
    await changes.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['diff', '--no-index', '/dev/null', ''] }],
    })
    expect(changes.success()).toBe(false)
    expect(changes.result()).toEqual([])
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git error: No such file or directory (os error 2): git',
    )
  })
})
