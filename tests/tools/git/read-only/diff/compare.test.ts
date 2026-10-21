import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { resolve } from '@std/path'
import { assertSpyCall, spy } from '@std/testing/mock'
import { gitCompare } from '../../../../../src/tools/git/read-only/diff/compare.ts'
import { CrowConfig } from '../../../../../src/application-data/config.ts'
import { defaultCrowConfig } from '../../../../../src/domain/config.ts'
import { mockApplicationData } from '../../../../support/mock-application-data.ts'
import { mockCommand } from '../../../../support/mock-command.ts'

describe('gitCompare', () => {
  it('when both paths are allowed, returns git stdout as the diff', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy, stdout: 'unified text' }),
    })

    const compare = gitCompare({
      applicationData,
      operationArguments: { from: 'a.txt', to: 'b.txt' },
    })
    await compare.run()

    assertSpyCall(commandSpy, 0, {
      args: [
        'git',
        {
          args: [
            'diff',
            '--no-index',
            '--no-color',
            '--no-ext-diff',
            '--',
            'a.txt',
            'b.txt',
          ],
        },
      ],
    })
    expect(compare.result()).toEqual({ diff: 'unified text' })
  })

  it('when git exits with code 1 and no stderr, the differences are a success', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        stdout: 'diff text',
        success: false,
        code: 1,
        stderr: '',
      }),
    })

    const compare = gitCompare({
      applicationData,
      operationArguments: { from: 'a.txt', to: 'b.txt' },
    })
    await compare.run()

    expect(compare.success()).toBe(true)
    expect(compare.result()).toEqual({ diff: 'diff text' })
  })

  it('when git exits with code 1 and stderr, a missing path is a failure', async () => {
    const applicationData = mockApplicationData({
      command: mockCommand({
        success: false,
        code: 1,
        stderr: "error: Could not access 'x.md'",
      }),
    })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const compare = gitCompare({
      applicationData,
      operationArguments: { from: 'a.txt', to: 'x.md' },
    })
    await compare.run()

    expect(compare.success()).toBe(false)
    expect(compare.result()).toEqual({ diff: '' })
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      "Git compare: error: Could not access 'x.md'",
    )
  })

  it('when a path is outside the repository but readable, runs git', async () => {
    const commandSpy = spy()
    const outside = resolve(Deno.cwd(), '..')
    const config = new CrowConfig('.', {
      ...defaultCrowConfig(),
      permissions: {
        ignore: [],
        additionalRead: [outside],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy, stdout: 'outside diff' }),
      config,
    })

    const compare = gitCompare({
      applicationData,
      operationArguments: {
        from: 'a.txt',
        to: resolve(outside, 'outside-compare.ts'),
      },
    })
    await compare.run()

    expect(commandSpy.calls.length).toBe(1)
    expect(compare.result()).toEqual({ diff: 'outside diff' })
  })

  it('when a path is not readable, fails without running git', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      command: mockCommand({ commandSpy }),
    })
    const to = resolve(Deno.cwd(), '..', 'outside-compare.ts')
    using loggerErrorSpy = spy(applicationData.logger(), 'error')

    const compare = gitCompare({
      applicationData,
      operationArguments: { from: 'a.txt', to },
    })
    await compare.run()

    expect(commandSpy.calls.length).toBe(0)
    expect(compare.success()).toBe(false)
    expect(compare.result()).toEqual({ diff: '' })
    expect(loggerErrorSpy.calls[0].args[0]).toBe(
      `Git compare: path not allowed: a.txt, ${to}`,
    )
  })
})
