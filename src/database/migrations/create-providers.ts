import type { Migration } from '../../types.ts'

export const createProviders: Migration = {
  name: '20260924000000_create-providers',
  up: (database) =>
    database.schema.createTable('providers', (table) => {
      table.increments('id')
      table.text('name').notNullable()
      table.text('base_url').notNullable().unique()
      table.text('models_path')
      table.text('api_key_env_var')
    }),
  down: (database) => database.schema.dropTable('providers'),
}
