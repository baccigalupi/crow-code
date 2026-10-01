import type { Knex } from 'knex'
import {
  createUpdatedAtTrigger,
  updatedAtDefault,
} from '../updated-at-trigger.ts'

const createTable = (database: Knex) =>
  database.schema.createTable('provider_availability', (table) => {
    table.increments('id')
    table.integer('provider_id').notNullable().unique()
    table.text('reason').notNullable()
    table.text('retry_at')
    table.text('updated_at').notNullable().defaultTo(updatedAtDefault(database))
  })

export const up = async (database: Knex) => {
  await createTable(database)
  await createUpdatedAtTrigger(database, 'provider_availability')
}

export const down = (database: Knex) =>
  database.schema.dropTable('provider_availability')
