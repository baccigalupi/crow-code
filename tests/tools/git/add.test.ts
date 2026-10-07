import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitAdd } from '../../../src/tools/git/add.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'

describe('gitAdd', () => {
  it('adds the requested paths', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    const add = gitAdd({
      applicationData,
      taskArguments: { paths: ['src/a.ts', 'src/b.ts'] },
    })

    await add.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['add', '--', 'src/a.ts', 'src/b.ts'] }],
    })
    expect(add.success()).toBe(true)
    expect(add.result()).toBe('')
  })

  it('when no paths are given, adds all changes', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    const add = gitAdd({ applicationData })

    await add.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['add', '--all'] }],
    })
    expect(add.success()).toBe(true)
    expect(add.result()).toBe('')
  })

  it('when git fails, reports failure', async () => {
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ success: false, stderr: 'add failed' }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const add = gitAdd({ applicationData, taskArguments: { paths: ['.'] } })

    await add.run()

    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe('Git error: add failed')
  })
})
