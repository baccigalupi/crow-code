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
})
