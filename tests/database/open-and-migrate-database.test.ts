import { afterEach, beforeEach, describe, it } from 'node:test'
import { expect } from '@std/expect'
import { join } from '@std/path'
import {
  defaultDatabasePath,
  openAndMigrateDatabase,
} from '../../src/database/open-and-migrate-database.ts'
import { clearDirectory, fixturesDirectory } from '../support/fixtures.ts'
import { createTestDatabase, dropAllTables } from '../support/test-database.ts'
import pino from 'pino'

describe('openAndMigrateDatabase', () => {
  beforeEach(() =>
    clearDirectory(join(fixturesDirectory, 'open-database', '.crow'))
  )
  afterEach(() =>
    clearDirectory(join(fixturesDirectory, 'open-database', '.crow'))
  )

  it('when opened, creates the crow directory and database file', async () => {
    const crowDirectory = join(fixturesDirectory, 'open-database', '.crow')
    const logger = pino({ enabled: false })

    await openAndMigrateDatabase(crowDirectory, logger)

    expect(Deno.statSync(defaultDatabasePath(crowDirectory)).isFile).toBe(true)
  })

  it('when opened, returns a writable database', async () => {
    const crowDirectory = join(fixturesDirectory, 'open-database', '.crow')
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)

    await database.schema.createTable('notes', (table) => {
      table.text('content')
    })
    await database('notes').insert({ content: 'hello' })
    const rows = await database('notes').select('content')

    expect(rows).toEqual([{ content: 'hello' }])
  })

  it('when opened twice, keeps existing data', async () => {
    const crowDirectory = join(fixturesDirectory, 'open-database', '.crow')
    const logger = pino({ enabled: false })
    const first = await openAndMigrateDatabase(crowDirectory, logger)
    await first.schema.createTable('notes', (table) => {
      table.text('content')
    })
    await first('notes').insert({ content: 'persisted' })

    const second = await openAndMigrateDatabase(crowDirectory, logger)
    const rows = await second('notes').select('content')

    expect(rows).toEqual([{ content: 'persisted' }])
  })

  it('when cleaned, drops all tables', async () => {
    const crowDirectory = join(fixturesDirectory, 'open-database', '.crow')
    const logger = pino({ enabled: false })
    const database = await openAndMigrateDatabase(crowDirectory, logger)
    await database.schema.createTable('notes', (table) => {
      table.text('content')
    })

    await dropAllTables(database)

    const tables = await database.raw(`
      SELECT name FROM sqlite_master
      WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
    `)
    expect(tables).toEqual([])
  })

  it('when created via the helper, returns a migrated database', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const foreignKeys = await database.raw('PRAGMA foreign_keys')
    const tables = await database.raw(
      "SELECT name FROM sqlite_master WHERE name LIKE 'knex_%'",
    )

    expect(foreignKeys).toEqual([{ foreign_keys: 1 }])
    expect(tables.length).toBeGreaterThan(0)
  })
})
