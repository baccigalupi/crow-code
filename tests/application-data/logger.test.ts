import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { createLogger } from '../../src/application-data/logger.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'

describe('createLogger', () => {
  beforeEach(() => clearDirectory(join(fixturesDirectory, 'logger')))
  afterEach(() => clearDirectory(join(fixturesDirectory, 'logger')))

  it('when created, creates the development log file', () => {
    const crowDirectory = join(fixturesDirectory, 'logger', 'creates-file')
    const logPath = join(crowDirectory, 'logs', 'development.log')

    createLogger(crowDirectory, 'error')

    expect(statSync(logPath).isFile()).toBe(true)
  })

  it('when an info message is logged, writes a JSON line', () => {
    const crowDirectory = join(fixturesDirectory, 'logger', 'writes-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    const logger = createLogger(crowDirectory, 'info')

    logger.info('catalog built')

    const entry = JSON.parse(readFileSync(logPath, 'utf8').trim())
    expect(entry.msg).toBe('catalog built')
  })

  it('when a message is below the level, skips it', () => {
    const crowDirectory = join(fixturesDirectory, 'logger', 'skips-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    const logger = createLogger(crowDirectory, 'error')

    logger.info('catalog built')

    expect(readFileSync(logPath, 'utf8')).toBe('')
  })
})
