import { describe, expect, it } from 'bun:test'
import type { Database } from 'bun:sqlite'
import knex from 'knex'
import pino from 'pino'
import { migrateDatabase } from '../../src/database/migrate.ts'
import { BunSqliteClient } from '../../src/database/bun-sqlite-client.ts'

describe('BunSqliteClient', () => {
  it('when selecting, returns rows', async () => {
    const database = knex({
      client: BunSqliteClient,
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    await database.schema.createTable('notes', (table) => {
      table.text('content')
    })
    await database('notes').insert({ content: 'hello' })

    const rows = await database('notes').select('content')

    expect(rows).toEqual([{ content: 'hello' }])
    await database.destroy()
  })

  it('when inserting, returns the inserted id', async () => {
    const database = knex({
      client: BunSqliteClient,
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    await database.schema.createTable('notes', (table) => {
      table.increments('id')
      table.text('content')
    })

    const ids = await database('notes').insert({ content: 'a' })

    expect(ids).toEqual([1])
    await database.destroy()
  })

  it('when binding a Date and boolean, stores epoch millis and 1', async () => {
    const database = knex({
      client: BunSqliteClient,
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    await database.schema.createTable('events', (table) => {
      table.integer('at')
      table.integer('ok')
    })
    await database('events').insert({ at: new Date(5), ok: true })

    const rows = await database('events').select('at', 'ok')

    expect(rows).toEqual([{ at: 5, ok: 1 }])
    await database.destroy()
  })

  it('when migrated, enforces foreign keys', async () => {
    const database = knex({
      client: BunSqliteClient,
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    await database.raw('PRAGMA foreign_keys = ON')
    await migrateDatabase(database, pino({ enabled: false }))

    const foreignKeys = await database.raw('PRAGMA foreign_keys')
    const migrations = await database('knex_migrations').select('name')

    expect(foreignKeys).toEqual([{ foreign_keys: 1 }])
    expect(migrations.length).toBeGreaterThan(0)
    await database.destroy()
  })

  it('when the driver throws a non-error value, rejects with that value', async () => {
    const database = knex({
      client: BunSqliteClient,
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    const client = database.client as BunSqliteClient

    const querying = client._query(
      {
        prepare: () => {
          throw 'locked'
        },
      } as unknown as Database,
      { sql: 'select 1' },
    )

    await expect(querying).rejects.toBe('locked')
    await database.destroy()
  })
})
