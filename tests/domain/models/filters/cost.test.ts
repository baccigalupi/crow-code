import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { costFilter } from '../../../../src/domain/models/filters/cost.ts'
import { createTestDatabase } from '../../../../tests/support/test-database.ts'

describe('costFilter', () => {
  it('returns free models when costTier is free', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'free',
        name: 'Free',
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
      {
        provider_id: 1,
        identifier: 'cheap',
        name: 'Cheap',
        context_length: 1000,
        cost_input: 0,
        cost_output: 0.1,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])

    const builder = database('models')
    costFilter(builder, { costTier: 'free' })
    const models = await builder

    expect(models).toHaveLength(1)
    expect(models[0].identifier).toBe('free')
    await database.destroy()
  })

  it('does not match low-cost models when costTier is free', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'cheap',
        name: 'Cheap',
        context_length: 1000,
        cost_input: 0,
        cost_output: 0.1,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])

    const builder = database('models')
    costFilter(builder, { costTier: 'free' })
    const models = await builder

    expect(models).toEqual([])
    await database.destroy()
  })

  describe('when costTier is cheap', () => {
    it('returns models in the middle of the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mid',
          name: 'Mid',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0.1,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'cheap' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('mid')
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'upper',
          name: 'Upper',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0.25,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'cheap' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('upper')
      await database.destroy()
    })

    it('does not return free models below the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'free',
          name: 'Free',
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
      costFilter(builder, { costTier: 'cheap' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('does not return models above the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'expensive',
          name: 'Expensive',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0.26,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'cheap' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })
  })

  describe('when costTier is budget', () => {
    it('returns models in the middle of the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mid',
          name: 'Mid',
          context_length: 1000,
          cost_input: 0,
          cost_output: 1,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'budget' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('mid')
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'upper',
          name: 'Upper',
          context_length: 1000,
          cost_input: 0,
          cost_output: 1.7,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'budget' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('upper')
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'lower',
          name: 'Lower',
          context_length: 1000,
          cost_input: 0,
          cost_output: 0.25,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'budget' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('does not return models above the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'expensive',
          name: 'Expensive',
          context_length: 1000,
          cost_input: 0,
          cost_output: 1.71,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'budget' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })
  })

  describe('when costTier is standard', () => {
    it('returns models in the middle of the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mid',
          name: 'Mid',
          context_length: 1000,
          cost_input: 0,
          cost_output: 5,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('mid')
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'upper',
          name: 'Upper',
          context_length: 1000,
          cost_input: 0,
          cost_output: 15,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('upper')
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'lower',
          name: 'Lower',
          context_length: 1000,
          cost_input: 0,
          cost_output: 1.7,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('does not return models above the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'expensive',
          name: 'Expensive',
          context_length: 1000,
          cost_input: 0,
          cost_output: 15.01,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('includes dynamic delegation models', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'delegated',
          name: 'Delegated',
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
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('delegated')
      await database.destroy()
    })
  })

  describe('when costTier is premium', () => {
    it('returns models in the middle of the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'mid',
          name: 'Mid',
          context_length: 1000,
          cost_input: 0,
          cost_output: 20,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('mid')
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'upper',
          name: 'Upper',
          context_length: 1000,
          cost_input: 0,
          cost_output: 30,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models).toHaveLength(1)
      expect(models[0].identifier).toBe('upper')
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'lower',
          name: 'Lower',
          context_length: 1000,
          cost_input: 0,
          cost_output: 15,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })

    it('does not return models above the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('models').insert([
        {
          provider_id: 1,
          identifier: 'expensive',
          name: 'Expensive',
          context_length: 1000,
          cost_input: 0,
          cost_output: 30.01,
          dynamic_delegation: false,
          modality: 'text->text',
          supported_parameters: '[]',
          supports_reasoning: false,
          can_disable_reasoning: false,
          reasoning_options: '{}',
        },
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })
  })

  it('when costTier is ultra, returns models above the range', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'expensive',
        name: 'Expensive',
        context_length: 1000,
        cost_input: 0,
        cost_output: 100,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])

    const builder = database('models')
    costFilter(builder, { costTier: 'ultra' })
    const models = await builder

    expect(models).toHaveLength(1)
    expect(models[0].identifier).toBe('expensive')
    await database.destroy()
  })

  it('when costTier is ultra, does not return models at the lower boundary', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'lower',
        name: 'Lower',
        context_length: 1000,
        cost_input: 0,
        cost_output: 30,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])

    const builder = database('models')
    costFilter(builder, { costTier: 'ultra' })
    const models = await builder

    expect(models).toEqual([])
    await database.destroy()
  })
})
