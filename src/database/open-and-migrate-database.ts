import knex from 'knex'
import { join } from 'node:path'
import { BunSqliteClient } from './bun-sqlite-client.ts'
import { migrateDatabase } from './migrate.ts'
import type { Logger } from '../types.ts'
import type { Filesystem } from '../application-data/filesystem.ts'

export const defaultDatabasePath = (crowDirectory: string) => {
  return join(crowDirectory, 'crow.db')
}

export const openAndMigrateDatabase = async (
  crowDirectory: string,
  logger: Logger,
  filesystem: Filesystem,
) => {
  await filesystem.mkdirWithParents(crowDirectory)
  const database = openDatabase(crowDirectory)
  await configureDatabase(database)
  await migrateDatabase(database, logger)
  return database
}

const openDatabase = (crowDirectory: string) => {
  return knex({
    client: BunSqliteClient,
    connection: { filename: defaultDatabasePath(crowDirectory) },
    useNullAsDefault: true,
  })
}

const configureDatabase = async (database: ReturnType<typeof openDatabase>) => {
  await database.raw('PRAGMA journal_mode = WAL')
  await database.raw('PRAGMA foreign_keys = ON')
}
