import { join } from '@std/path'
import type { Knex } from 'knex'
import type { Logger } from '../types.ts'

const migrationsDirectory = join(import.meta.dirname!, 'migrations')

export const migrateDatabase = async (
  database: Knex,
  logger: Logger,
) => {
  const [, applied]: [number, string[]] = await database.migrate.latest({
    directory: migrationsDirectory,
    loadExtensions: ['.ts'],
  })
  applied.forEach((name) => logger.info(`Applied migration ${name}`))
}
