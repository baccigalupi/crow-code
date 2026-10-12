import { describe, it } from 'node:test'
import { expect } from '@std/expect'
import { assertSpyCall, spy } from '@std/testing/mock'
import type { Knex } from 'knex'
import pino from 'pino'
import { saveCatalogModels } from '../../../src/model-discovery/populate/save-catalog-models.ts'
import type { CatalogModel } from '../../../src/model-discovery/types.ts'
import { mockApplicationData } from '../../support/mock-application-data.ts'

describe('saveCatalogModels', () => {
  it('when given models, inserts one row per model with the provider id', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    const database = await applicationData.database()
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

    await saveCatalogModels(applicationData, 7, [
      model,
      other,
    ]).run()

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].provider_id).toBe(7)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[1].provider_id).toBe(7)
    expect(rows[1].identifier).toBe('author/other')
  })

  it('when given a model, maps catalog fields onto the model columns', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    const database = await applicationData.database()
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

    await saveCatalogModels(applicationData, 1, [
      model,
    ]).run()

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
  })

  it('when the provider already has models, replaces them with the new set', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    const database = await applicationData.database()
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

    await saveCatalogModels(applicationData, 1, [
      model,
    ]).run()

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].provider_id).toBe(2)
    expect(rows[0].identifier).toBe('author/kept')
    expect(rows[1].provider_id).toBe(1)
    expect(rows[1].identifier).toBe('author/model')
  })

  it('when the payload lists the same model twice, logs the error and saves the rest', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const database = await applicationData.database()
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

    await saveCatalogModels(applicationData, 1, [
      model,
      { ...model },
      { ...model, id: 'author/other' },
    ]).run()

    const rows = await database('models').orderBy('identifier')
    expect(rows).toHaveLength(2)
    expect(rows[0].identifier).toBe('author/model')
    expect(rows[1].identifier).toBe('author/other')
    assertSpyCall(loggerErrorSpy, 0)
    expect(loggerErrorSpy.calls[0].args[0]).toContain(
      'UNIQUE constraint failed',
    )
    expect(loggerErrorSpy.calls).toHaveLength(1)
  })

  it('when given no models, leaves existing rows unchanged', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const database = await applicationData.database()
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

    await saveCatalogModels(applicationData, 1, [])
      .run()

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].identifier).toBe('author/old')
    expect(loggerErrorSpy.calls).toHaveLength(0)
  })

  it('when no model can be saved, rolls back the refresh and logs an error', async () => {
    const logger = pino({ enabled: false })
    const applicationData = mockApplicationData({ logger })
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
    const database = await applicationData.database()
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

    await saveCatalogModels(applicationData, 1, [
      model as unknown as CatalogModel,
    ]).run()

    const rows = await database('models')
    expect(rows).toHaveLength(1)
    expect(rows[0].identifier).toBe('author/kept')
    expect(loggerErrorSpy.calls.length).toBeGreaterThan(0)
  })

  it('when the transaction fails, logs the rollback error', async () => {
    const fakeDatabase = {
      transaction: () => Promise.reject(new Error('disk gone')),
    } as unknown as Knex
    const applicationData = mockApplicationData().withDatabase(fakeDatabase)
    using loggerErrorSpy = spy(applicationData.logger(), 'error')
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

    await saveCatalogModels(applicationData, 9, [
      model,
    ]).run()

    const logged = loggerErrorSpy.calls[0].args[0] as string
    expect(logged).toContain('Model catalog refresh rolled back:')
    expect(logged).toContain(
      'failed delete/insert on "models" for provider_id=9',
    )
    expect(logged).toContain('disk gone')
  })
})
