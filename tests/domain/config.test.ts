import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { normalizeConfig } from '../../src/domain/config.ts'

describe('NormalizeConfig', () => {
  it('when the config is valid, result returns it', () => {
    const config = {
      crowGlobalDirectory: '/global',
      envFile: '/global/.env',
      permissions: {
        ignore: ['vendor'],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: ['./dev', './agent'],
      },
    }

    const result = normalizeConfig(config).result()

    expect(result).toEqual(config)
  })

  it('when the config sets escalate directories, result returns them', () => {
    const config = {
      crowGlobalDirectory: '/global',
      envFile: '/global/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: ['/docs'],
        escalateWrite: ['/scripts'],
      },
    }

    const result = normalizeConfig(config).result()

    expect(result).toEqual(config)
  })

  it('when escalate directories are absent, errorMessage says so', () => {
    const config = {
      crowGlobalDirectory: '/global',
      envFile: '/global/.env',
      permissions: {
        ignore: ['vendor'],
        additionalRead: [],
        additionalWrite: [],
      },
    }

    const message = normalizeConfig(config).errorMessage()

    expect(message).toBe('config does not match schema')
  })

  it('when the config is valid, errorMessage is empty', () => {
    const config = {
      crowGlobalDirectory: '/global',
      envFile: '/global/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: [],
      },
    }

    const message = normalizeConfig(config).errorMessage()

    expect(message).toBe('')
  })

  it('when the config does not match the schema, errorMessage says so', () => {
    const config = { crowGlobalDirectory: '/global' }

    const message = normalizeConfig(config).errorMessage()

    expect(message).toBe('config does not match schema')
  })

  it('when the config does not match the schema, result returns the default', () => {
    const config = { crowGlobalDirectory: '/global' }

    const result = normalizeConfig(config).result()

    expect(result).toEqual({
      crowGlobalDirectory: '~/.crow',
      envFile: '~/.crow/.env',
      permissions: {
        ignore: [],
        additionalRead: [],
        additionalWrite: [],
        escalateRead: [],
        escalateWrite: ['./dev', './agent'],
      },
    })
  })
})
