import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import pino from 'pino'
import { ModelEntity } from '../../../src/domain/models/model.ts'
import { modelFindCheapNoReasoning } from '../../../src/domain/models/find-cheap-no-reasoning.ts'
import {
  cleanDatabase,
  createTestDatabase,
} from '../../support/test-database.ts'

describe('modelFindCheapNoReasoning', () => {
  it('returns eligible models in insertion order', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://nous.example',
      models_path: null,
      api_key_env_var: null,
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

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models.map((model) => model.identifier())).toEqual([
      'disableable',
      'free',
    ])
    for (const model of models) expect(model).toBeInstanceOf(ModelEntity)
    await database.destroy()
  })

  it('excludes models with mandatory reasoning', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://nous.example',
      models_path: null,
      api_key_env_var: null,
    })
    await database('models').insert([
      {
        provider_id: 1,
        identifier: 'mandatory',
        name: 'Mandatory',
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

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models).toEqual([])
    await database.destroy()
  })

  it('excludes dynamic delegation models', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://nous.example',
      models_path: null,
      api_key_env_var: null,
    })
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

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models).toEqual([])
    await database.destroy()
  })

  it('excludes embedding models', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://nous.example',
      models_path: null,
      api_key_env_var: null,
    })
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

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models.map((model) => model.identifier())).toEqual(['free'])
    await database.destroy()
  })

  it('when given a count, limits the results', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    await database('providers').insert({
      name: 'nous',
      base_url: 'https://nous.example',
      models_path: null,
      api_key_env_var: null,
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

    const models = await modelFindCheapNoReasoning(database, logger).first(1)

    expect(models.map((model) => model.identifier())).toEqual(['disableable'])
    await database.destroy()
  })

  it('when the table is empty, returns an empty array', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models).toEqual([])
    await database.destroy()
  })

  it('when the query fails, logs the error and returns an empty array', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    await cleanDatabase(database)

    const models = await modelFindCheapNoReasoning(database, logger).first(10)

    expect(models).toEqual([])
    assertSpyCall(loggerErrorSpy, 0)
    await database.destroy()
  })
})
