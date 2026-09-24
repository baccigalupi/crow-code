import knex from 'knex'
import { join } from '@std/path'
import { migrateDatabase } from './migrate.ts'
import type { Logger } from '../types.ts'

export const defaultDatabasePath = (crowDirectory: string) => {
  return join(crowDirectory, 'crow.db')
}

export const openDatabase = async (
  crowDirectory: string,
  logger: Logger,
) => {
  Deno.mkdirSync(crowDirectory, { recursive: true })
  const database = knex({
    client: 'better-sqlite3',
    connection: { filename: defaultDatabasePath(crowDirectory) },
    useNullAsDefault: true,
  })
  await database.raw('PRAGMA journal_mode = WAL')
  await database.raw('PRAGMA foreign_keys = ON')
  await migrateDatabase(database, logger)
  return database
}
