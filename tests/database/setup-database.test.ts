import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import knex from 'knex'
import { defaultDatabasePath } from '../../src/database/open-database.ts'
import { setupDatabase } from '../../src/database/setup-database.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'
import pino from 'pino'

const crowDirectory = join(fixturesDirectory, 'setup-database', '.crow')

describe('setupDatabase', () => {
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

  it('when called, creates the crow directory and database file', async () => {
    const logger = pino({ enabled: false })
    await setupDatabase(crowDirectory, logger)

    expect(Deno.statSync(defaultDatabasePath(crowDirectory)).isFile).toBe(true)
  })

  it('when called, creates only the migration tracking tables', async () => {
    const logger = pino({ enabled: false })
    await setupDatabase(crowDirectory, logger)

    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: defaultDatabasePath(crowDirectory) },
      useNullAsDefault: true,
    })
    const rows = await database.raw(`
      SELECT name FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'knex_%'
        AND name NOT LIKE 'sqlite_%'
    `)
    await database.destroy()

    expect(rows).toEqual([])
  })

  it('when called twice, is idempotent', async () => {
    const logger = pino({ enabled: false })
    await setupDatabase(crowDirectory, logger)
    await setupDatabase(crowDirectory, logger)

    expect(Deno.statSync(defaultDatabasePath(crowDirectory)).isFile).toBe(true)
  })
})
