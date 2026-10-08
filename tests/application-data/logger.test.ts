import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { createLogger } from '../../src/application-data/logger.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('createLogger', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'logger')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'logger')))

  it('when created, creates the development log file', () => {
    const crowDirectory = join(fixturesDirectory, 'logger', 'creates-file')
    const logPath = join(crowDirectory, 'logs', 'development.log')

    createLogger(crowDirectory, 'error')

    expect(Deno.statSync(logPath).isFile).toBe(true)
  })

  it('when an info message is logged, writes a JSON line', () => {
    const crowDirectory = join(fixturesDirectory, 'logger', 'writes-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    const logger = createLogger(crowDirectory, 'info')

    logger.info('catalog built')

    const entry = JSON.parse(Deno.readTextFileSync(logPath).trim())
    expect(entry.msg).toBe('catalog built')
  })

  it('when a message is below the level, skips it', () => {
    const crowDirectory = join(fixturesDirectory, 'logger', 'skips-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    const logger = createLogger(crowDirectory, 'error')

    logger.info('catalog built')

    expect(Deno.readTextFileSync(logPath)).toBe('')
  })
})
