import type { Knex } from 'knex'

const addIdentityColumns = (table: Knex.CreateTableBuilder) => {
  table.increments('id')
  table.integer('provider_id').notNullable()
  table.text('identifier').notNullable()
  table.text('name').notNullable()
}

const addCostColumns = (table: Knex.CreateTableBuilder) => {
  table.integer('context_length')
  table.float('cost_input')
  table.float('cost_output')
}

const addCapabilityColumns = (table: Knex.CreateTableBuilder) => {
  table.boolean('dynamic_delegation').notNullable()
  table.text('modality').notNullable()
  table.json('supported_parameters').notNullable()
}

const addReasoningColumns = (table: Knex.CreateTableBuilder) => {
  table.boolean('supports_reasoning').notNullable()
  table.boolean('can_disable_reasoning').notNullable()
  table.json('reasoning_options').notNullable()
}

const createModelsTable = (table: Knex.CreateTableBuilder) => {
  addIdentityColumns(table)
  addCostColumns(table)
  addCapabilityColumns(table)
  addReasoningColumns(table)
  table.unique(['provider_id', 'identifier'])
}

export const up = (database: Knex) =>
  database.schema.createTable('models', createModelsTable)

export const down = (database: Knex) => database.schema.dropTable('models')
