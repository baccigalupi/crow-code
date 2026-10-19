import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { expandHome } from '../../../src/application-data/allowed-paths/expand-home.ts'
import { Environment } from '../../../src/application-data/env-vars.ts'
import { defaultFilesystem } from '../../../src/application-data/filesystem.ts'

describe('expandHome', () => {
  it('when a directory is a bare tilde, resolves to the home directory', () => {
    const envars = new Environment({
      runtimeEnvironment: { HOME: '/home/crow' },
      filesystem: defaultFilesystem(),
    })

    const expanded = expandHome({ directories: ['~'], envars }).directories()

    expect(expanded).toEqual(['/home/crow'])
  })

  it('when a directory starts with tilde slash, resolves under the home directory', () => {
    const envars = new Environment({
      runtimeEnvironment: { HOME: '/home/crow' },
      filesystem: defaultFilesystem(),
    })

    const expanded = expandHome({ directories: ['~/docs'], envars })
      .directories()

    expect(expanded).toEqual(['/home/crow/docs'])
  })

  it('when a directory is absolute or relative, leaves it unchanged', () => {
    const envars = new Environment({
      runtimeEnvironment: { HOME: '/home/crow' },
      filesystem: defaultFilesystem(),
    })

    const expanded = expandHome({ directories: ['/abs', 'rel/dir'], envars })
      .directories()

    expect(expanded).toEqual(['/abs', 'rel/dir'])
  })

  it('when a directory names another user, drops it', () => {
    const envars = new Environment({
      runtimeEnvironment: { HOME: '/home/crow' },
      filesystem: defaultFilesystem(),
    })

    const expanded = expandHome({ directories: ['~other/x', '/abs'], envars })
      .directories()

    expect(expanded).toEqual(['/abs'])
  })
})
