import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import {
  defaultDatabasePath,
  openAndMigrateDatabase,
} from '../../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'
import { cleanDatabase, createTestDatabase } from '../support/test-database.ts'
import pino from 'pino'

const crowDirectory = join(fixturesDirectory, 'open-database', '.crow')

describe('openAndMigrateDatabase', () => {
  beforeEach(() => clearDirectory(crowDirectory))
  afterEach(() => clearDirectory(crowDirectory))

  it('when opened, creates the crow directory and database file', async () => {
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)

    expect(Deno.statSync(defaultDatabasePath(crowDirectory)).isFile).toBe(true)
    await database.destroy()
  })

  it('when opened, returns a writable database', async () => {
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)

    await database.schema.createTable('notes', (table) => {
      table.text('content')
    })
    await database('notes').insert({ content: 'hello' })
    const rows = await database('notes').select('content')
    await database.destroy()

    expect(rows).toEqual([{ content: 'hello' }])
  })

  it('when opened twice, keeps existing data', async () => {
    const logger = pino({ enabled: false })
    const first = await openAndMigrateDatabase(crowDirectory, logger)
    await first.schema.createTable('notes', (table) => {
      table.text('content')
    })
    await first('notes').insert({ content: 'persisted' })
    await first.destroy()

    const second = await openAndMigrateDatabase(crowDirectory, logger)
    const rows = await second('notes').select('content')
    await second.destroy()

    expect(rows).toEqual([{ content: 'persisted' }])
  })

  it('when cleaned, drops all tables', async () => {
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)
    await database.schema.createTable('notes', (table) => {
      table.text('content')
    })

    await cleanDatabase(database)

    const tables = await database.raw(`
      SELECT name FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    `)
    expect(tables).toEqual([])
    await database.destroy()
  })

  it('when created via the helper, returns a migrated database', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const foreignKeys = await database.raw('PRAGMA foreign_keys')
    const tables = await database.raw(
      "SELECT name FROM sqlite_master WHERE name LIKE 'knex_%'",
    )
    await database.destroy()

    expect(foreignKeys).toEqual([{ foreign_keys: 1 }])
    expect(tables.length).toBeGreaterThan(0)
  })
})
