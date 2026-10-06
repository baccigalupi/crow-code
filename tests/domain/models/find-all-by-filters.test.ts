import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { ModelEntity } from '../../../src/domain/models/model.ts'
import { Environment } from '../../../src/env-vars.ts'
import { modelFindAllByFilters } from '../../../src/domain/models/find-all-by-filters.ts'
import {
  cleanDatabase,
  createTestDatabase,
} from '../../support/test-database.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('modelFindAllByFilters', () => {
  it('when models match, returns ModelEntity instances ordered by id', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      id: 1,
      name: 'Provider',
      base_url: 'https://example.com/v1',
      api_key_env_var: 'PROVIDER_API_KEY',
    })
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'disableable',
        name: 'Disableable',
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
    const envars = new Environment({ PROVIDER_API_KEY: 'secret' })
    const applicationData = mockApplicationData({ database, logger, envars })

    const models = await modelFindAllByFilters(applicationData, {
      type: 'chat',
    }).all()

    expect(models).toHaveLength(2)
    expect(models[0].identifier()).toBe('disableable')
    expect(models[1].identifier()).toBe('free')
    expect(models[0]).toBeInstanceOf(ModelEntity)
    expect(models[1]).toBeInstanceOf(ModelEntity)
    expect(models[0].modelEndpoint()).toEqual({
      baseURL: 'https://example.com/v1',
      apiKey: 'secret',
      model: 'disableable',
      providerId: 1,
    })
    await database.destroy()
  })

  it('when limit is given, returns at most that many models', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'disableable',
        name: 'Disableable',
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
        cost_input: 0.05,
        cost_output: 0.15,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      type: 'chat',
      limit: 1,
    }).all()

    expect(models).toHaveLength(1)
    expect(models[0].identifier()).toBe('disableable')
    await database.destroy()
  })

  it('when the query fails, logs the error and returns an empty array', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    await cleanDatabase(database)
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      type: 'chat',
    }).all()

    expect(models).toEqual([])
    assertSpyCall(loggerErrorSpy, 0)
    await database.destroy()
  })

  it('when type is given, filters with reasoningFilter', async () => {
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
      {
        provider_id: 1,
        identifier: 'chat',
        name: 'Chat',
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
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      type: 'dynamic',
    }).all()

    expect(models).toHaveLength(1)
    expect(models[0].identifier()).toBe('delegated')
    await database.destroy()
  })

  it('when costTier is given, filters with costFilter', async () => {
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
        cost_input: 0.05,
        cost_output: 0.1,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
      {
        provider_id: 1,
        identifier: 'budget',
        name: 'Budget',
        context_length: 1000,
        cost_input: 0.5,
        cost_output: 1.0,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      costTier: 'budget',
    }).all()

    expect(models).toHaveLength(1)
    expect(models[0].identifier()).toBe('budget')
    await database.destroy()
  })

  it('when a model outputs embeddings, excludes it', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'embedding',
        name: 'Embedding',
        context_length: 1000,
        cost_input: 0.01,
        cost_output: 0,
        dynamic_delegation: false,
        modality: 'text->embeddings',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
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
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      costTier: 'free',
    }).all()

    expect(models).toHaveLength(1)
    expect(models[0].identifier()).toBe('free')
    await database.destroy()
  })

  it('when costTier and type are given, applies both filters', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'cheap-chat',
        name: 'Cheap Chat',
        context_length: 1000,
        cost_input: 0.05,
        cost_output: 0.1,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
      {
        provider_id: 1,
        identifier: 'cheap-mandatory',
        name: 'Cheap Mandatory',
        context_length: 1000,
        cost_input: 0.05,
        cost_output: 0.1,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: true,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
      {
        provider_id: 1,
        identifier: 'free-chat',
        name: 'Free Chat',
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
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      costTier: 'cheap',
      type: 'chat',
    }).all()

    expect(models).toHaveLength(1)
    expect(models[0].identifier()).toBe('cheap-chat')
    await database.destroy()
  })

  it('when costTier and type are given, groups each filter so the standard-tier OR cannot bypass the type filter', async () => {
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
      {
        provider_id: 1,
        identifier: 'standard-chat',
        name: 'Standard Chat',
        context_length: 1000,
        cost_input: 2,
        cost_output: 5,
        dynamic_delegation: false,
        modality: 'text->text',
        supported_parameters: '[]',
        supports_reasoning: false,
        can_disable_reasoning: false,
        reasoning_options: '{}',
      },
    ])
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      costTier: 'standard',
      type: 'chat',
    }).all()

    expect(models).toHaveLength(1)
    expect(models[0].identifier()).toBe('standard-chat')
    await database.destroy()
  })

  it('when limit is omitted, returns at most five models', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'm1',
        name: 'M1',
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
        identifier: 'm2',
        name: 'M2',
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
        identifier: 'm3',
        name: 'M3',
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
        identifier: 'm4',
        name: 'M4',
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
        identifier: 'm5',
        name: 'M5',
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
        identifier: 'm6',
        name: 'M6',
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
    const applicationData = mockApplicationData({ database, logger })

    const models = await modelFindAllByFilters(applicationData, {
      type: 'chat',
    }).all()

    expect(models).toHaveLength(5)
    expect(models[0].identifier()).toBe('m1')
    expect(models[1].identifier()).toBe('m2')
    expect(models[2].identifier()).toBe('m3')
    expect(models[3].identifier()).toBe('m4')
    expect(models[4].identifier()).toBe('m5')
    await database.destroy()
  })
})
