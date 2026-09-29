import type { Knex } from 'knex'
import type { ModelRow, ProviderRecord } from '../../src/domain/types.ts'

type NewProviderRow = Omit<ProviderRecord, 'id'>
type NewModelRow = Omit<ModelRow, 'id'>

export const testProviderRow = (
  overrides: Partial<NewProviderRow> = {},
): NewProviderRow => ({
  name: 'nous',
  base_url: 'https://nous.example',
  models_path: null,
  api_key_env_var: 'NOUS_TEST_KEY',
  ...overrides,
})

export const testModelRow = (
  overrides: Partial<NewModelRow> = {},
): NewModelRow => ({
  provider_id: 1,
  identifier: 'first-model',
  name: 'First Model',
  context_length: 1000,
  cost_input: 0,
  cost_output: 0,
  dynamic_delegation: 0,
  modality: 'text->text',
  supported_parameters: '[]',
  supports_reasoning: 0,
  can_disable_reasoning: 0,
  reasoning_options: '{}',
  ...overrides,
})

export const seedCheapModelCandidates = async (database: Knex) => {
  await database('providers').insert(testProviderRow({ api_key_env_var: null }))
  await database('models').insert([
    testModelRow({
      identifier: 'disableable',
      supports_reasoning: 1,
      can_disable_reasoning: 1,
    }),
    testModelRow({
      identifier: 'mandatory',
      supports_reasoning: 1,
      can_disable_reasoning: 0,
    }),
    testModelRow({ identifier: 'free' }),
    testModelRow({
      identifier: 'cheap',
      cost_input: 0.05,
      cost_output: 0.15,
    }),
    testModelRow({
      identifier: 'expensive',
      cost_input: 0.5,
      cost_output: 2,
    }),
    testModelRow({
      identifier: 'delegated',
      dynamic_delegation: 1,
      cost_input: null,
      cost_output: null,
    }),
    testModelRow({
      identifier: 'off_by_default',
      supports_reasoning: 1,
      can_disable_reasoning: 1,
      reasoning_options: '{"mandatory":false,"default_enabled":false}',
      cost_output: 0.25,
    }),
    testModelRow({
      identifier: 'param_only',
      supports_reasoning: 1,
      supported_parameters: '["reasoning_effort"]',
    }),
    testModelRow({
      identifier: 'embedding',
      modality: 'text->embeddings',
      cost_input: 0.01,
    }),
  ])
}
