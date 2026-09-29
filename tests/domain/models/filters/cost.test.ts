import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import pino from 'pino'
import { costFilter } from '../../../../src/domain/models/filters/cost.ts'
import { createTestDatabase } from '../../../../tests/support/test-database.ts'
import {
  testModelRow,
  testProviderRow,
} from '../../../../tests/support/model-rows.ts'

describe('costFilter', () => {
  it('returns free models when costTier is free', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(
      testProviderRow({ api_key_env_var: null }),
    )
    await database('models').insert([
      testModelRow({ identifier: 'free', cost_output: 0 }),
      testModelRow({ identifier: 'cheap', cost_output: 0.1 }),
    ])

    const builder = database('models')
    costFilter(builder, { costTier: 'free' })
    const models = await builder

    expect(models.map((model: { identifier: string }) => model.identifier))
      .toEqual(['free'])
    await database.destroy()
  })

  it('does not match low-cost models when costTier is free', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert(
      testProviderRow({ api_key_env_var: null }),
    )
    await database('models').insert([
      testModelRow({ identifier: 'cheap', cost_output: 0.1 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'mid', cost_output: 0.1 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'cheap' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['mid'])
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'upper', cost_output: 0.25 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'cheap' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['upper'])
      await database.destroy()
    })

    it('does not return free models below the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'free', cost_output: 0 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'expensive', cost_output: 0.26 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'mid', cost_output: 1 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'budget' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['mid'])
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'upper', cost_output: 1.7 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'budget' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['upper'])
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'lower', cost_output: 0.25 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'expensive', cost_output: 1.71 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'mid', cost_output: 5 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['mid'])
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'upper', cost_output: 15 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['upper'])
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'lower', cost_output: 1.7 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'expensive', cost_output: 15.01 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({
          identifier: 'delegated',
          dynamic_delegation: 1,
          cost_output: null,
        }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'standard' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['delegated'])
      await database.destroy()
    })
  })

  describe('when costTier is premium', () => {
    it('returns models in the middle of the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'mid', cost_output: 20 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['mid'])
      await database.destroy()
    })

    it('returns models at the upper boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'upper', cost_output: 30 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['upper'])
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'lower', cost_output: 15 }),
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
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'expensive', cost_output: 30.01 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'premium' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })
  })

  describe('when costTier is ultra', () => {
    it('returns models above the range', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'expensive', cost_output: 100 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'ultra' })
      const models = await builder

      expect(models.map((model: { identifier: string }) => model.identifier))
        .toEqual(['expensive'])
      await database.destroy()
    })

    it('does not return models at the lower boundary', async () => {
      const logger = pino({ enabled: false })
      const database = await createTestDatabase(logger)
      await database('providers').insert(
        testProviderRow({ api_key_env_var: null }),
      )
      await database('models').insert([
        testModelRow({ identifier: 'lower', cost_output: 30 }),
      ])

      const builder = database('models')
      costFilter(builder, { costTier: 'ultra' })
      const models = await builder

      expect(models).toEqual([])
      await database.destroy()
    })
  })
})
