import type { Knex } from 'knex'

export const up = (database: Knex) =>
  database.schema.createTable('providers', (table) => {
    table.increments('id')
    table.text('name').notNullable()
    table.text('base_url').notNullable().unique()
    table.text('models_path')
    table.text('api_key_env_var')
  })

export const down = (database: Knex) => database.schema.dropTable('providers')
