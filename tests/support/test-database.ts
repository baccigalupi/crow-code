import knex, { type Knex } from 'knex'
import { migrateDatabase } from '../../src/database/migrate.ts'
import type { Logger } from '../../src/types.ts'

type TableRow = { name: string; sql: string | null }

const internalTables = new Set([
  'knex_migrations',
  'knex_migrations_lock',
  'sqlite_sequence',
])

let shared: Promise<Knex> | undefined

export const createTestDatabase = async (logger: Logger) => {
  if (!shared) {
    const database = knex({
      client: 'better-sqlite3',
      connection: { filename: ':memory:' },
      useNullAsDefault: true,
    })
    shared = (async () => {
      await database.raw('PRAGMA foreign_keys = ON')
      await migrateDatabase(database, logger)
      return database
    })()
  }
  const database = await shared
  await cleanDatabase(database)
  return database
}

const isVirtual = (row: TableRow) => {
  return typeof row.sql === 'string' &&
    row.sql.startsWith('CREATE VIRTUAL TABLE')
}

const tableRows = async (database: Knex) => {
  return await database.raw(`
    SELECT name, sql FROM sqlite_master
    WHERE type = 'table' AND name NOT LIKE 'sqlite_%'
  `) as TableRow[]
}

const tableNames = async (database: Knex) => {
  const rows = await tableRows(database)
  const virtual = rows.filter(isVirtual)
  const regular = rows.filter((row) => !isVirtual(row))
  return [...virtual, ...regular].map((row) => row.name)
}

export const cleanDatabase = async (database: Knex) => {
  const names = (await tableNames(database)).filter((name) =>
    !internalTables.has(name)
  )
  for (const name of names) {
    await database.raw(`DELETE FROM "${name}"`)
  }
  const hasSequence = await database.raw(`
    SELECT name FROM sqlite_master
    WHERE type = 'table' AND name = 'sqlite_sequence'
  `) as TableRow[]
  if (hasSequence.length > 0) {
    await database.raw('DELETE FROM sqlite_sequence')
  }
}

export const dropAllTables = async (database: Knex) => {
  const names = await tableNames(database)
  for (const name of names) {
    await database.raw(`DROP TABLE IF EXISTS "${name}"`)
  }
  if (shared && (await shared) === database) {
    shared = undefined
  }
}
