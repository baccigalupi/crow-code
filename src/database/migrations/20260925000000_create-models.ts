import type { Knex } from 'knex'

export const up = (database: Knex) =>
  database.schema.createTable('models', (table) => {
    table.increments('id')
    table.integer('provider_id').notNullable()
    table.text('identifier').notNullable()
    table.text('name').notNullable()
    table.integer('context_length')
    table.float('cost_input')
    table.float('cost_output')
    table.boolean('dynamic_delegation').notNullable()
    table.text('modality').notNullable()
    table.json('supported_parameters').notNullable()
    table.boolean('supports_reasoning').notNullable()
    table.boolean('can_disable_reasoning').notNullable()
    table.json('reasoning_options').notNullable()
    table.unique(['provider_id', 'identifier'])
  })

export const down = (database: Knex) => database.schema.dropTable('models')
