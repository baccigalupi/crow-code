import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { createLogger } from '../src/logger.ts'
import { clearDirectory, fixturesDirectory } from './support/fixtures.ts'

const loggerDirectory = join(fixturesDirectory, 'logger')

describe('createLogger', () => {
  beforeEach(() => clearDirectory(loggerDirectory))
  afterEach(() => clearDirectory(loggerDirectory))

  it('when created, creates the development log file', () => {
    const crowDirectory = join(loggerDirectory, 'creates-file')
    const logPath = join(crowDirectory, 'logs', 'development.log')

    createLogger(crowDirectory, 'error')

    expect(Deno.statSync(logPath).isFile).toBe(true)
  })

  it('when an info message is logged, writes a JSON line', async () => {
    const crowDirectory = join(loggerDirectory, 'writes-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    const logger = createLogger(crowDirectory, 'info')

    logger.info('catalog built')
    await new Promise<void>((resolve, reject) =>
      logger.flush((error) => error === undefined ? resolve() : reject(error))
    )

    const entry = JSON.parse(Deno.readTextFileSync(logPath).trim())
    expect(entry.msg).toBe('catalog built')
  })

  it('when a message is below the level, skips it', async () => {
    const crowDirectory = join(loggerDirectory, 'skips-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    const logger = createLogger(crowDirectory, 'error')

    logger.info('catalog built')
    await new Promise<void>((resolve, reject) =>
      logger.flush((error) => error === undefined ? resolve() : reject(error))
    )

    expect(Deno.readTextFileSync(logPath)).toBe('')
  })
})
