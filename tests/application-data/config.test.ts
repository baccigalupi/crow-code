import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { CrowConfig } from '../../src/application-data/config.ts'

describe('CrowConfig', () => {
  it('when escalateRead is configured, escalateReadDirectories returns it', () => {
    const config = new CrowConfig('.crow', {
      crowGlobalDirectory: '~/.crow',
      envFile: '~/.crow/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: ['/docs'],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })

    const directories = config.escalateReadDirectories

    expect(directories).toEqual(['/docs'])
  })

  it('when escalateWrite is configured, escalateWriteDirectories ends with the crow repo directory', () => {
    const config = new CrowConfig('.crow', {
      crowGlobalDirectory: '~/.crow',
      envFile: '~/.crow/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: ['./scripts'],
        allowedLocalScripts: [],
      },
    })

    const directories = config.escalateWriteDirectories

    expect(directories).toEqual(['./scripts', '.crow'])
  })

  it('when escalateWrite is empty, escalateWriteDirectories is only the crow repo directory', () => {
    const config = new CrowConfig('.crow', {
      crowGlobalDirectory: '~/.crow',
      envFile: '~/.crow/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: [],
      },
    })

    const directories = config.escalateWriteDirectories

    expect(directories).toEqual(['.crow'])
  })

  it('when allowedLocalScripts is configured, allowedLocalScripts returns it', () => {
    const config = new CrowConfig('.crow', {
      crowGlobalDirectory: '~/.crow',
      envFile: '~/.crow/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
        allowedLocalScripts: ['./a.sh'],
      },
    })

    const scripts = config.allowedLocalScripts

    expect(scripts).toEqual(['./a.sh'])
  })
})
