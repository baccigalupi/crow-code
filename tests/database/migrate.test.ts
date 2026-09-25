import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import knex from 'knex'
import pino from 'pino'
import { spy } from '@std/testing/mock'
import { migrateDatabase } from '../../src/database/migrate.ts'

describe('migrate', () => {
  it('when a migration is applied, logs its name', async () => {
    const logger = pino({ enabled: false })
    using infoSpy = spy(logger, 'info')
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })

    await migrateDatabase(database, logger)

    expect(String(infoSpy.calls[0].args[0])).toMatch(
      /^Applied migration \d{14}_/,
    )
    await database.destroy()
  })
})
