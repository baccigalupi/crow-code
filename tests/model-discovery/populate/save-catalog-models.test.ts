import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import type { Knex } from 'knex'
import pino from 'pino'
import { saveCatalogModels } from '../../../src/model-discovery/populate/save-catalog-models.ts'
import type { CatalogModel } from '../../../src/model-discovery/types.ts'
import { createTestDatabase } from '../../support/test-database.ts'

describe('saveCatalogModels', () => {
  it('when given models, inserts one row per model with the provider id', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }
    const other = { ...model, id: 'author/other' }

    await saveCatalogModels(database, 7, [model, other], logger)

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].provider_id).toBe(7)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[1].provider_id).toBe(7)
    expect(rows[1].identifier).toBe('author/other')
    await database.destroy()
  })

  it('when given a model, maps catalog fields onto the model columns', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }

    await saveCatalogModels(database, 1, [model], logger)

    const row = await database('models').first()
    expect(row.identifier).toBe('author/model')
    expect(row.name).toBe('Model')
    expect(row.context_length).toBe(128000)
    expect(row.cost_input).toBe(1.5)
    expect(row.cost_output).toBe(3)
    expect(row.dynamic_delegation).toBe(0)
    expect(row.modality).toBe('text->text')
    expect(row.supported_parameters).toBe('["temperature"]')
    expect(row.supports_reasoning).toBe(1)
    expect(row.can_disable_reasoning).toBe(1)
    expect(row.reasoning_options).toBe('{"mandatory":false}')
    expect(Object.keys(row)).not.toContain('provider')
    await database.destroy()
  })

  it('when the provider already has models, replaces them with the new set', async () => {
    const logger = pino({ enabled: false })
    const database = await createTestDatabase(logger)
    const storedModel = {
      provider_id: 1,
      identifier: 'author/old',
      name: 'Old',
      context_length: 1000,
      cost_input: 1,
      cost_output: 2,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    }
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }
    await database('models').insert(storedModel)
    await database('models').insert({
      ...storedModel,
      provider_id: 2,
      identifier: 'author/kept',
    })

    await saveCatalogModels(database, 1, [model], logger)

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].provider_id).toBe(2)
    expect(rows[0].identifier).toBe('author/kept')
    expect(rows[1].provider_id).toBe(1)
    expect(rows[1].identifier).toBe('author/model')
    await database.destroy()
  })

  it('when the payload lists the same model twice, logs the error and saves the rest', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }

    await saveCatalogModels(database, 1, [
      model,
      { ...model },
      { ...model, id: 'author/other' },
    ], logger)

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[1].identifier).toBe('author/other')
    assertSpyCall(loggerErrorSpy, 0)
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'UNIQUE constraint failed',
    )
    expect(loggerErrorSpy.calls).toHaveLength(1)
    await database.destroy()
  })

  it('when given no models, leaves existing rows unchanged', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    const storedModel = {
      provider_id: 1,
      identifier: 'author/old',
      name: 'Old',
      context_length: 1000,
      cost_input: 1,
      cost_output: 2,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    }
    await database('models').insert(storedModel)

    await saveCatalogModels(database, 1, [], logger)

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].identifier).toBe('author/old')
    expect(loggerErrorSpy.calls).toHaveLength(0)
    await database.destroy()
  })

  it('when no model can be saved, rolls back the refresh and logs an error', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = await createTestDatabase(logger)
    await database('models').insert({
      provider_id: 1,
      identifier: 'author/kept',
      name: 'Kept',
      context_length: 1000,
      cost_input: 1,
      cost_output: 2,
      dynamic_delegation: false,
      modality: 'text->text',
      supported_parameters: '[]',
      supports_reasoning: false,
      can_disable_reasoning: false,
      reasoning_options: '{}',
    })
    const model = {
      id: 'author/model',
      name: undefined,
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }

    await saveCatalogModels(database, 1, [
      model as unknown as CatalogModel,
    ], logger)

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].identifier).toBe('author/kept')
    expect(loggerErrorSpy.calls.length).toBeGreaterThan(0)
    await database.destroy()
  })

  it('when the transaction fails, logs the rollback error', async () => {
    const logger = pino({ enabled: false })
    using loggerErrorSpy = spy(logger, 'error')
    const database = {
      transaction: () => Promise.reject(new Error('disk gone')),
    } as unknown as Knex
    const model = {
      id: 'author/model',
      name: 'Model',
      provider: 'nous' as const,
      contextLength: 128000,
      costInput: 1.5,
      costOutput: 3,
      dynamicDelegation: false,
      modality: 'text->text',
      supportedParameters: ['temperature'],
      supportsReasoning: true,
      canDisableReasoning: true,
      reasoningOptions: { mandatory: false },
    }

    await saveCatalogModels(database, 9, [model], logger)

    expect(loggerErrorSpy.calls[0].args[0]).toContain('disk gone')
  })
})
