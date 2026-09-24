import knex, { type Knex } from 'knex'
import { migrateDatabase } from '../../src/database/migrate.ts'
import type { Logger } from '../../src/types.ts'

type TableRow = { name: string; sql: string | null }

export const createTestDatabase = async (logger: Logger) => {
  const database = knex({
    client: 'better-sqlite3',
    connection: { filename: ':memory:' },
    useNullAsDefault: true,
  })
  await database.raw('PRAGMA foreign_keys = ON')
  await migrateDatabase(database, logger)
  return database
}

const isVirtual = (row: TableRow) => {
  return typeof row.sql === 'string' &&
    row.sql.startsWith('CREATE VIRTUAL TABLE')
}

const tableNames = async (database: Knex) => {
  const rows = await database.raw(`
    SELECT name, sql FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
  `) as TableRow[]
  const virtual = rows.filter(isVirtual)
  const regular = rows.filter((row) => !isVirtual(row))
  return [...virtual, ...regular].map((row) => row.name)
}

export const cleanDatabase = async (database: Knex) => {
  const names = await tableNames(database)
  for (const name of names) {
    await database.raw(`DROP TABLE IF EXISTS "${name}"`)
  }
}
