import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { spy } from '@std/testing/mock'
import { gitPathPermissions } from '../../src/application-data/git-path-permissions.ts'
import { mockApplicationData } from '../support/mock-application-data.ts'
import { mockDenoCommand } from '../support/mock-deno-command.ts'

describe('gitPathPermissions', () => {
  it('bounds paths by the repository root', async () => {
    const commandSpy = spy()
    const applicationData = mockApplicationData({
      denoCommand: mockDenoCommand({ commandSpy, stdout: `${Deno.cwd()}\n` }),
    })

    const permissions = gitPathPermissions({ applicationData })
    await permissions.allows('src/tools/exec-cli.ts')

    expect(commandSpy.calls).toHaveLength(1)
    expect(commandSpy.calls[0].args).toEqual([
      'git',
      { args: ['rev-parse', '--show-toplevel'] },
    ])
    expect(await permissions.allows('src/tools/exec-cli.ts')).toBe(true)
    expect(await permissions.allows(join('..', 'outside.txt'))).toBe(false)
  })
})
