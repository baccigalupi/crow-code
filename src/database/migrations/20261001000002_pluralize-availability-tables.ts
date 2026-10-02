import type { Knex } from 'knex'

const renameTable = (
  database: Knex,
  from: string,
  to: string,
) => database.schema.renameTable(from, to)

export const up = async (database: Knex) => {
  await renameTable(
    database,
    'provider_availability',
    'provider_availabilities',
  )
  await renameTable(database, 'model_availability', 'model_availabilities')
}

export const down = async (database: Knex) => {
  await renameTable(database, 'model_availabilities', 'model_availability')
  await renameTable(
    database,
    'provider_availabilities',
    'provider_availability',
  )
}
