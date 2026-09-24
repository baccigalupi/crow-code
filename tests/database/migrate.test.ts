import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import knex from 'knex'
import pino from 'pino'
import { migrateDatabase, migrations } from '../../src/database/migrate.ts'
import type { Migration } from '../../src/types.ts'

describe('migrate', () => {
  it('when a migration is applied, logs its name', async () => {
    const messages: string[] = []
    const logger = pino({
      hooks: {
        logMethod: (argumentsList) => messages.push(String(argumentsList[0])),
      },
    }, { write: () => undefined })
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    const migration: Migration = {
      name: '20260101000000_first',
      up: () => Promise.resolve(),
      down: () => Promise.resolve(),
    }

    await migrateDatabase(database, logger, [migration])

    expect(messages).toEqual(['Applied migration 20260101000000_first'])
    await database.destroy()
  })

  it('when migrations are registered, their names are ordered and unique', () => {
    const names = migrations.map(({ name }) => name)

    expect(names).toEqual([...new Set(names)].sort())
  })
})
