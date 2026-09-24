import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import knex from 'knex'
import { migrateDatabase, migrations } from '../../src/database/migrate.ts'
import type { Migration } from '../../src/types.ts'
import pino from 'pino'

describe('migrate', () => {
  it('when the database is fresh, applies all migrations in order', async () => {
    const logger = pino({ enabled: false })
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    const applied: string[] = []
    const migrationList: Migration[] = [
      {
        name: '20260101000000_first',
        up: () => {
          applied.push('20260101000000_first')
          return Promise.resolve()
        },
        down: () => Promise.resolve(),
      },
      {
        name: '20260102000000_second',
        up: () => {
          applied.push('20260102000000_second')
          return Promise.resolve()
        },
        down: () => Promise.resolve(),
      },
    ]

    await migrateDatabase(database, logger, migrationList)

    const recorded = await database('knex_migrations').select('name')
    expect(applied).toEqual([
      '20260101000000_first',
      '20260102000000_second',
    ])
    expect(recorded.map((row: { name: string }) => row.name)).toEqual(applied)
    await database.destroy()
  })

  it('when some migrations are applied, applies only the pending ones', async () => {
    const logger = pino({ enabled: false })
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    const applied: string[] = []
    const first: Migration[] = [{
      name: '20260101000000_first',
      up: () => {
        applied.push('20260101000000_first')
        return Promise.resolve()
      },
      down: () => Promise.resolve(),
    }]
    const second: Migration[] = [
      ...first,
      {
        name: '20260102000000_second',
        up: () => {
          applied.push('20260102000000_second')
          return Promise.resolve()
        },
        down: () => Promise.resolve(),
      },
    ]

    await migrateDatabase(database, logger, first)
    await migrateDatabase(database, logger, second)

    expect(applied).toEqual([
      '20260101000000_first',
      '20260102000000_second',
    ])
    await database.destroy()
  })

  it('when a migration fails, rolls back and rethrows', async () => {
    const logger = pino({ enabled: false })
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    const migrationList: Migration[] = [{
      name: '20260101000000_broken',
      up: async (db) => {
        await db.schema.createTable('rolled', (table) => {
          table.integer('id')
        })
        await db('nonexistent').insert({ value: 1 })
      },
      down: () => Promise.resolve(),
    }]

    await expect(
      migrateDatabase(database, logger, migrationList),
    ).rejects.toThrow()

    const tables = await database.raw(
      "SELECT name FROM sqlite_master WHERE name = 'rolled'",
    )
    expect(tables).toEqual([])
    await database.destroy()
  })

  it('when registered, migrations have strictly increasing names', () => {
    const names = migrations.map((migration) => migration.name)
    const sorted = [...names].sort()

    expect(names).toEqual(sorted)
    expect(new Set(names).size).toBe(names.length)
  })

  it('when the registry is empty, records no migrations', async () => {
    const logger = pino({ enabled: false })
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })

    await migrateDatabase(database, logger)

    const recorded = await database('knex_migrations').select('name')
    expect(recorded).toEqual([])
    await database.destroy()
  })
})
