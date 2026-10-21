import { describe, expect, it, spyOn } from 'bun:test'
import knex from 'knex'
import pino from 'pino'
import { BunSqliteClient } from '../../src/database/bun-sqlite-client.ts'
import { migrateDatabase } from '../../src/database/migrate.ts'

describe('migrate', () => {
  it('when a migration is applied, logs its name', async () => {
    const logger = pino({ enabled: false })
    const infoSpy = spyOn(logger, 'info')
    const database = knex({
      client: BunSqliteClient,
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })

    await migrateDatabase(database, logger)

    expect(String(infoSpy.mock.calls[0][0])).toMatch(
      /^Applied migration \d{14}_/,
    )
  })
})
