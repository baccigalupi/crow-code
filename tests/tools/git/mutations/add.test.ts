import { describe, expect, it, mock, spyOn } from 'bun:test'
import { resolve } from 'node:path'
import { gitAdd } from '../../../../src/tools/git/mutations/add.ts'
import { mockApplicationData } from '../../../support/mock-application-data.ts'
import { mockCommand } from '../../../support/mock-command.ts'

describe('gitAdd', () => {
  it('adds the requested paths', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['src/a.ts', 'src/b.ts'] },
    })

    await add.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['add', '--', 'src/a.ts', 'src/b.ts'],
    })
    expect(add.success()).toBe(true)
    expect(add.result()).toBe('')
  })

  it('when no paths are given, adds all changes', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const add = gitAdd({ applicationData })

    await add.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['add', '--all'],
    })
    expect(add.success()).toBe(true)
    expect(add.result()).toBe('')
  })

  it('when git fails, reports failure', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({ success: false, stderr: 'add failed' }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['.'] },
    })

    await add.run()

    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe('Git add: add failed')
  })

  it('when a path is outside the repository, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const path = resolve(process.cwd(), '..', 'outside-git-add.ts')
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: [path] },
    })

    await add.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      `Git add: path not allowed: ${path}`,
    )
  })

  it('when a path uses git pathspec magic, fails without running git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const loggerErrorSpy = spyOn(applicationData.logger(), 'error')
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: [':/'] },
    })

    await add.run()

    expect(commandSpy.mock.calls.length).toBe(0)
    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.mock.calls[0][0]).toBe(
      'Git add: path not allowed: :/',
    )
  })

  it('when paths stay inside the repository, runs git', async () => {
    const commandSpy = mock()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['tests/../src/a.ts'] },
    })

    await add.run()

    expect(commandSpy).toHaveBeenNthCalledWith(1, 'git', {
      args: ['add', '--', 'tests/../src/a.ts'],
    })
    expect(add.success()).toBe(true)
  })
})
