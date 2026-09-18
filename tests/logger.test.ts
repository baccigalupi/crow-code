import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import { existsSync } from '@std/fs'
import { createLogger } from '../src/logger.ts'

const fixtureDirectory = join(
  Deno.cwd(),
  'tests',
  'support',
  'fixtures',
  'logger',
)

describe('createLogger', () => {
  it('when created, creates the development log file', () => {
    const crowDirectory = join(fixtureDirectory, 'creates-file')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    if (existsSync(logPath)) {
      Deno.removeSync(logPath)
    }

    createLogger(crowDirectory, 'error')

    expect(Deno.statSync(logPath).isFile).toBe(true)
  })

  it('when an info message is logged, writes a JSON line', async () => {
    const crowDirectory = join(fixtureDirectory, 'writes-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    Deno.mkdirSync(join(crowDirectory, 'logs'), { recursive: true })
    Deno.writeTextFileSync(logPath, '')
    const logger = createLogger(crowDirectory, 'info')

    logger.info('catalog built')
    await new Promise<void>((resolve, reject) =>
      logger.flush((error) => error === undefined ? resolve() : reject(error))
    )

    const entry = JSON.parse(Deno.readTextFileSync(logPath).trim())
    expect(entry.msg).toBe('catalog built')
  })

  it('when a message is below the level, skips it', async () => {
    const crowDirectory = join(fixtureDirectory, 'skips-message')
    const logPath = join(crowDirectory, 'logs', 'development.log')
    Deno.mkdirSync(join(crowDirectory, 'logs'), { recursive: true })
    Deno.writeTextFileSync(logPath, '')
    const logger = createLogger(crowDirectory, 'error')

    logger.info('catalog built')
    await new Promise<void>((resolve, reject) =>
      logger.flush((error) => error === undefined ? resolve() : reject(error))
    )

    expect(Deno.readTextFileSync(logPath)).toBe('')
  })
})
