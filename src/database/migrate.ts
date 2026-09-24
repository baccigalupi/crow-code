import type { Knex } from 'knex'
import type { Logger, Migration } from '../types.ts'

export const migrations: Migration[] = []

const migrationSource = (
  migrationList: Migration[],
): Knex.MigrationSource<Migration> => ({
  getMigrations: () => Promise.resolve(migrationList),
  getMigrationName: (migration) => migration.name,
  getMigration: (migration) => Promise.resolve(migration),
})

export const migrateDatabase = async (
  database: Knex,
  logger: Logger,
  migrationList: Migration[] = migrations,
) => {
  const [, applied]: [number, string[]] = await database.migrate.latest({
    migrationSource: migrationSource(migrationList),
  })
  applied.forEach((name) => logger.info(`Applied migration ${name}`))
}
