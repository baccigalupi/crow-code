import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { reasoningFilter } from '../../../../src/domain/models/filters/reasoning.ts'
import { createTestDatabase } from '../../../../tests/support/test-database.ts'

describe('reasoningFilter', () => {
  describe("when type is 'dynamic'", () => {
    it('returns dynamic delegation models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'delegated',
          name: 'Delegated Model',
          context_length: 1000,
          cost_input: null,
          cost_output: null,
          dynamic_delegation: true,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'dynamic' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('delegated')
      await database.destroy()
    })

    it('excludes non-dynamic delegation models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'static',
          name: 'Static Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'dynamic' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('returns only dynamic models when mixed with static models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'delegated',
          name: 'Delegated Model',
          context_length: 1000,
          cost_input: null,
          cost_output: null,
          dynamic_delegation: true,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
        {
          provider_id: 1,
          identifier: 'static',
          name: 'Static Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'dynamic' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('delegated')
      await database.destroy()
    })
  })

  describe("when type is 'chat'", () => {
    it('excludes dynamic delegation models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'delegated',
          name: 'Delegated Model',
          context_length: 1000,
          cost_input: null,
          cost_output: null,
          dynamic_delegation: true,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'chat' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models where supports_reasoning is false', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'no-reasoning',
          name: 'No Reasoning Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'chat' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('no-reasoning')
      await database.destroy()
    })

    it('includes models with disableable reasoning', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'disableable',
          name: 'Disableable Reasoning Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'chat' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('disableable')
      await database.destroy()
    })

    it('excludes models with mandatory reasoning', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mandatory',
          name: 'Mandatory Reasoning Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'chat' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })
  })

  describe("when type is 'low'", () => {
    it('excludes models where supports_reasoning is false', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'no-reasoning',
          name: 'No Reasoning Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes toggle-only models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'toggle-only',
          name: 'Toggle Only Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '["reasoning"]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{"mandatory":false}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models with a reasoning token budget', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'token-budget',
          name: 'Token Budget Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{"mandatory":false,"supports_max_tokens":true}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('token-budget')
      await database.destroy()
    })

    it('includes models supporting low effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'low-effort',
          name: 'Low Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["high","low"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('low-effort')
      await database.destroy()
    })

    it('includes models supporting minimal effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'minimal-effort',
          name: 'Minimal Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["high","minimal"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('minimal-effort')
      await database.destroy()
    })

    it('excludes models whose only lower effort is none', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'none-effort',
          name: 'None Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["high","none"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes mandatory reasoning models without efforts', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mandatory-no-efforts',
          name: 'Mandatory No Efforts Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{"mandatory":true}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes models supporting only high effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'high-only',
          name: 'High Only Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{"mandatory":true,"supported_efforts":["high"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models advertising a reasoning_effort parameter', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'effort-param',
          name: 'Effort Param Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '["reasoning","reasoning_effort"]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'low' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('effort-param')
      await database.destroy()
    })
  })

  describe("when type is 'medium'", () => {
    it('excludes models where supports_reasoning is false', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'no-reasoning',
          name: 'No Reasoning Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes toggle-only models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'toggle-only',
          name: 'Toggle Only Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '["reasoning"]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{"mandatory":false}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models with a reasoning token budget', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'token-budget',
          name: 'Token Budget Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{"mandatory":false,"supports_max_tokens":true}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('token-budget')
      await database.destroy()
    })

    it('includes models supporting medium effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'medium-effort',
          name: 'Medium Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["high","medium","low"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('medium-effort')
      await database.destroy()
    })

    it('excludes models supporting only low and high effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'low-high',
          name: 'Low High Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["max","high","low"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes mandatory reasoning models without efforts', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mandatory-no-efforts',
          name: 'Mandatory No Efforts Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{"mandatory":true}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes models supporting only high effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'high-only',
          name: 'High Only Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["high","xhigh","max"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models advertising a reasoning_effort parameter', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'effort-param',
          name: 'Effort Param Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '["reasoning","reasoning_effort"]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'medium' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('effort-param')
      await database.destroy()
    })
  })

  describe("when type is 'high'", () => {
    it('excludes models where supports_reasoning is false', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'no-reasoning',
          name: 'No Reasoning Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes toggle-only models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'toggle-only',
          name: 'Toggle Only Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '["reasoning"]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{"mandatory":false}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models with a reasoning token budget', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'token-budget',
          name: 'Token Budget Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: true,
          reasoning_options: '{"mandatory":false,"supports_max_tokens":true}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('token-budget')
      await database.destroy()
    })

    it('includes models supporting high effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'high-effort',
          name: 'High Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["high","medium","low"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('high-effort')
      await database.destroy()
    })

    it('includes models supporting xhigh effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'xhigh-effort',
          name: 'Xhigh Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["xhigh","medium","low"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('xhigh-effort')
      await database.destroy()
    })

    it('includes models supporting max effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'max-effort',
          name: 'Max Effort Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["max","low"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('max-effort')
      await database.destroy()
    })

    it('excludes models supporting only low and medium effort', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'low-medium',
          name: 'Low Medium Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options:
            '{"mandatory":true,"supported_efforts":["medium","low","minimal"]}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('excludes mandatory reasoning models without efforts', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mandatory-no-efforts',
          name: 'Mandatory No Efforts Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{"mandatory":true}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes models advertising a reasoning_effort parameter', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'effort-param',
          name: 'Effort Param Model',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '["reasoning","reasoning_effort"]',
          supports_reasoning: true,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      reasoningFilter(builder, { type: 'high' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('effort-param')
      await database.destroy()
    })
  })
})
