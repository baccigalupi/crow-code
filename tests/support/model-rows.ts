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
  dynamic_delegation: false,
  modality: 'text->text',
  supported_parameters: '[]',
  supports_reasoning: false,
  can_disable_reasoning: false,
  reasoning_options: '{}',
  ...overrides,
})

export const seedCheapModelCandidates = async (database: Knex) => {
  await database('providers').insert(testProviderRow({ api_key_env_var: null }))
  await database('models').insert([
    testModelRow({
      identifier: 'disableable',
      supports_reasoning: true,
      can_disable_reasoning: true,
    }),
    testModelRow({
      identifier: 'mandatory',
      supports_reasoning: true,
      can_disable_reasoning: false,
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
      dynamic_delegation: true,
      cost_input: null,
      cost_output: null,
    }),
    testModelRow({
      identifier: 'off_by_default',
      supports_reasoning: true,
      can_disable_reasoning: true,
      reasoning_options: '{"mandatory":false,"default_enabled":false}',
      cost_output: 0.25,
    }),
    testModelRow({
      identifier: 'param_only',
      supports_reasoning: true,
      supported_parameters: '["reasoning_effort"]',
    }),
    testModelRow({
      identifier: 'embedding',
      modality: 'text->embeddings',
      cost_input: 0.01,
    }),
  ])
}
