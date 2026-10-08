import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { assertSpyCall, spy } from '@std/testing/mock'
import { ApplicationData } from '../../../src/application-data.ts'
import { gitAdd } from '../../../src/tools/git/add.ts'
import { pathPermissions } from '../../../src/application-data/path-permissions.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'
import { mockDenoCommand } from '../../support/mock-deno-command.ts'
import { fixturesDirectory } from '../../support/fixtures.ts'

describe('gitAdd', () => {
  it('adds the requested paths', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['src/a.ts', 'src/b.ts'] },
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
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['.'] },
    })

    await add.run()

    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe('Git add: add failed')
  })

  it('when a path is outside the repository, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
      gitPathPermissions: pathPermissions({
        applicationData: new ApplicationData(),
        allowedDirectories: [join(fixturesDirectory, 'tools', 'git')],
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['src/a.ts'] },
    })

    await add.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git add: path not allowed: src/a.ts',
    )
  })

  it('when a path uses git pathspec magic, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: [':/'] },
    })

    await add.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(add.success()).toBe(false)
    expect(add.result()).toBe('')
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      'Git add: path not allowed: :/',
    )
  })

  it('when paths stay inside the repository, runs git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy }),
    })
    const add = gitAdd({
      applicationData,
      operationArguments: { paths: ['tests/../src/a.ts'] },
    })

    await add.run()

    assertSpyCall(commandSpy, 0, {
      args: ['git', { args: ['add', '--', 'tests/../src/a.ts'] }],
    })
    expect(add.success()).toBe(true)
  })
})
